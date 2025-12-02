import express from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "src/app/middleware/checkAuth";
import { Role } from "@prisma/client";
import validateRequest from "src/app/middleware/validateRequest";
import { PaymentValidation } from "./payment.validation";
import { WebhookController } from "./webhook.controller";

const router = express.Router();


router.post("/webhook", express.raw({ type: "application/json" }), WebhookController.stripeWebhook);

router.post("/subscribe", checkAuth(Role.USER, Role.ADMIN), validateRequest(PaymentValidation.createSubscriptionValidationSchema), PaymentController.subscribe);

router.post("/checkout-session", checkAuth(Role.USER, Role.ADMIN), PaymentController.checkoutSession);

router.post("/payment-intent", checkAuth(Role.USER, Role.ADMIN), PaymentController.paymentIntent);

router.post("/payment", checkAuth(Role.USER, Role.ADMIN), validateRequest(PaymentValidation.createPaymentValidationSchema), PaymentController.createPayment);

router.get("/", checkAuth(Role.ADMIN), PaymentController.getSubscriptions);

export const paymentRouter = router;
