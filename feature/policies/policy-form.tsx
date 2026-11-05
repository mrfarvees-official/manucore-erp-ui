"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Catalog, ConditionGroup, Policy, Subject } from "@/lib/policies";
import { Button } from "@/components/ui/button";

const field =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400";
const card = "rounded-lg border border-gray-200 bg-white p-5";

const MAX_DEPTH = 3; // levels of sub-groups offered in this editor (backend allows 16)
const MAX_NODES = 200; // backend limit
const NO_VALUE = new Set(["EXISTS", "NOT_EXISTS"]);
const PLACEHOLDERS: Record<string, string> = {
  BETWEEN: "lower,upper",
  IN_CIDR: "10.0.0.0/8",
  IN: "value1,value2",
  NOT_IN: "value1,value2",
};

type ConditionDraft = { attribute: string; operator: string; value: string };
type GroupDraft = {
  operator: string;
  conditions: ConditionDraft[];
  groups: GroupDraft[];
};

function toDraft(group: ConditionGroup): GroupDraft {
  return {
    operator: group.operator,
    conditions: (group.conditions ?? []).map((c) => ({
      attribute: c.attribute,
      operator: c.operator,
      value: c.value ?? "",
    })),
    groups: (group.groups ?? []).map(toDraft),
  };
}

function toPayload(group: GroupDraft): ConditionGroup {
  return {
    operator: group.operator,
    conditions: group.conditions.map((c) => ({
      attribute: c.attribute,
      operator: c.operator,
      value: NO_VALUE.has(c.operator) ? null : c.value.trim(),
    })),
    groups: group.groups.map(toPayload),
  };
}

function newCondition(catalog: Catalog): ConditionDraft {
  return {
    attribute: catalog.conditionAttributes[0] ?? "",
    operator: catalog.conditionOperators[0] ?? "",
    value: "",
  };
}

function newGroup(catalog: Catalog): GroupDraft {
  return {
    operator: catalog.logicalOperators[0] ?? "AND",
    conditions: [newCondition(catalog)],
    groups: [],
  };
}

/** Mirrors the backend rules so problems are explained before saving. */
function checkCondition(c: ConditionDraft): string | null {
  const value = c.value.trim();

  switch (c.operator) {
    case "EXISTS":
    case "NOT_EXISTS":
      return null;
    case "BETWEEN": {
      const bounds = value.split(",");
      return bounds.length === 2 && bounds[0].trim() && bounds[1].trim()
        ? null
        : "BETWEEN needs a value like lower,upper.";
    }
    case "IN_CIDR":
      return /^[0-9a-fA-F:.]+\/[0-9]{1,3}$/.test(value)
        ? null
        : "IN_CIDR needs a value like 10.0.0.0/8.";
    case "IN":
    case "NOT_IN":
      return value.split(",").some((v) => v.trim())
        ? null
        : `${c.operator} needs at least one value.`;
    default:
      return value ? null : `${c.operator} needs a value.`;
  }
}

function validateGroups(groups: GroupDraft[]): string | null {
  let nodes = 0;

  function checkGroup(group: GroupDraft): string | null {
    if (group.conditions.length === 0 && group.groups.length === 0) {
      return "Each condition group needs at least one condition or sub-group.";
    }

    nodes += 1 + group.conditions.length;

    for (const condition of group.conditions) {
      const problem = checkCondition(condition);
      if (problem) return problem;
    }

    for (const child of group.groups) {
      const problem = checkGroup(child);
      if (problem) return problem;
    }

    return null;
  }

  for (const group of groups) {
    const problem = checkGroup(group);
    if (problem) return problem;
  }

  return nodes > MAX_NODES
    ? `A policy may contain at most ${MAX_NODES} conditions and groups.`
    : null;
}

