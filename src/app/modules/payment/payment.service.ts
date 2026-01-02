import prisma from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import stripe, { 
  createCheckoutSession, 
  handleCheckoutCancel, 
  handleCheckoutSessionCompleted, 
  handleCheckoutSuccess,
} from "../../shared/stripe";


const subscriptionSearchableFields: string[] = ["plan", "paymentStatus"];

const createSubscription = async (
  payload: { planId: string },
  userId: string
) => {
  const startDate = new Date();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const plan = await prisma.plan.findUniqueOrThrow({
    where: { id: payload.planId },
  });

  return prisma.subscription.upsert({
    where: { userId }, 
    update: {
      planId: plan.id,
      startDate,
      endDate,
      active: false,
      paymentStatus: "PENDING",
    },
    create: {
      userId,
      planId: plan.id,
      startDate,
      endDate,
      active: false,
      paymentStatus: "PENDING",
    },
  });
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

const createCheckoutSessionForSubscription = async (
  userId: string, 
  stripePriceId: string, 
  planId: string, 
  successUrl: string, 
  cancelUrl: string
) => {

  const existingSubscription = await prisma.subscription.findFirst({
    where: { userId, active: true }
  });

  if (existingSubscription) {
    throw new Error("User already has an active subscription");
  }

  const subscription = await createSubscription({ planId }, userId);

  const user = await prisma.user.findUniqueOrThrow({ 
    where: { id: userId } 
  });

  const session = await createCheckoutSession({
    stripePriceId,
    customerEmail: user.email!,
    subscriptionId: subscription.id,
    successUrl,
    cancelUrl
  });

  return { subscription, sessionId: session.id, sessionUrl: session.url };
};


const getActiveSubscription = async (userId: string) => {
  return prisma.subscription.findFirst({
    where: {
      userId,
      active: true,
      endDate: { gte: new Date() }
    },
    include: {
      user: true
    }
  });
};


const hasActiveSubscription = async (userId: string): Promise<boolean> => {
  const subscription = await getActiveSubscription(userId);
  return !!subscription;
};







export const PaymentService = {
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptions,
  createCheckoutSessionForSubscription,
  getActiveSubscription,           
  hasActiveSubscription,            
  handleCheckoutSessionCompleted,
  handleCheckoutSuccess,
  handleCheckoutCancel,
   
}  