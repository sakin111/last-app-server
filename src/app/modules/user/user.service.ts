import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import bcrypt from "bcryptjs";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "@prisma/client";

const createUser = async (payload: JwtPayload) => {
    const hashPassword = await bcrypt.hash(payload.password, 10);

    const result = await prisma.user.create({
        data: {
            email: payload.email,
            password: hashPassword,
            fullName: payload.fullName,
            name: payload.name,
            userStatus: payload.userStatus
        }
    });

    return result;
};

const getMyProfile = async (user: JwtPayload) => {
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email
        },
        select: {
            id: true,
            email: true,
            role: true,
            userStatus: true,
            fullName: true,
            profileImage: true,
            bio: true
        }
    });

    return userInfo;
};

const getAllFromDB = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(prisma.user, query);
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ]);

    return {
        data,
        meta
    };
};

const changeProfileStatus = async (
    id: string,
    payload: { userStatus: UserStatus }
) => {

    await prisma.user.findUniqueOrThrow({
        where: { id },
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            userStatus: payload.userStatus,
        },
    });

    return updatedUser;
};


export const UserService = {
    createUser,
    getAllFromDB,
    getMyProfile,
    changeProfileStatus
};