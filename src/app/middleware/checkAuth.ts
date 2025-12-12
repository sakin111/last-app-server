import { NextFunction, Request, Response } from "express"
import AppError from "../error/AppError"
import { envVar } from "../config/envVar"
import { JwtPayload } from "jsonwebtoken"
import { verifyTokens } from "../shared/jwt"
import  httpStatus from "http-status"
import { UserStatus } from "@prisma/client"
import prisma from "../shared/prisma"


export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {

    try {
        const accessToken = req.cookies.accessToken

        if (!accessToken) {
            throw new AppError(403, "No Token provided")
        }


        const verifiedToken = verifyTokens(accessToken, envVar.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExist = await prisma.user.findUniqueOrThrow({
            where:{
                 email: verifiedToken.email
            }
         })

        if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
        }
    
        if (isUserExist.userStatus === UserStatus.DELETED || isUserExist.userStatus === UserStatus.INACTIVE) {
            throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.userStatus}`)
        }
     
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route!!!")
        }
        req.user = verifiedToken
        next()

    } catch (error) {
        console.log("jwt error", error);
        next(error)
    }
}