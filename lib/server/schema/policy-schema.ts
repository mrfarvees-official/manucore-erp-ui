import z from "zod";

export const PolicyInputSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(500),
  action: z.string().trim().min(1).max(100),
  resource: z.string().trim().min(1).max(150),
  effect: z.enum(["ALLOW", "DENY"]),
  priority: z
    .enum(["LOW", "MODERATE", "MEDIUM", "HIGH", "CRITICAL"])
    .optional(),
  subjects: z
    .array(
      z.object({
        type: z.enum(["USER", "ROLE", "DEPARTMENT", "SERVICE"]),
        id: z.string().trim().min(1).max(150),
      }),
    )
    .min(1)
    .max(50),
  // Passed through untouched; the backend validates the condition tree.
  conditionGroups: z.array(z.unknown()).max(50).optional(),
});
