import prisma from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { createCheckoutSession, handleCheckoutCancel, handleCheckoutSessionCompleted, handleCheckoutSuccess  } from "../../shared/stripe";
import { PaymentStatus } from "@prisma/client";

const subscriptionSearchableFields: string[] = ["plan", "paymentStatus"];

const createSubscription = async (payload: any, userId: string) => {
  const startDate = new Date();
  const endDate = payload.endDate ? new Date(payload.endDate) : new Date(Date.now() + 30*24*60*60*1000);

  const subscription = await prisma.subscription.create({
    data: {
      user: { connect: { id: userId } },
      plan: payload.plan,
      startDate,
      endDate,
      active: false,
      paymentStatus: PaymentStatus.PENDING
    }
  });

  return subscription;
};

const updateSubscription = async (subscriptionId: string, payload: any) => {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: payload
  });
};

const deleteSubscription = async (subscriptionId: string) => {
  return prisma.subscription.delete({
    where: { id: subscriptionId }
  });
};

const getAllSubscriptions = async (query: Record<string, string>) => {
  const qb = new QueryBuilder(prisma.subscription, query as any);

  const builder = qb
    .filter()  
    .search(subscriptionSearchableFields) 
    .sort()           
    .fields()       
    .paginate();       

  const [data, meta] = await Promise.all([builder.build(), qb.getMeta()]);

  return { data, meta };
};

const createCheckoutSessionForSubscription = async (userId: string, priceId: string, plan: string, successUrl: string, cancelUrl: string) => {
  const subscription = await createSubscription({ plan }, userId);

  const session = await createCheckoutSession({
    priceId,
    customerEmail: (await prisma.user.findUniqueOrThrow({ where: { id: userId } })).email!,
    subscriptionId: subscription.id,
    successUrl,
    cancelUrl
  });

  return { subscription, sessionId: session.id, sessionUrl: session.url };
};

export const PaymentService = {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptions,
  createCheckoutSessionForSubscription,
  handleCheckoutSessionCompleted,
  handleCheckoutSuccess,
  handleCheckoutCancel
};
