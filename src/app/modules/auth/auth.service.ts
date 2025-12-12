
import bcrypt from "bcryptjs"
import httpStatus from "http-status"
import { generateToken, verifyTokens } from "../../shared/jwt";
import { envVar } from "../../config/envVar";
import AppError from "../../error/AppError";
import { prisma } from "../../shared/prisma";
import { UserStatus } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";




const login = async (payload: { email: string, password: string }) => {
    const user = await prisma.user.findFirstOrThrow({
        where: {
            email: payload.email,
            userStatus: UserStatus.ACTIVE
        }
    })

    const validatePassword = await bcrypt.compare(payload.password, user.password)
    if (!validatePassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "invalid credentials")
    }

    const userPayload = {
        id: user.id,
        email: payload.email,
        role: user.role
    }


    const accessToken = await generateToken(userPayload, envVar.JWT_ACCESS_SECRET as string, "1h")
    const refreshToken = await generateToken(userPayload, envVar.JWT_REFRESH_SECRET as string, "90d")


    const senderText = `Welcome back ${user.name}! You have successfully logged in.`

    return {
        accessToken,
        refreshToken,
        senderText
    }

}

const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = verifyTokens(token, envVar.JWT_REFRESH_SECRET as string) as any;
    }
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            userStatus: "ACTIVE"
        }
    });

    const accessToken = generateToken({
        email: userData.email,
        role: userData.role
    },
        envVar.JWT_ACCESS_SECRET as string,
        envVar.JWT_ACCESS_EXPIRE as string
    );

    return { accessToken }


};

const changePassword = async (user: any, payload: any) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            userStatus: "ACTIVE"
        }
    });

    const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

    if (!isCorrectPassword) {
        throw new Error("Password incorrect!")
    }

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, Number(envVar.JWT_SALT));

    await prisma.user.update({
        where: {
            email: userData.email
        },
        data: { password: hashedPassword }
    })

    return {
        message: "Password changed successfully!"
    }
};





const getMe = async (session: JwtPayload) => {

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: session.email,
            userStatus: "ACTIVE"
        }
    })

    const { id, email, role, name, userStatus } = userData;

    return {
        id,
        email,
        role,
        name,
        userStatus
    }

}



export const AuthService = {
    login,
    refreshToken,
    changePassword,
    getMe
}