import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  const result = await ReviewService.createReview(req.body, user.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review created",
    data: result
  });
});

const getReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getReviewById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review retrieved",
    data: result
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await ReviewService.getAllReviews(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved",
    meta: result.meta,
    data: result.data
  });
});

export const ReviewController = { createReview, getReview, getAll };
