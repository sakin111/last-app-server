import bcryptjs from "bcryptjs";
import { envVar } from "../config/envVar";
import prisma from "./prisma";
import { Role, User, UserStatus } from "@prisma/client";




export const seedAdmin = async () => {
    try {
        const isAdminExist = await prisma.user.findUnique({ 
            where:{
                email: envVar.ADMIN_EMAIL
            }
         })

        if (isAdminExist) {
            console.log("Admin Already Exists!");
            return;
        }

        console.log("Trying to create Admin...");

        const hashedPassword = await bcryptjs.hash(envVar.ADMIN_PASS, Number(envVar.JWT_SALT))

    

        const payload:Partial<User>= {
            name: "admin",
            role: Role.ADMIN,
            email: envVar.ADMIN_EMAIL,
            password: hashedPassword,
            userStatus: UserStatus.ACTIVE
        }

         await prisma.user.create({
            data: payload as User
        })
        console.log("Admin Created Successfully \n");

    } catch (error) {
        console.log(error);
    }
}