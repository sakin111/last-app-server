
import prisma from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { PaymentStatus, RequestStatus, TravelType } from "@prisma/client";

const requestSearchableFields: string[] = ["status","email","name"];





const MAX_REQUESTS_PER_PLAN = 10;

export const createRequest = async (
  payload: { travelPlanId: string },
  userId: string
) => {
  return prisma.$transaction(async (tx) => {
 

    const travelPlan = await tx.travelPlan.findUnique({
      where: { id: payload.travelPlanId },
      select: { id: true, travelType: true },
    });

    if (!travelPlan) {
      throw new Error("Travel plan not found.");
    }

    if (travelPlan.travelType === TravelType.SOLO) {
      throw new Error("You cannot request to join a solo travel plan.");
    }

    const existing = await tx.request.findFirst({
      where: {
        userId,
        travelPlanId: payload.travelPlanId,
      },
    });

    if (existing) {
      throw new Error(
        "You have already requested to join this travel plan."
      );
    }


    const totalRequests = await tx.request.count({
      where: {
        travelPlanId: payload.travelPlanId,
      },
    });


    if (totalRequests >= MAX_REQUESTS_PER_PLAN) {
      const oldest = await tx.request.findFirst({
        where: { travelPlanId: payload.travelPlanId },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (oldest) {
        await tx.request.delete({ where: { id: oldest.id } });
      }
    }

    const newRequest = await tx.request.create({
      data: {
        userId,
        travelPlanId: payload.travelPlanId,
        status: RequestStatus.PENDING,
      },
    });

    return newRequest;
  });
};



const getRequestById = async (id: string) => {
  const reqData = await prisma.request.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      travelPlan: { select: { id: true, title: true, destination: true, authorId: true } }
    }
  });

  return reqData;
};




export const getAllRequests = async (query: Record<string, string>) => {
  const qb = new QueryBuilder(prisma.request, query as any);

  qb.filter()
    .search(requestSearchableFields)
    .sort()
    .fields()
    .paginate()
    .relation({
      user: { select: { id: true, name: true, email: true, profileImage: true } },
      travelPlan: { select: { id: true, title: true, travelType: true } },
    });

  const [data, meta] = await Promise.all([qb.build(), qb.getMeta()]);

  return { data, meta };
};





const getRequestsForMyPlans = async (ownerId: string) => {
  const requests = await prisma.request.findMany({
    where: {
      travelPlan: { authorId: ownerId }
    },
    include: {
      user: { select: { id: true, fullName: true, email: true , profileImage:true} },
      travelPlan: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return requests;
};


const updateRequestStatus = async (
  requestId: string,
  ownerId: string,
  status: RequestStatus
) => {
  const request = await prisma.request.findUniqueOrThrow({
    where: { id: requestId },
    include: { travelPlan: true }
  });

  if (request.travelPlan.authorId !== ownerId) {
    throw new Error("You are not authorized to update this request.");
  }

  if (!RequestStatus.ACCEPTED || !RequestStatus.REJECTED) {
    throw new Error("Invalid status. Must be ACCEPTED or REJECTED.");
  }

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: { status }
  });

    await prisma.notification.create({
    data: {
      userId: request.userId,
      title: `Request ${status.toLowerCase()}`,
      message: `Your request to join '${request.travelPlan.title}' has been ${status.toLowerCase()}.`
    }
  });

  return updated;
};

export const RequestService = {
  createRequest,
  getRequestById,
  getAllRequests,
  getRequestsForMyPlans,
  updateRequestStatus
};
