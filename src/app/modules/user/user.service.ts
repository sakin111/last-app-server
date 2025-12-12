import { Request } from "express";
import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import bcrypt from "bcryptjs";
import { userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "@prisma/client";
import { UserCreateInput } from "prisma/schema/generate/models";
import { uploadMultipleToCloudinary } from "src/app/shared/cloudinary";

const createUser = async (payload: UserCreateInput) => {
    const hashPassword = await bcrypt.hash(payload.password, 10);

    const result = await prisma.user.create({
        data: {
            name: payload.name,
            email: payload.email,
            password: hashPassword,
            role: Role.USER,
            userStatus: UserStatus.ACTIVE
        }
    });

    return result;
};

const getMyProfile = async (user: JwtPayload) => {
    const userInfo = await prisma.user.findUnique({
        where: {
            email: user.email
        },
        select: {
            id: true,
            email: true,
            name: true,
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


const updatedUser = async (
    id: string,
    payload: { name?: string; email?:string, bio?:string ,fullName?:string, currentLocation?:string }
) => {

    await prisma.user.findUniqueOrThrow({
        where: { id },
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: payload
    });

    return updatedUser;
};
const updateProfileImage = async (
    id: string,
    files?: Express.Multer.File[]
) => {

      const filePaths = files?.map(f => f.path) || [];
      const imageUrls = filePaths.length
        ? await uploadMultipleToCloudinary(filePaths)
        : [];
    await prisma.user.findUniqueOrThrow({
        where: { id },
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { profileImage: imageUrls[0] || null }
    });

    return updatedUser;
};


export const UserService = {
    createUser,
    getAllFromDB,
    getMyProfile,
    changeProfileStatus,
    updatedUser,
    updateProfileImage
};