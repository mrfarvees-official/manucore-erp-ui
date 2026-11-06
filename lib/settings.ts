export type AccountSettings = {
  name: string;
  email: string;
  timezone: string | null;
  locale: string | null;
  effectiveTimezone: string;
  effectiveLocale: string;
};

export type TenantSettings = {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  locale: string;
};

export type TenantDomain = {
  id: string;
  domain: string;
  type: "SUBDOMAIN" | "CUSTOM";
  status: "PENDING" | "VERIFIED";
  primary: boolean;
  verificationRecordName: string | null;
  verificationRecordValue: string | null;
  verifiedAt: string | null;
  createdAt: string;
  lastCheckedAt: string | null;
  lastCheckResult: string | null;
};
