import { Router } from "express";
import { ReviewController } from "./review.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";


const router = Router();


router.post("/:targetId/reviews", checkAuth(Role.USER, Role.ADMIN), ReviewController.addReview);
router.get("/:targetId/reviews", ReviewController.getReviewsByTravelId);
router.get("/:reviewId", ReviewController.getReviewById);
router.get("/getAll", ReviewController.getAllReviews);

export const reviewRouter = router;
