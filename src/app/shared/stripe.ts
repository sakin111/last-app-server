import Stripe from "stripe";
import { envVar } from "../config/envVar";
import prisma from "./prisma";
import { PaymentStatus } from "@prisma/client";

const stripe = new Stripe(envVar.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});



export const createCheckoutSession = async (params: {
  stripePriceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
  subscriptionId: string;
}) => {
  return stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: params.customerEmail,
    line_items: [
      {
        price: params.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      subscriptionId: params.subscriptionId,
    },
  });
};



export const verifyWebhookSignature = (
  body: Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(body, signature, secret);
};



export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  const metadata = session.metadata as { subscriptionId?: string };

  if (!metadata?.subscriptionId) {
    throw new Error("Missing subscriptionId in session metadata");
  }

  await prisma.subscription.update({
    where: { id: metadata.subscriptionId },
    data: {
      active: true,
      paymentStatus: PaymentStatus.COMPLETED,
      stripeSubscriptionId: session.subscription as string,
      stripeCustomerId: session.customer as string, 
    },
  });

  await prisma.payment.updateMany({
    where: {
      subscriptionId: metadata.subscriptionId,
    },
    data: {
      status: PaymentStatus.COMPLETED,
    },
  });

  return { success: true };


};



export const handleCheckoutSuccess = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return handleCheckoutSessionCompleted(session);
};

export const handleCheckoutCancel = async (sessionId: string) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata as { subscriptionId?: string };
    
    if (!metadata?.subscriptionId) {
      throw new Error("Missing subscriptionId");
    }

    await prisma.subscription.update({
      where: { id: metadata.subscriptionId },
      data: { 
        active: false, 
        paymentStatus: PaymentStatus.FAILED 
      },
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error handling checkout cancel:", error);
    throw error;
  }
};


export default stripe;
