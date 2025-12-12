import express from "express";
import { RequestController } from "./request.controller";

import { Role } from "@prisma/client";

import { RequestValidation } from "./request.validation";
import { checkAuth } from "../../middleware/checkAuth";
import validateRequest from "../../middleware/validateRequest";

const router = express.Router();

router.post(
  "/createRequest",
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
