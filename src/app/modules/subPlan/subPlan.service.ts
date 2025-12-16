import { Plan } from "@prisma/client";
import prisma from "../../shared/prisma";

 const createPlan = async (payload: {
  name: string;
  price: number;
  stripeId: string;
  duration: number;
}) => {
  const plan = await prisma.plan.create({
    data: payload,
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
  return prisma.plan.findMany();
};

export const planService = {
    createPlan,
    updatePlan,
    deletePlan,
    getAllPlans
}
