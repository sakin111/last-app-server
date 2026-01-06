import { NextFunction, Request, Response } from "express"
import { envVar } from "../config/envVar"
import { JwtPayload } from "jsonwebtoken"
import { verifyTokens } from "../shared/jwt"
import prisma from "../shared/prisma"
import { UserStatus } from "@prisma/client"

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken;

    // If no token, just continue without user info
    if (!accessToken) {
      return next();
    }

    let verifiedToken: JwtPayload;
    try {
      verifiedToken = verifyTokens(accessToken, envVar.JWT_ACCESS_SECRET) as JwtPayload;
    } catch (err: any) {
      // Token is invalid/expired, but continue anyway
      return next();
    }

    const isUserExist = await prisma.user.findUnique({
      where: { email: verifiedToken.email },
    });

    // Only attach user if found and active
    if (isUserExist && isUserExist.userStatus !== UserStatus.DELETED && isUserExist.userStatus !== UserStatus.INACTIVE) {
      req.user = verifiedToken;
    }

    next();
  } catch (error) {
    // On any error, continue without user info
    next();
  }
};
