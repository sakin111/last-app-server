import express from "express";
import { TravelController } from "./travel.controller";

import { Role } from "@prisma/client";

import { TravelValidation } from "./travel.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { optionalAuth } from "../../middleware/optionalAuth";
import { fileUploader } from "../../shared/fileUploader";
import validateRequest from "../../middleware/validateRequest";


const router = express.Router();

router.get("/subscription-status", checkAuth(Role.USER), TravelController.checkSubscription);
router.get("/getAll",checkAuth(Role.ADMIN), TravelController.getAll);
router.get("/getTravel", optionalAuth, TravelController.Travel);
router.get("/myTravel",checkAuth(Role.USER), TravelController.myTravel);
router.post("/create-travel", checkAuth(Role.USER, Role.ADMIN),
 fileUploader('images',10), validateRequest(TravelValidation.createTravelValidationSchema), TravelController.createTravel);
router.get("/:id", optionalAuth, TravelController.getTravel);
router.patch("/:id",checkAuth(Role.USER, Role.ADMIN), TravelController.updateTravel);
router.delete("/:id",checkAuth(Role.USER, Role.ADMIN), TravelController.deleteTravel);


export const travelRouter = router;
