"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronRight } from "react-icons/fa";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  items: "Items",
  catalog: "Catalog",
  adjustments: "Adjustments",
  admin: "Administration",
  users: "Users",
  roles: "Roles",
  policies: "Policies",
  profile: "My profile",
  settings: "Settings",
  new: "New",
  edit: "Edit",
};

/** What an id segment means depends on the section it sits in. */
const ID_LABELS: Record<string, string> = {
  items: "Edit item",
  users: "Profile",
  roles: "Edit role",
  policies: "Edit policy",
};

/** Section roots that have no page of their own. */
const NOT_LINKABLE = new Set(["inventory", "admin"]);

type Crumb = { label: string; href?: string };

function humanize(segment: string) {
  const text = segment.replace(/[-_]/g, " ");

  return text[0].toUpperCase() + text.slice(1);
}

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    label: UUID.test(segment)
      ? (ID_LABELS[segments[index - 1]] ?? "Details")
      : (LABELS[segment] ?? humanize(segment)),
    href: NOT_LINKABLE.has(segment)
      ? undefined
      : `/${segments.slice(0, index + 1).join("/")}`,
  }));
}

export function Breadcrumbs({ tenantName }: { tenantName: string }) {
  const crumbs = buildCrumbs(usePathname());

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1.5 text-sm">
        <li className="min-w-0">
          <Link
            href="/dashboard"
            className="block truncate font-semibold text-gray-900 hover:underline"
          >
            {tenantName}
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1;

          return (
            <li
              key={`${index}-${crumb.label}`}
              // On phones only the current page is shown after the tenant.
              className={`min-w-0 items-center gap-1.5 ${last ? "flex" : "hidden sm:flex"}`}
            >
              <FaChevronRight
                aria-hidden
                size={10}
                className="shrink-0 text-gray-400"
              />
              {crumb.href && !last ? (
                <Link
                  href={crumb.href}
                  className="truncate text-gray-500 hover:text-gray-900 hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={`truncate ${last ? "font-medium text-gray-900" : "text-gray-500"}`}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
