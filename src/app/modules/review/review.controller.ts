import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";
import AppError from "../../error/AppError";

const addReview = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user.id;
  const {targetId} = req.params
  const payload = req.body;

  if (!payload.rating || !payload.content) {
    return res.status(400).json({
      success: false,
      message: "Rating & content are required",
    });
  }

  const review = await ReviewService.addReview(targetId, authorId, payload);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review added successfully",
    data: review,
  });
});

const getReviewsByTravelId = catchAsync(async (req: Request, res: Response) => {
  const travelId = req.params.targetId;
  const reviews = await ReviewService.getReviewsByTravelId(travelId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: reviews,
  });
});

const individualReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, "Unauthorized");
  }

  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const reviews = await ReviewService.individualReview(req.user.id, page, limit);


  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Received reviews fetched successfully",
    data: reviews,
  });
});


const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  const review = await ReviewService.getReviewById(reviewId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review fetched successfully",
    data: review,
  });
});

const getAllReviews = catchAsync(async (_req: Request, res: Response) => {
  const reviews = await ReviewService.getAllReviews();
  console.log(reviews);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All reviews fetched",
    data: reviews,
  });
});

export const ReviewController = {
  addReview,
  getReviewsByTravelId,
  getReviewById,
  getAllReviews,
  individualReview
};
