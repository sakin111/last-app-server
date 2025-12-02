import z from "zod";

export const RequestValidation = {
    createRequestValidationSchema: z.object({
        body: z.object({
            travelPlanId: z.string("Invalid travel plan ID"),
            status: z.string().optional()
        })
    })
};
