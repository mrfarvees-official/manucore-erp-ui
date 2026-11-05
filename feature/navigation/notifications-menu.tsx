"use client";

import Link from "next/link";
import { FaBell } from "react-icons/fa";
import { Popover } from "@/components/ui/popover";
import type { AppNotification } from "@/lib/notifications";

export function NotificationsMenu({
  notifications,
}: {
  notifications: AppNotification[];
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Popover
      label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      panelClassName="w-80 max-w-[calc(100vw-2rem)]"
      trigger={
        <span className="relative">
          <FaBell aria-hidden size={18} />
          {unread > 0 && (
            <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      }
    >
      {(close) => (
        <>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">
              Notifications
            </h2>
            {unread > 0 && (
              <span className="text-xs text-gray-500">{unread} unread</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {notifications.map((n) => {
                const content = (
                  <div className="flex gap-3 px-4 py-3">
                    <span
                      aria-hidden
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        n.read ? "bg-transparent" : "bg-blue-600"
                      }`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm ${
                          n.read
                            ? "text-gray-700"
                            : "font-semibold text-gray-900"
                        }`}
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {n.createdAt.slice(0, 16).replace("T", " ")} UTC
                      </p>
                    </div>
                  </div>
                );

                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={close}
                        className="block hover:bg-gray-50"
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </Popover>
  );
}
