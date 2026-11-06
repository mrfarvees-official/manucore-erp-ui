"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SettingsTabs({
  tabs,
}: {
  tabs: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings sections"
      className="flex gap-6 border-b border-gray-200"
    >
      {tabs.map((tab) => {
        const active =
          tab.href === "/settings"
            ? pathname === "/settings"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 px-1 py-3 text-sm font-medium ${
              active
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
