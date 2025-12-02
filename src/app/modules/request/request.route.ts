import express from "express";
import { RequestController } from "./request.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middleware/validateRequest";
import { RequestValidation } from "./request.validation";

const router = express.Router();

router.post("/", checkAuth(Role.USER, Role.ADMIN), validateRequest(RequestValidation.createRequestValidationSchema), RequestController.createRequest);
router.get("/", checkAuth(Role.ADMIN), RequestController.getAll);
router.get("/:id", RequestController.getRequest);

export const requestRouter = router;
