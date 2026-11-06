import z from "zod";

const LOCALE = /^[a-z]{2,3}(-[A-Z]{2})?$/;

export const AccountSettingsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  timezone: z.string().trim().max(64).optional(),
  locale: z.string().trim().regex(LOCALE).optional(),
});

export const PasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(72),
});

export const TenantSettingsSchema = z.object({
  name: z.string().trim().min(1).max(200),
  timezone: z.string().trim().min(1).max(64),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/),
  locale: z.string().trim().regex(LOCALE),
});

export const AddDomainSchema = z.object({
  domain: z.string().trim().min(3).max(253),
});

export const PrimaryDomainSchema = z.object({ primary: z.literal(true) });
