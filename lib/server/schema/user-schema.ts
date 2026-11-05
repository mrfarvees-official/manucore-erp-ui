import z from "zod";

const RoleSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z][A-Za-z0-9_]{1,49}$/);

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  roles: z.array(RoleSchema).min(1).max(20),
  active: z.boolean().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(1).max(200),
  roles: z.array(RoleSchema).min(1).max(20),
  active: z.boolean(),
  password: z.string().min(8).max(72).optional(),
});
