import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { uploadMultipleToCloudinary } from "../../shared/cloudinary";
import { TravelType } from "@prisma/client";
import AppError from "src/app/error/AppError";

const travelSearchableFields = ["title", "destination", "description"];

const createTravel = async (
  payload: any,
  authorId: string,
  files?: Express.Multer.File[]
) => {
  if (!authorId) {
    throw new Error("authorId is required");
  }

  const filePaths = files?.map(f => f.path) || [];
  const imageUrls = filePaths.length
    ? await uploadMultipleToCloudinary(filePaths)
    : [];

  const result = await prisma.travelPlan.create({
    data: {
      title: payload.title,
      destination: payload.destination,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      budgetRange: payload.budgetRange,
      travelType: payload.travelType as TravelType,
      description: payload.description,
      visibility: Boolean(payload.visibility)?? true,
      images: imageUrls,
      author: {
        connect: { id: authorId },
      },
    },
    include:{
       author:{
        select: { id: true, email: true, fullName: true, name: true, isActive:true }
       }
    }
  });

  return result;
};


const getTravelById = async (id: string) => {
	const travel = await prisma.travelPlan.findUniqueOrThrow({
		where: { id },
		include: {
			author: {
				select: { id: true, email: true, fullName: true, name: true }
			}
		}
	});

	return travel;
};
const Travel = async () => {
   const result = await prisma.travelPlan.findMany({
    include:{
      author:{
        select: { id: true, email: true, fullName: true, name: true, isActive:true }
      }
    }
   })
   return result
};

export const myTravel = async (userId: string) => {
  const travels = await prisma.travelPlan.findMany({
    where: {
      authorId: userId, 
    },
    orderBy: {
      createdAt: "desc"
    },
  });

  return travels;
};


const updateTravel = async (id: string, userId: string, updateData: any) => {

  const existingTravel = await prisma.travelPlan.findUnique({
    where: { id }
  });

  if (!existingTravel) {
    throw new AppError(404, 'Travel plan not found');
  }

  if (existingTravel.authorId !== userId) {
    throw new AppError(403, 'You are not authorized to update this travel plan');
  }


  if (typeof updateData.visibility === 'string') {
    updateData.visibility = updateData.visibility === 'true';
  }

  const updatedTravel = await prisma.travelPlan.update({
    where: { id },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true,
          fullName: true,
          isActive: true
        }
      }
    }
  });

  return updatedTravel;
};



const deleteTravel = async (id: string, userId: string) => {

  const existingTravel = await prisma.travelPlan.findUnique({
    where: { id }
  });

  if (!existingTravel) {
    throw new AppError(404, 'Travel plan not found');
  }

  if (existingTravel.authorId !== userId) {
    throw new AppError(403, 'You are not authorized to delete this travel plan');
  }

  await prisma.travelPlan.delete({
    where: { id }
  });

  return null;
};

const getAllTravels = async (query: Record<string, string>) => {

	const queryBuilder = new QueryBuilder(prisma.travelPlan, query as any);

	const builder = queryBuilder
		.filter()
		.search(travelSearchableFields)
		.sort()
		.fields()
		.paginate();

	const [data, meta] = await Promise.all([
		builder.build(),
		queryBuilder.getMeta()
	]);

	return { data, meta };
};

export const TravelService = {
	createTravel,
	getTravelById,
	getAllTravels,
  updateTravel,
  deleteTravel,
  Travel,
  myTravel
};

