import express from "express";
import { TravelController } from "./travel.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middleware/validateRequest";
import { TravelValidation } from "./travel.validation";
import { fileUploader } from "src/app/shared/fileUploader";

const router = express.Router();

router.post("/", checkAuth(Role.USER, Role.ADMIN),
 fileUploader.upload.array("images", 10), validateRequest(TravelValidation.createTravelValidationSchema), TravelController.createTravel);
router.get("/", TravelController.getAll);
router.get("/:id", TravelController.getTravel);

export const travelRouter = router;
