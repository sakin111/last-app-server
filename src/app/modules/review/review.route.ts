import express from "express";
import { ReviewController } from "./review.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middleware/validateRequest";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

router.post("/postReview", checkAuth(Role.USER, Role.ADMIN), validateRequest(ReviewValidation.createReviewValidationSchema), ReviewController.createReview);
router.get("/getAll", ReviewController.getAll);
router.get("/:id", ReviewController.getReview);

export const reviewRouter = router;
