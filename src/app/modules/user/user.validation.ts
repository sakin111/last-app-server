
import z from "zod";

const createUserValidationSchema = z.object({
        name: z.string("Name is required"),
        email: z.string("Email is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
});





export const UserValidation = {
    createUserValidationSchema,
}