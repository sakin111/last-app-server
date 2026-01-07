import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { planController } from "./subPlan.controller";
import { Role } from "@prisma/client";
import validateRequest from "../../middleware/validateRequest";
import { createPlanSchema } from "./subPlan.validation";




const router = express.Router();



router.post("/",checkAuth(Role.ADMIN), validateRequest(createPlanSchema) ,planController.createPlanController);
router.get("/getSub", checkAuth(Role.USER,Role.ADMIN),planController.getAllPlansController )
router.get("/myPlan", checkAuth(Role.USER,Role.ADMIN),planController.getMyPlan )
router.get("/allSub", checkAuth(Role.ADMIN),planController.getTotalActiveSubscribers )
router.patch("/:id",checkAuth(Role.ADMIN) ,planController.updatePlanController);
router.delete("/:id",checkAuth(Role.ADMIN) ,planController.deletePlanController);

export const SubPlan = router;
