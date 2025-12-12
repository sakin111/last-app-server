
import prisma from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { createCheckoutSession, createPaymentIntent as createStripePaymentIntent } from "../../shared/stripe";

const subscriptionSearchableFields: string[] = [];

const createSubscription = async (payload: any, userId: string) => {
    const startDate = new Date();
    const endDate = payload.endDate ? new Date(payload.endDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const result = await prisma.subscription.create({
        data: {
            user: { connect: { id: userId } },
            plan: payload.plan,
            startDate,
            endDate,
            active: true,
            paymentStatus: payload.paymentStatus || "PENDING"
        }
    });

    return result;
};

const createCheckoutSessionForSubscription = async (payload: any, userId: string, successUrl: string, cancelUrl: string) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: { email: true }
    });

    const session = await createCheckoutSession({
        priceId: payload.stripePriceId,
        customerEmail: user.email,
        successUrl,
        cancelUrl
    });


    const subscription = await prisma.subscription.create({
        data: {
            user: { connect: { id: userId } },
            plan: payload.plan,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            active: false,
            paymentStatus: "PENDING"
        }
    });

    return {
        sessionId: session.id,
        sessionUrl: session.url,
        subscription
    };
};

const createPaymentIntent = async (payload: any, userId: string) => {

  const result = await prisma.$transaction(async(tnx) => {
        await tnx.user.findUniqueOrThrow({
        where: { id: userId }
    });

     await createStripePaymentIntent({
        amount: Number(payload.amount),
        currency: payload.currency || "USD",
        description: `Travel Buddy - ${payload.plan} Plan`
    });


 const subscription = await tnx.subscription.create({
        data: {
            user: { connect: { id: userId } },
            plan: payload.plan,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            active: false,
            paymentStatus: "PENDING"
        }
    });

       const payment = await tnx.payment.create({
        data: {
            subscription: { connect: { id: subscription.id } },
            amount: Number(payload.amount),
            currency: payload.currency || "USD",
            status: "PENDING"
        }
    });

    return { subscription, payment };
  });

    return result;
};

const createPayment = async (payload: any) => {
    const result = await prisma.payment.create({
        data: {
            subscription: { connect: { id: payload.subscriptionId } },
            amount: Number(payload.amount),
            currency: payload.currency || "USD",
            status: payload.status
        }
    });

    return result;
};

const getAllSubscriptions = async (query: Record<string, string>) => {
    const qb = new QueryBuilder(prisma.subscription, query as any);

    const builder = qb.filter().search(subscriptionSearchableFields).sort().fields().paginate();

    const [data, meta] = await Promise.all([builder.build(), qb.getMeta()]);

    return { data, meta };
};

export const PaymentService = {
    createSubscription,
    createCheckoutSessionForSubscription,
    createPaymentIntent,
    createPayment,
    getAllSubscriptions
};
