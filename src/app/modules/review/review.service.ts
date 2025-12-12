import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";

const reviewSearchableFields = ["content"]; // match frontend

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
  return reviews;
};

const getReviewById = async (reviewId: string) => {
  return prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
    include: {
      author: { select: { id: true, fullName: true, profileImage: true } },
      target: { select: { id: true, fullName: true } },
    },
  });
};

const getAllReviews = async () => {
  return prisma.review.findMany({
    include: { author: true, target: true },
    orderBy: { createdAt: "desc" },
  });
};

export const ReviewService = {
  addReview,
  getReviewsByTravelId,
  getReviewById,
  getAllReviews,
};
