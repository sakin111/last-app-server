import express from "express";
import { RequestController } from "./request.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middleware/validateRequest";
import { RequestValidation } from "./request.validation";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(RequestValidation.createRequestValidationSchema),
  RequestController.createRequest
);

router.get("/getAll", checkAuth(Role.ADMIN, Role.USER), RequestController.getAll);



router.get("/:id", checkAuth(Role.USER, Role.ADMIN), RequestController.getRequest);

router.get(
  "/my/plans",
  checkAuth(Role.USER, Role.ADMIN),
  RequestController.getRequestsForMyPlans
);

router.patch(
  "/:id/status",
  checkAuth(Role.USER, Role.ADMIN),
  validateRequest(RequestValidation.updateRequestStatusValidationSchema),
  RequestController.updateRequestStatus
);

export const requestRouter = router;
