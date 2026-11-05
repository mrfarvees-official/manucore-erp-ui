import z from "zod";

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z][A-Za-z0-9_]{1,49}$/),
  description: z.string().trim().max(255).optional(),
});

export const UpdateRoleSchema = z.object({
  description: z.string().trim().max(255).optional(),
});
