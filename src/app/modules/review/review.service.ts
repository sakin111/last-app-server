import AppError from "../../error/AppError";
import prisma from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";



const reviewSearchableFields = ["content"]; 

const addReview = async (targetId: string, authorId: string, payload: { rating: number; content: string }) => {
  const review = await prisma.review.create({
    data: {
      rating: Number(payload.rating),
      content: payload.content,
      author: { connect: { id: authorId } },
      target: { connect: { id: targetId } },
    },
  });
  return review;
};

const getReviewsByTravelId = async (travelId: string) => {
  const reviews = await prisma.review.findMany({
    where: { targetId: travelId },
    include: {
      author: { select: { id: true, fullName: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });
 
  if(!reviews){
    return null
  }

  return reviews;
};

const getReviewById = async (reviewId: string) => {
  return prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      author: { select: { id: true, fullName: true, profileImage: true } },
      target: { select: { id: true, fullName: true } },
    },
  });
};

const getAllReviews = async () => {
  const result = await prisma.review.findMany({
    include: { author: {select:{id:true,name:true,email:true,bio:true}}, target: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(result,"service result");
  return result;
};

const individualReview = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [reviews, total, avg] = await prisma.$transaction([
    prisma.review.findMany({
      where: { targetId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    }),

    prisma.review.count({
      where: { targetId: userId },
    }),

    prisma.review.aggregate({
      where: { targetId: userId },
      _avg: { rating: true },
    }),
  ]);

  return {
    reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      averageRating: avg._avg.rating ?? 0,
    },
  };
};





export const ReviewService = {
  addReview,
  getReviewsByTravelId,
  getReviewById,
  getAllReviews,
  individualReview
};
