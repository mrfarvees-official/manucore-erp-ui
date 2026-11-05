"use client";

import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FaChevronDown,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { useSignOut } from "@/feature/auth/use-sign-out";

export type MenuUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type Entry = { label: string; icon: IconType; href?: string };

// An entry without an href is shown as "Soon" until its page exists.
const ENTRIES: Entry[] = [
  { label: "My profile", icon: FaUser, href: "/profile" },
  { label: "Settings", icon: FaCog, href: "/settings" },
  { label: "Help & support", icon: FaQuestionCircle },
];

const itemBase = "flex w-full items-center gap-3 px-4 py-2 text-left text-sm";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const picked = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;

  return (
    picked
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function UserMenu({ user }: { user: MenuUser }) {
  const signOut = useSignOut();

  return (
    <Popover
      label="Account menu"
      panelClassName="w-72"
      trigger={
        <>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {initials(user.name)}
          </span>
          <span className="hidden max-w-32 truncate text-sm font-medium sm:block">
            {user.name}
          </span>
          <FaChevronDown
            aria-hidden
            size={10}
            className="hidden text-gray-400 sm:block"
          />
        </>
      }
    >
      {(close) => (
        <>
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <Badge key={role} tone={role === "ADMIN" ? "info" : "neutral"}>
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          <ul className="py-1">
            {ENTRIES.map(({ label, icon: Icon, href }) => (
              <li key={label}>
                {href ? (
                  <Link
                    href={href}
                    onClick={close}
                    className={`${itemBase} text-gray-700 hover:bg-gray-50`}
                  >
                    <Icon aria-hidden size={14} className="text-gray-400" />
                    {label}
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    className={`${itemBase} cursor-not-allowed text-gray-400`}
                  >
                    <Icon aria-hidden size={14} />
                    {label}
                    <span className="ml-auto text-xs">Soon</span>
                  </span>
                )}
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-100 py-1">
            <button
              type="button"
              onClick={() => {
                close();
                void signOut();
              }}
              className={`${itemBase} text-red-600 hover:bg-red-50`}
            >
              <FaSignOutAlt aria-hidden size={14} />
              Sign out
            </button>
          </div>
        </>
      )}
    </Popover>
  );
}
