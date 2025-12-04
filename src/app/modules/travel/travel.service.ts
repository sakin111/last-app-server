import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";
import { uploadMultipleToCloudinary } from "../../shared/cloudinary";

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
      travelType: payload.travelType.toUpperCase(),
      description: payload.description,
      visibility: payload.visibility ?? true,
      images: imageUrls,
      author: {
        connect: { id: authorId },
      },
    },
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
	getAllTravels
};

