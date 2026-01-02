import AppError from "../../error/AppError";
import prisma from "../../shared/prisma";



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
  return prisma.review.findMany({
    include: { author: {select:{id:true,name:true,email:true,bio:true}}, target: true },
    orderBy: { createdAt: "desc" },
  });
};

const individualReview = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      reviewsReceived: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user.reviewsReceived;
};



export const ReviewService = {
  addReview,
  getReviewsByTravelId,
  getReviewById,
  getAllReviews,
  individualReview
};
