import z from "zod";

export const PaymentValidation = {
    createSubscriptionValidationSchema: z.object({
        body: z.object({
            plan: z.string(),
            endDate: z.string("Invalid end date format").optional(),
            paymentStatus: z.string().optional()
        })
    }),
    createPaymentValidationSchema: z.object({
        body: z.object({
            subscriptionId: z.string("Invalid subscription ID"),
            amount: z.number().positive("Amount must be positive"),
            currency: z.string().default("USD"),
            status: z.string()
        })
    })
};
