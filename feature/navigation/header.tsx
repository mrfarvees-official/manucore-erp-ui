"use client";

import { FaBars } from "react-icons/fa";
import { Breadcrumbs } from "@/feature/navigation/breadcrumbs";
import { NotificationsMenu } from "@/feature/navigation/notifications-menu";
import { UserMenu, type MenuUser } from "@/feature/navigation/user-menu";
import type { AppNotification } from "@/lib/notifications";

export default function Header({
  tenantName,
  user,
  notifications,
  onMenuClick,
}: {
  tenantName: string;
  user: MenuUser;
  notifications: AppNotification[];
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
      >
        <FaBars aria-hidden size={20} />
      </button>

      <Breadcrumbs tenantName={tenantName} />

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <NotificationsMenu notifications={notifications} />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
