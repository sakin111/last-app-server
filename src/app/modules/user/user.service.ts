

import { QueryBuilder } from "../../shared/QueryBuilder";
import bcrypt from "bcryptjs";
import { userFilterableFields, userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { Role, UserStatus } from "@prisma/client";
import prisma from "../../shared/prisma";
import { uploadMultipleToCloudinary } from "../../shared/cloudinary";




const createUser = async (payload: any) => {
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
            travelInterests: true,
            visitedCountries: true,
            profileImage: true,
            bio: true
        }
    });

    return userInfo;
};

const PublicProfile = async (id: string) => {
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      fullName: true,
      bio: true,
      profileImage: true,
      role: true,
      userStatus: true,
      travelInterests: true,
      visitedCountries: true,
      reviewsReceived: { select: { rating: true } },
      subscription: { select: { paymentStatus: true } }
    }
  });

  if (!user) return null;

  const reviews = user.reviewsReceived;

  const breakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  let totalRating = 0;

  for (const review of reviews) {
    const rating = Math.min(5, Math.max(1, review.rating));
    breakdown[rating as 1 | 2 | 3 | 4 | 5]++;
    totalRating += rating;
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  return {
    ...user,
    averageRating,
    totalReviews,
    ratingBreakdown: breakdown,
  };
};





const getAllFromDB = async (query: Record<string, string>) => {


    const queryBuilder = new QueryBuilder(prisma.user, query);

    const usersData = queryBuilder
        .filter(userFilterableFields)
        .search(userSearchableFields)
        .sort()
        .fields()
        .relation()
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
    payload: { status: UserStatus }
) => {
    await prisma.user.findUniqueOrThrow({
        where: { id },
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: {
            userStatus: payload.status,
        },
    });

    return updatedUser;
};


const updatedUser = async (
    id: string,
    payload: { name?: string; email?: string, bio?: string, fullName?: string, currentLocation?: string, travelInterests?: string[], visitedCountries?: string[] }
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



const deleteUser = async (id: string) => {

    const result = await prisma.user.delete({
        where: { id },
    });


    return result;
};



const updateProfileImage = async (
    id: string,
    files?: Express.Multer.File[]
) => {
    if (!files || files.length === 0) {
        throw new Error("No file provided");
    }

    const filePaths = [files[0].path];

    const imageUrls = await uploadMultipleToCloudinary(filePaths);

    await prisma.user.findUniqueOrThrow({
        where: { id },
    });

    const updatedUser = await prisma.user.update({
        where: { id },
        data: { profileImage: imageUrls[0] },
    });

    return updatedUser;
};



export const UserService = {
    createUser,
    getAllFromDB,
    getMyProfile,
    changeProfileStatus,
    updatedUser,
    updateProfileImage,
    deleteUser,
    PublicProfile
};