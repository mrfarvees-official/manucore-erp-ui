"use client";

import { useState, type ReactNode } from "react";
import Header from "@/feature/navigation/header";
import Sidebar from "@/feature/navigation/sidebar";
import type { MenuUser } from "@/feature/navigation/user-menu";
import type { NavGroup } from "@/lib/navigation";
import type { AppNotification } from "@/lib/notifications";

export default function AppShell({
  groups,
  tenantName,
  user,
  notifications,
  children,
}: {
  groups: NavGroup[];
  tenantName: string;
  user: MenuUser;
  notifications: AppNotification[];
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <Sidebar
        groups={groups}
        tenantName={tenantName}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          tenantName={tenantName}
          user={user}
          notifications={notifications}
          onMenuClick={() => setMenuOpen(true)}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
