import express from "express";
import { PaymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";
import validateRequest from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "@prisma/client";


const router = express.Router();



router.post("/subscribe", checkAuth(Role.USER, Role.ADMIN), validateRequest(PaymentValidation.createSubscriptionValidationSchema), PaymentController.subscribe);

router.post("/checkout-session", checkAuth(Role.USER, Role.ADMIN), PaymentController.checkoutSession);

router.post("/payment-intent", checkAuth(Role.USER, Role.ADMIN), PaymentController.paymentIntent);

router.post("/payment", checkAuth(Role.USER, Role.ADMIN), validateRequest(PaymentValidation.createPaymentValidationSchema), PaymentController.createPayment);

router.get("/", checkAuth(Role.ADMIN), PaymentController.getSubscriptions);

export const paymentRouter = router;
