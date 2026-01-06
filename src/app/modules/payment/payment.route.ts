import express from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";

const router = express.Router();



router.get("/cancel", PaymentController.checkoutCancel);


router.post("/checkout-session", checkAuth(Role.USER), PaymentController.checkoutSession);
router.get("/my-subscription", checkAuth(Role.USER), PaymentController.getMySubscription);
router.post("/cancel-subscription", checkAuth(Role.USER), PaymentController.cancelMySubscription);


router.get("/subscriptions", checkAuth(Role.ADMIN), PaymentController.getSubscriptions);
router.patch("/subscriptions/:subscriptionId", checkAuth(Role.ADMIN), PaymentController.updateSubscription);
router.delete("/subscriptions/:subscriptionId", checkAuth(Role.ADMIN), PaymentController.deleteSubscription);

export const paymentRoute = router;