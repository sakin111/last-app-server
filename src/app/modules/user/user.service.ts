

import { QueryBuilder } from "../../shared/QueryBuilder";
import bcrypt from "bcryptjs";
import { userFilterableFields, userSearchableFields } from "./user.constant";
import { JwtPayload } from "jsonwebtoken";
import { Prisma, Role, UserStatus } from "@prisma/client";
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






export const getAllFromDB = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    role,
    isActive,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  // 🔹 Log input query
  console.log("=== QUERY PARAMS ===");
  console.log(JSON.stringify(query, null, 2));
  console.log("page:", page, "limit:", limit, "skip:", skip);
  console.log("sortBy:", sortBy, "sortOrder:", sortOrder);

  // 🔹 Build search conditions
  const searchConditions: Prisma.UserWhereInput[] = search
    ? [
        {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
          ],
        },
      ]
    : [];

  console.log("searchConditions:", JSON.stringify(searchConditions, null, 2));

  // 🔹 Build filter conditions
  const filterConditions: Prisma.UserWhereInput = {
    ...(role && { role }),
    ...(isActive !== undefined && { isActive: isActive === "true" || isActive === true }),
  };

  console.log("filterConditions:", JSON.stringify(filterConditions, null, 2));

  // 🔹 Combine conditions
  const andConditions = [...searchConditions];
  if (Object.keys(filterConditions).length > 0) {
    andConditions.push(filterConditions);
  }

  const where: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  console.log("CONSTRUCTED WHERE:", JSON.stringify(where, null, 2));

  // 🔹 Fetch users
  const users = await prisma.user.findMany({
    where,           // ✅ use the correct where here
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  console.log("FETCHED USERS COUNT:", users.length);
  if (users.length > 0) {
    console.log("First user:", users[0]);
  }

  // 🔹 Total count
  const total = await prisma.user.count({ where });
  console.log("TOTAL USERS MATCHING WHERE:", total);

  return {
    data: users,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
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