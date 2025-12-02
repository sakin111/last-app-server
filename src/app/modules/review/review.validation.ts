import z from "zod";

export const ReviewValidation = {
    createReviewValidationSchema: z.object({
        body: z.object({
            rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
            comment: z.string().min(5, "Comment must be at least 5 characters"),
            targetId: z.string().uuid("Invalid target user ID")
        })
    })
};
