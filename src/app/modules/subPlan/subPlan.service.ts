import { PaymentStatus, Plan } from "@prisma/client";
import prisma from "../../shared/prisma";

 const createPlan = async (payload: {
  name: string;
  price: number;
  stripeId: string;
  duration: number;
}) => {
  const plan = await prisma.plan.create({
      data: {
      name: payload.name,
      price: payload.price,
      stripeId: payload.stripeId,
      duration: payload.duration,
    },
  });
  return plan;
};

 const updatePlan = async (id: string, payload: Partial<Plan>) => {
  const plan = await prisma.plan.update({
    where: { id },
    data: payload,
  });
  return plan;
};

 const deletePlan = async (id: string) => {
  await prisma.plan.delete({ where: { id } });
  return { success: true };
};

 const getAllPlans = async () => {
  const result = await prisma.plan.findMany();
  if(!result){
    return []
  }
  return result
};


const getMySubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      plan: true,
    },
  });

  if (!subscription) {
    return {
      isSubscribed: false,
      subscription: null,
    };
  }

  

  const isActive =
    subscription.active &&
    subscription.endDate > new Date() &&
    subscription.paymentStatus === PaymentStatus.COMPLETED

  return {
    isSubscribed: isActive,
    subscription,
  };
};


const getTotalActiveSubscribers = async () => {
  return prisma.subscription.count({
    where: {
      active: true,
      endDate: { gt: new Date() },
      paymentStatus: PaymentStatus.COMPLETED,
    },
  });
};
  

export const planService = {
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans,
    getMySubscription,
    getTotalActiveSubscribers
}
