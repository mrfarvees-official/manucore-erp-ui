import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AUDIT_ACTION_LABELS, type AuditEvent } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";

export function AuditTable({
  events,
  timeZone,
  locale,
  canViewUsers,
}: {
  events: AuditEvent[];
  timeZone: string;
  locale: string;
  canViewUsers: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Who</th>
            <th className="px-4 py-3">What</th>
            <th className="px-4 py-3">On</th>
            <th className="px-4 py-3">Changes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 align-top">
          {events.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                {formatDateTime(e.occurredAt, timeZone, locale)}
              </td>
              <td className="px-4 py-3">
                {e.actorId && canViewUsers ? (
                  <Link
                    href={`/admin/users/${e.actorId}`}
                    className="text-blue-700 hover:underline"
                  >
                    {e.actorName ?? `${e.actorId.slice(0, 8)}…`}
                  </Link>
                ) : (
                  (e.actorName ?? "System")
                )}
              </td>
              <td className="px-4 py-3">
                <Badge tone="info">
                  {AUDIT_ACTION_LABELS[e.action] ?? e.action}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <span className="mr-2 text-xs uppercase text-gray-400">
                  {e.targetType}
                </span>
                {e.targetLabel ?? e.targetId ?? "—"}
              </td>
              <td className="px-4 py-3">
                {e.changes.length === 0 ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <details>
                    <summary className="cursor-pointer text-blue-700">
                      {e.changes.length}{" "}
                      {e.changes.length === 1 ? "change" : "changes"}
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs">
                      {e.changes.map((c, index) => (
                        <li key={`${c.field}-${index}`}>
                          <span className="font-medium text-gray-900">
                            {c.field}
                          </span>
                          :{" "}
                          <span className="text-gray-500 line-through">
                            {c.from ?? "—"}
                          </span>{" "}
                          → <span className="text-gray-900">{c.to ?? "—"}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No recorded changes yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
