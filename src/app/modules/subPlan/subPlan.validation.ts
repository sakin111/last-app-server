import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stripeId: z.string().startsWith("price_"),
  duration: z.number().int().positive(),
});
