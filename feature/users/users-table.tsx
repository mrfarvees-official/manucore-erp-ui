import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import type { User } from "@/lib/users";

export function UsersTable({
  users,
  currentUserId,
  canUpdate,
  emptyMessage,
}: {
  users: User[];
  currentUserId: string;
  canUpdate: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Roles</th>
            <th className="px-4 py-3">Status</th>
            {canUpdate && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-gray-900">
                <Link
                  href={`/admin/users/${user.id}`}
                  className="hover:underline"
                >
                  {user.name}
                </Link>
                {user.id === currentUserId && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    (you)
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3">
                <span className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge
                      key={role}
                      tone={role === "ADMIN" ? "info" : "neutral"}
                    >
                      {role}
                    </Badge>
                  ))}
                  {user.roles.length === 0 && (
                    <span className="text-gray-400">—</span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge tone={user.active ? "success" : "neutral"}>
                  {user.active ? "Active" : "Inactive"}
                </Badge>
              </td>
              {canUpdate && (
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}/edit`}
                    className={buttonClasses({ variant: "link" })}
                  >
                    Edit
                  </Link>
                </td>
              )}
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td
                colSpan={canUpdate ? 5 : 4}
                className="px-4 py-8 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
