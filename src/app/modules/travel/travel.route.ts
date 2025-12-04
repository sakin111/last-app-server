import express from "express";
import { TravelController } from "./travel.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middleware/validateRequest";
import { TravelValidation } from "./travel.validation";
import { fileUploader } from "src/app/shared/fileUploader";

const router = express.Router();

router.post("/create-travel", checkAuth(Role.USER, Role.ADMIN),
 fileUploader, validateRequest(TravelValidation.createTravelValidationSchema), TravelController.createTravel);
router.get("/getAll", TravelController.getAll);
router.get("/:id", TravelController.getTravel);

export const travelRouter = router;
