import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { RequestStatus } from "@prisma/client";

const requestSearchableFields: string[] = ["status"];

const createRequest = async (payload: { travelPlanId: string }, userId: string) => {

  const existing = await prisma.request.findFirst({
    where: {
      userId,
      travelPlanId: payload.travelPlanId
    }
  });

  if (existing) {
    throw new Error("You have already requested to join this travel plan.");
  }

  const result = await prisma.request.create({
    data: {
      user: { connect: { id: userId } },
      travelPlan: { connect: { id: payload.travelPlanId } },
      status: RequestStatus.PENDING
    }
  });

  return result;
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


const getAllRequests = async (query: Record<string, string>) => {
  const qb = new QueryBuilder(prisma.request, query as any);
  const builder = qb.filter().search(requestSearchableFields).sort().fields().paginate();
  const [data, meta] = await Promise.all([builder.build(), qb.getMeta()]);

  return { data, meta };
};




const getRequestsForMyPlans = async (ownerId: string) => {
  const requests = await prisma.request.findMany({
    where: {
      travelPlan: { authorId: ownerId }
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
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
