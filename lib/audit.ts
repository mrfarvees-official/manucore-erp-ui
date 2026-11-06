export type AuditChange = {
  field: string;
  from: string | null;
  to: string | null;
};

export type AuditEvent = {
  id: string;
  occurredAt: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  targetLabel: string | null;
  changes: AuditChange[];
};

export type AuditPage = {
  items: AuditEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  ACCOUNT_SETTINGS_UPDATED: "Account settings updated",
  PASSWORD_CHANGED: "Password changed",
  TENANT_SETTINGS_UPDATED: "Company settings updated",
  DOMAIN_ADDED: "Domain added",
  DOMAIN_VERIFIED: "Domain verified",
  DOMAIN_PRIMARY_CHANGED: "Primary domain changed",
  DOMAIN_REMOVED: "Domain removed",
  USER_CREATED: "User created",
  USER_UPDATED: "User updated",
  ROLE_CREATED: "Role created",
  ROLE_UPDATED: "Role updated",
  ROLE_DELETED: "Role deleted",
};

export const AUDIT_TARGET_TYPES = ["USER", "ROLE", "TENANT", "DOMAIN"] as const;
