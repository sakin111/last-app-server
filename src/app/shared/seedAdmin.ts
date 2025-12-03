import bcryptjs from "bcryptjs";
import { envVar } from "../config/envVar";
import { prisma } from "./prisma";
import { Role, User, UserStatus} from "@prisma/client";
import { UserCreateInput } from "prisma/schema/generate/models";




export const seedAdmin = async () => {
    try {
        const isAdminExist = await prisma.user.findUnique({ 
            where:{
                email: envVar.ADMIN_EMAIL
            }
         })

        if (isAdminExist) {
            console.log("Super Admin Already Exists!");
            return;
        }

        console.log("Trying to create Admin...");

        const hashedPassword = await bcryptjs.hash(envVar.ADMIN_PASS, Number(envVar.JWT_SALT))

    

        const payload:Partial<UserCreateInput>= {
            name: "admin",
            role: Role.ADMIN,
            email: envVar.ADMIN_EMAIL,
            password: hashedPassword,
            userStatus: UserStatus.ACTIVE
        }

        const admin = await prisma.user.create({
            data: payload as UserCreateInput
        })
        console.log("Super Admin Created Successfully \n");
        console.log(admin);
    } catch (error) {
        console.log(error);
    }
}