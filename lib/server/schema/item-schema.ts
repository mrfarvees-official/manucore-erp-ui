import z from "zod";

export const CreateItemSchema = z.object({
  sku: z.string().trim().min(1).max(64),
  name: z.string().trim().min(1).max(200),
  unit: z.string().trim().min(1).max(20),
  quantity: z.number().finite().min(0).max(1e15),
});

export const UpdateItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  unit: z.string().trim().min(1).max(20),
});

export const AdjustStockSchema = z.object({
    delta: z
        .number()
        .finite()
        .refine((n) => n !== 0, "Delta must not be zero")
        .refine((n) => Math.abs(n) <= 1e15, "Delta is too large"),
    reason: z.string().trim().max(255).optional(),
});