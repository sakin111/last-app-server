import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";

const requestSearchableFields: string[] = [];

const createRequest = async (payload: any, userId: string) => {
  const result = await prisma.request.create({
    data: {
      user: { connect: { id: userId } },
      travelPlan: { connect: { id: payload.travelPlanId } },
      status: payload.status || undefined
    }
  });

  return result;
};

const getRequestById = async (id: string) => {
  const reqData = await prisma.request.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      travelPlan: { select: { id: true, title: true, destination: true } }
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

export const RequestService = { createRequest, getRequestById, getAllRequests };
