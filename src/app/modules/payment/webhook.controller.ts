import { Request, Response } from "express";
import {
  verifyWebhookSignature,
  handleCheckoutSessionCompleted,
} from "../../shared/stripe";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../error/AppError";
import httpStatus from "http-status";
import Stripe from "stripe";


const handlePaymentIntentSucceeded = async (paymentIntent: any) => {
  console.log("PaymentIntent succeeded:", paymentIntent.id);
};
const handlePaymentIntentFailed = async (paymentIntent: any) => {
  console.log("PaymentIntent failed:", paymentIntent.id);
};


const stripeWebhook = async (req: Request, res: Response) => {
  try {
    console.log("🔥 WEBHOOK HIT");
    const signature = req.headers["stripe-signature"] as string;
     console.log("Signature:", !!signature);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    

    if (!webhookSecret) throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Webhook secret not configured");
    if (!signature) throw new AppError(httpStatus.BAD_REQUEST, "Missing Stripe signature");

    const event = await verifyWebhookSignature(req.body as any, signature, webhookSecret);
     console.log("Event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
           console.log("Session ID:", checkoutSession.id);
    console.log("Metadata:", checkoutSession.metadata);
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
      data: { received: true },
    });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    sendResponse(res, {
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || "Webhook processing failed",
      data: null,
    });
  }
};

export const WebhookController = { stripeWebhook };
