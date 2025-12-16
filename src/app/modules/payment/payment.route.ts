import express from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";

const router = express.Router();


router.post("/subscription", checkAuth(Role.ADMIN), PaymentController.subscribe);
router.get("/subscriptions", checkAuth(Role.ADMIN), PaymentController.getSubscriptions);
router.post("/checkout-session", checkAuth(Role.USER), PaymentController.checkoutSession);
router.delete("/delete", checkAuth(Role.ADMIN), PaymentController.deleteSubscription);
router.post("/update", checkAuth(Role.ADMIN), PaymentController.updateSubscription);


export const paymentRoute = router;
