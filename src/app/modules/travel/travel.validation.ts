import z from "zod";

export const TravelValidation = {
    createTravelValidationSchema: z.object({
            title: z.string().min(3, "Title must be at least 3 characters"),
            destination: z.string().min(2, "Destination must be at least 2 characters"),
            startDate: z.iso.datetime("Invalid start date format"),
            endDate: z.iso.datetime("Invalid end date format"),
            budgetRange: z.string(),
            travelType: z.string(),
            description: z.string().optional(),
            visibility: z.coerce.boolean().optional().default(true)
 
    })
};
