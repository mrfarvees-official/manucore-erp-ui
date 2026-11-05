import type { CurrentUser } from "./auth/session";

export type NavItem = {
  label: string;
  href: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

type NavItemDef = NavItem & {
  /** Permission as "RESOURCE:ACTION" */
  requires?: string;
  /** Only for users who can manage authorization policies. */
  adminOnly?: boolean;
};

type NavGroupDef = {
  title: string;
  items: NavItemDef[];
};

const NAVIGATION: NavGroupDef[] = [
  {
    title: "General",
    items: [{ label: "Dashboard", href: "/dashboard" }],
  },
  {
    title: "Inventory",
    items: [
      {
        label: "Stock Items",
        href: "/inventory/items",
        requires: "INVENTORY.ITEMS:READ",
      },
      {
        label: "Catalog",
        href: "/inventory/catalog",
        requires: "INVENTORY.CATALOG:READ",
      },
      {
        label: "Adjustments",
        href: "/inventory/adjustments", 
        requires: "INVENTORY.ADJUSTMENTS:READ",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", href: "/admin/users", adminOnly: true },
      { label: "Roles & Policies", href: "/admin/policies", adminOnly: true },
    ],
  },
];

export function getNavigation(user: CurrentUser): NavGroup[] {
  const allowed = new Set(user.permissions?.allowed ?? []);
  const canManage =
    user.permissions?.canManagePolicies === true ||
    user.roles.includes("ADMIN");

  return NAVIGATION.map((group) => ({
    title: group.title,
    items: group.items
      .filter((item) => {
        if (item.adminOnly) return canManage;
        if (item.requires) return allowed.has(item.requires);
        return true;
      })
      .map(({ label, href }) => ({ label, href })),
  })).filter((group) => group.items.length > 0);
}
