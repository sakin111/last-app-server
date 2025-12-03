
import bcrypt from "bcryptjs"
import httpStatus from "http-status"
import { generateToken, verifyTokens } from "../../shared/jwt";
import { envVar } from "../../config/envVar";
import AppError from "../../error/AppError";
import { prisma } from "../../shared/prisma";
import { UserStatus } from "@prisma/client";




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



const resetPassword = async (token: string, payload: { id: string, password: string }) => {

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            userStatus: "ACTIVE"
        }
    });

    const isValidToken = verifyTokens(token, envVar.JWT_ACCESS_SECRET as string)

    if (!isValidToken) {
        throw new AppError(httpStatus.FORBIDDEN, "Forbidden!")
    }

    const password = await bcrypt.hash(payload.password, Number(envVar.JWT_SALT as string));

    await prisma.user.update({
        where: {
            id: payload.id
        },
        data: {
            password
        }
    })
};

const getMe = async (session: any) => {
    const accessToken = session.accessToken;
    const decodedData = verifyTokens(accessToken, envVar.JWT_ACCESS_SECRET as string) as any;

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            userStatus: "ACTIVE"
        }
    })

    const { id, email, role, userStatus } = userData;

    return {
        id,
        email,
        role,
        userStatus
    }

}



export const AuthService = {
    login,
    refreshToken,
    changePassword,
    resetPassword,
    getMe
}