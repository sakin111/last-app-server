import { Router } from "express";
import { ReviewController } from "./review.controller";

import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";


const router = Router();


router.post("/:targetId/reviews", checkAuth(Role.USER, Role.ADMIN), ReviewController.addReview);
router.get("/:targetId/reviews", ReviewController.getReviewsByTravelId);
router.get("/individual", checkAuth(Role.USER,Role.ADMIN), ReviewController.individualReview);
router.get("/getAll", checkAuth(Role.ADMIN), ReviewController.getAllReviews);
router.get("/:reviewId", ReviewController.getReviewById);

export const reviewRouter = router;
