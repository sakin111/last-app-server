import { Router } from "express";
import { ReviewController } from "./review.controller";

import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();


router.post("/:targetId/reviews", checkAuth(Role.USER, Role.ADMIN), ReviewController.addReview);
router.get("/:targetId/reviews", ReviewController.getReviewsByTravelId);
router.get("/:reviewId", ReviewController.getReviewById);
router.get("/getAll", ReviewController.getAllReviews);
router.get("/individual",checkAuth(Role.USER), ReviewController.individualReview);

export const reviewRouter = router;
