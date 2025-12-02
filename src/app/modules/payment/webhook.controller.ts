import { Request, Response } from "express";
import {
    verifyWebhookSignature,
    handleCheckoutSessionCompleted,
    handlePaymentIntentSucceeded,
    handlePaymentIntentFailed
} from "../../shared/stripe";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

const stripeWebhook = async (req: Request, res: Response) => {
    try {
        const signature = req.headers["stripe-signature"] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Webhook secret not configured");
        }

        if (!signature) {
            throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe signature");
        }


        const event = verifyWebhookSignature(
            req.body as any,
            signature,
            webhookSecret
        );


        switch (event.type) {
            case "checkout.session.completed":
                const checkoutSession = event.data.object as any;
                await handleCheckoutSessionCompleted(checkoutSession);
                break;

            case "payment_intent.succeeded":
                const paymentIntent = event.data.object as any;
                await handlePaymentIntentSucceeded(paymentIntent);
                break;

            case "payment_intent.payment_failed":
                const failedPaymentIntent = event.data.object as any;
                await handlePaymentIntentFailed(failedPaymentIntent);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Webhook processed successfully",
            data: { received: true }
        });
    } catch (error: any) {
        console.error("Webhook error:", error.message);
        sendResponse(res, {
            statusCode: error.statusCode || 500,
            success: false,
            message: error.message || "Webhook processing failed",
            data: null
        });
    }
};

export const WebhookController = { stripeWebhook };
