import Stripe from "stripe";
import { envVar } from "../config/envVar";

import { PaymentStatus } from "@prisma/client";
import prisma from "./prisma";

const stripe = new Stripe(envVar.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20" as any
});

export const createCheckoutSession = async (params: {
    priceId: string;
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
}) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: params.priceId,
                    quantity: 1
                }
            ],
            mode: "subscription",
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            customer_email: params.customerEmail,
            customer: params.customerId
        });

        return session;
    } catch (error: any) {
        throw new Error(`Stripe checkout session error: ${error.message}`);
    }
};

export const createPaymentIntent = async (params: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
}) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: params.amount * 100,
            currency: params.currency.toLowerCase(),
            description: params.description,
            metadata: params.metadata
        });

        return paymentIntent;
    } catch (error: any) {
        throw new Error(`Stripe payment intent error: ${error.message}`);
    }
};

export const retrieveCheckoutSession = async (sessionId: string) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return session;
    } catch (error: any) {
        throw new Error(`Stripe retrieve session error: ${error.message}`);
    }
};

export const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    try {
        const subscriptions = await prisma.subscription.findMany({
            where: {
                user: {
                    email: session.customer_email || undefined
                }
            }
        });

        if (subscriptions.length > 0) {

            for (const sub of subscriptions) {
                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: {
                        active: true,
                        paymentStatus: PaymentStatus.COMPLETED
                    }
                });

                const payment = await prisma.payment.findFirst({
                    where: { subscriptionId: sub.id }
                });

                if (payment) {
                    await prisma.payment.update({
                        where: { id: payment.id },
                        data: { status:PaymentStatus.COMPLETED }
                    });
                }
            }
        }

        return { success: true, message: "Subscription activated" };
    } catch (error: any) {
        throw new Error(`Error handling checkout completion: ${error.message}`);
    }
};

export const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                subscription: {
                    paymentStatus: "PENDING"
                }
            }
        });

        if (payments.length > 0) {
            const payment = payments[0];

            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.COMPLETED }
            });

            await prisma.subscription.update({
                where: { id: payment.subscriptionId },
                data: {
                    active: true,
                    paymentStatus: PaymentStatus.COMPLETED
                }
            });
        }

        return { success: true, message: "Payment succeeded" };
    } catch (error: any) {
        throw new Error(`Error handling payment intent success: ${error.message}`);
    }
};

export const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
    try {
        const payments = await prisma.payment.findMany({
            where: {
                subscription: {
                    paymentStatus: "PENDING"
                }
            }
        });

        if (payments.length > 0) {
            const payment = payments[0];

            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "FAILED" }
            });

            await prisma.subscription.update({
                where: { id: payment.subscriptionId },
                data: { paymentStatus: "FAILED" }
            });
        }

        return { success: true, message: "Payment failed - subscription cancelled" };
    } catch (error: any) {
        throw new Error(`Error handling payment intent failure: ${error.message}`);
    }
};

export const verifyWebhookSignature = (body: Buffer, signature: string, secret: string): Stripe.Event => {
    try {
        return stripe.webhooks.constructEvent(body, signature, secret);
    } catch (error: any) {
        throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
};

export default stripe;
