import express from "express";
import { TravelController } from "./travel.controller";

import { Role } from "@prisma/client";

import { TravelValidation } from "./travel.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { fileUploader } from "../../shared/fileUploader";
import validateRequest from "../../middleware/validateRequest";


const router = express.Router();

router.post("/create-travel", checkAuth(Role.USER, Role.ADMIN),
 fileUploader, validateRequest(TravelValidation.createTravelValidationSchema), TravelController.createTravel);
router.get("/getAll", TravelController.getAll);
router.get("/getTravel", TravelController.Travel);
router.get("/myTravel",checkAuth(Role.USER), TravelController.myTravel);
router.get("/:id", TravelController.getTravel);
router.patch("/:id",checkAuth(Role.USER, Role.ADMIN), TravelController.updateTravel);
router.get("/:id",checkAuth(Role.USER, Role.ADMIN), TravelController.deleteTravel);

export const travelRouter = router;
