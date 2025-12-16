import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { planController } from "./subPlan.controller";
import { Role } from "@prisma/client";




const router = express.Router();



router.post("/",checkAuth(Role.ADMIN) ,planController.createPlanController);
router.get("/", checkAuth(Role.ADMIN, Role.USER),planController.getAllPlansController )
router.patch("/:id",checkAuth(Role.ADMIN) ,planController.updatePlanController);
router.delete("/:id",checkAuth(Role.ADMIN) ,planController.deletePlanController);

export const SubPlan = router;
