
import z from "zod";

const createUserValidationSchema = z.object({
        name: z.string().nonempty("Name is required"),
        email: z.string().nonempty("Email is required"),
});





export const UserValidation = {
    createUserValidationSchema,
}