function GroupEditor({
  group,
  catalog,
  depth,
  onChange,
  onRemove,
}: {
  group: GroupDraft;
  catalog: Catalog;
  depth: number;
  onChange: (group: GroupDraft) => void;
  onRemove: () => void;
}) {
  function updateCondition(index: number, patch: Partial<ConditionDraft>) {
    onChange({
      ...group,
      conditions: group.conditions.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    });
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 p-3 ${
        depth % 2 === 0 ? "bg-gray-50" : "bg-white"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span>Match</span>
        <select
          aria-label="Group operator"
          value={group.operator}
          onChange={(e) => onChange({ ...group, operator: e.target.value })}
          className={`${field} w-36`}
        >
          {catalog.logicalOperators.map((op) => (
            <option key={op} value={op}>
              {op === "AND" ? "ALL (AND)" : op === "OR" ? "ANY (OR)" : op}
            </option>
          ))}
        </select>
        <span>of the following</span>
        <Button variant="linkDanger" className="ml-auto" onClick={onRemove}>
          Remove group
        </Button>
      </div>

      <div className="space-y-2">
        {group.conditions.map((condition, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <select
              aria-label="Attribute"
              value={condition.attribute}
              onChange={(e) =>
                updateCondition(index, { attribute: e.target.value })
              }
              className={`${field} min-w-0 flex-1 basis-36`}
            >
              {catalog.conditionAttributes.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <select
              aria-label="Operator"
              value={condition.operator}
              onChange={(e) =>
                updateCondition(index, { operator: e.target.value })
              }
              className={`${field} min-w-0 flex-1 basis-32`}
            >
              {catalog.conditionOperators.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <input
              aria-label="Value"
              maxLength={2000}
              disabled={NO_VALUE.has(condition.operator)}
              value={NO_VALUE.has(condition.operator) ? "" : condition.value}
              placeholder={
                NO_VALUE.has(condition.operator)
                  ? "No value needed"
                  : (PLACEHOLDERS[condition.operator] ?? "value")
              }
              onChange={(e) =>
                updateCondition(index, { value: e.target.value })
              }
              className={`${field} min-w-0 flex-2 basis-40`}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                onChange({
                  ...group,
                  conditions: group.conditions.filter((_, i) => i !== index),
                })
              }
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {group.groups.length > 0 && (
        <div className="mt-3 space-y-3">
          {group.groups.map((child, index) => (
            <GroupEditor
              key={index}
              group={child}
              catalog={catalog}
              depth={depth + 1}
              onChange={(updated) =>
                onChange({
                  ...group,
                  groups: group.groups.map((g, i) =>
                    i === index ? updated : g,
                  ),
                })
              }
              onRemove={() =>
                onChange({
                  ...group,
                  groups: group.groups.filter((_, i) => i !== index),
                })
              }
            />
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-4 text-sm font-medium text-blue-700">
        <Button
          variant="link"
          onClick={() =>
            onChange({
              ...group,
              conditions: [...group.conditions, newCondition(catalog)],
            })
          }
        >
          + Condition
        </Button>
        {depth < MAX_DEPTH && (
          <Button
            variant="link"
            onClick={() =>
              onChange({
                ...group,
                groups: [...group.groups, newGroup(catalog)],
              })
            }
          >
            + Sub-group
          </Button>
        )}
      </div>
    </div>
  );
}

export function PolicyForm({
  catalog,
  policy,
  roles = [],
}: {
  catalog: Catalog;
  policy?: Policy;
  roles?: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(policy?.name ?? "");
  const [description, setDescription] = useState(policy?.description ?? "");
  const [action, setAction] = useState<string>(
    policy?.action ?? catalog.actions[0] ?? "",
  );
  const [resource, setResource] = useState<string>(
    policy?.resource ?? catalog.resources[0] ?? "",
  );
  const [effect, setEffect] = useState<string>(policy?.effect ?? "ALLOW");
  const [priority, setPriority] = useState<string>(
    policy?.priority ?? "MEDIUM",
  );
  const [subjects, setSubjects] = useState<Subject[]>(
    policy?.subjects.length ? policy.subjects : [{ type: "ROLE", id: "" }],
  );
  const [groups, setGroups] = useState<GroupDraft[]>(() =>
    (policy?.conditionGroups ?? []).map(toDraft),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateSubject(index: number, patch: Partial<Subject>) {
    setSubjects((current) =>
      current.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const problem = validateGroups(groups);

    if (problem) {
      setError(problem);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        policy ? `/api/policies/${policy.id}` : "/api/policies",
        {
          method: policy ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            action,
            resource,
            effect,
            priority,
            subjects: subjects.map((s) => ({ type: s.type, id: s.id.trim() })),
            conditionGroups: groups.map(toPayload),
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.message ?? "Unable to save the policy.");
        return;
      }

      router.push("/admin/policies");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Left: policy details */}
        <section className={card}>
          <h2 className="mb-4 text-base font-semibold">Policy details</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="policy-name"
                className="mb-1 block text-sm font-medium"
              >
                Name
              </label>
              <input
                id="policy-name"
                required
                maxLength={150}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>

            <div>
              <label
                htmlFor="policy-description"
                className="mb-1 block text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="policy-description"
                required
                maxLength={500}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={field}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="policy-action"
                  className="mb-1 block text-sm font-medium"
                >
                  Action
                </label>
                <select
                  id="policy-action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className={field}
                >
                  {catalog.actions.map((a) => (
                    <option key={a} value={a}>
                      {a === "*" ? "* (all actions)" : a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="policy-resource"
                  className="mb-1 block text-sm font-medium"
                >
                  Resource
                </label>
                <select
                  id="policy-resource"
                  value={resource}
                  onChange={(e) => setResource(e.target.value)}
                  className={field}
                >
                  {catalog.resources.map((r) => (
                    <option key={r} value={r}>
                      {r === "*" ? "* (all resources)" : r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="policy-effect"
                  className="mb-1 block text-sm font-medium"
                >
                  Effect
                </label>
                <select
                  id="policy-effect"
                  value={effect}
                  onChange={(e) => setEffect(e.target.value)}
                  className={field}
                >
                  {catalog.effects.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="policy-priority"
                  className="mb-1 block text-sm font-medium"
                >
                  Priority
                </label>
                <select
                  id="policy-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={field}
                >
                  {catalog.priorities.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Right: subjects on top, conditions below */}
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-1 text-base font-semibold">Subjects</h2>
            <p className="mb-4 text-sm text-gray-500">
              Who this policy applies to.
            </p>

            <div className="space-y-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    aria-label="Subject type"
                    value={subject.type}
                    onChange={(e) =>
                      updateSubject(index, {
                        type: e.target.value as Subject["type"],
                      })
                    }
                    style={{ width: "9rem" }}
                    className={`${field} shrink-0`}
                  >
                    {catalog.subjectTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {subject.type === "ROLE" && roles.length > 0 ? (
                    <select
                      aria-label="Role"
                      required
                      value={subject.id}
                      onChange={(e) =>
                        updateSubject(index, { id: e.target.value })
                      }
                      className={field}
                    >
                      <option value="" disabled>
                        Select a role
                      </option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      {subject.id !== "" && !roles.includes(subject.id) && (
                        <option value={subject.id}>
                          {subject.id} (not in roles list)
                        </option>
                      )}
                    </select>
                  ) : (
                    <input
                      aria-label="Subject id"
                      required
                      maxLength={150}
                      value={subject.id}
                      placeholder="e.g. ADMIN"
                      onChange={(e) =>
                        updateSubject(index, { id: e.target.value })
                      }
                      className={field}
                    />
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    disabled={subjects.length === 1}
                    onClick={() =>
                      setSubjects((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="link"
              className="mt-3"
              onClick={() =>
                setSubjects((current) => [...current, { type: "ROLE", id: "" }])
              }
            >
              + Add subject
            </Button>
          </section>

          <section className={card}>
            <h2 className="mb-1 text-base font-semibold">Conditions</h2>
            <p className="mb-4 text-sm text-gray-500">
              Optional. When there are several top-level groups, all of them
              must match.
            </p>

            <div className="space-y-3">
              {groups.length === 0 && (
                <p className="text-sm text-gray-400">No conditions added.</p>
              )}

              {groups.map((group, index) => (
                <GroupEditor
                  key={index}
                  group={group}
                  catalog={catalog}
                  depth={0}
                  onChange={(updated) =>
                    setGroups((current) =>
                      current.map((g, i) => (i === index ? updated : g)),
                    )
                  }
                  onRemove={() =>
                    setGroups((current) =>
                      current.filter((_, i) => i !== index),
                    )
                  }
                />
              ))}
            </div>

            <Button
              variant="link"
              className="mt-3"
              onClick={() =>
                setGroups((current) => [...current, newGroup(catalog)])
              }
            >
              + Add condition group
            </Button>
          </section>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/policies")}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving} loadingText="Saving...">
            {policy ? "Save changes" : "Create policy"}
          </Button>
        </div>
      </div>
    </form>
  );
}
