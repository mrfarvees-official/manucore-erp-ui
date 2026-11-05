"use client";

import { NavGroup } from "@/lib/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { FaBars } from "react-icons/fa";

function isActive(pathname: string, href: string) {
  return pathname == href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  groups: NavGroup[];
  user: {
    name: string;
    email: string;
  };
  footer: ReactNode;
};

export default function Sidebar({ groups, user, footer }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py3 lg:hidden">
        <span className="font-semibold text-gray-900">ManuCore ERP</span>
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
        >
          <FaBars size={20} />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(true)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-200 px-5 py-4 text-lg font-bold text-gray-900">
          ManuCore ERP
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        prefetch={false}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                          active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                        }`}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))} 
        </nav>
      </aside>
    </>
  );
}
