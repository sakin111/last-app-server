
import { QueryBuilder } from "../../shared/QueryBuilder";
import { uploadMultipleToCloudinary } from "../../shared/cloudinary";
import { PaymentStatus, TravelType } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../error/AppError";
import cron from "node-cron"



const travelSearchableFields = ["title", "destination", "description"];

const createTravel = async (
  payload: any,
  authorId: string,
  files?: Express.Multer.File[]
) => {





  if (!authorId) {
    throw new Error("authorId is required");
  }


  if (!files || files.length === 0) {
    throw new Error("No file provided");
  }

  const filePaths = [files[0].path];

  const imageUrls = await uploadMultipleToCloudinary(filePaths);


  const result = await prisma.travelPlan.create({
    data: {
      title: payload.title,
      destination: payload.destination,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      budgetRange: payload.budgetRange,
      travelType: payload.travelType as TravelType,
      description: payload.description,
      visibility: Boolean(payload.visibility) ?? true,
      images: imageUrls,
      author: {
        connect: { id: authorId },
      },
    },
    include: {
      author: {
        select: { id: true, email: true, fullName: true, name: true, isActive: true }
      }
    }
  });

  return result;
};




export const startTravelExpireJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      const result = await prisma.travelPlan.updateMany({
        where: {
          endDate: {
            lt: now,
          },
          isExpired: false
        },
        data: {
          isExpired: true,
          expiredAt: now,
        }
      });

      if (result.count > 0) {
        console.log(`⏳ Marked ${result.count} travels as expired`);
      }
    } catch (error) {
      console.error("Failed to delete expired travel plans", error);
    }
  });
};


export const startTravelCleanupJob = () => {

  cron.schedule("0 * * * *", async () => {
    try {
      const cutoff = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      );

      const result = await prisma.travelPlan.deleteMany({
        where: {
          isExpired: true,
          expiredAt: {
            lt: cutoff,
          },
        },
      });

      if (result.count > 0) {
        console.log(`🗑️ Permanently deleted ${result.count} expired travels`);
      }
    } catch (error) {
      console.error("Cleanup job failed", error);
    }
  });
};



const getTravelById = async (id: string) => {
  const travel = await prisma.travelPlan.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, email: true, fullName: true, name: true }
      }
    }
  });

  if (!travel) {
    return null
  }

  return travel;
};
const Travel = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(prisma.travelPlan, query as any);

  const builder = queryBuilder
    .filter()
    .search(travelSearchableFields)
    .sort()
    .fields()
    .relation({
      author: {
        select: {
          id: true,
          email: true,
          fullName: true,
          name: true,
          isActive: true,
          profileImage: true
        }
      }
    })
    .addWhere({ isExpired: false })
    .paginate();

  const [data, meta] = await Promise.all([
    builder.build(),
    queryBuilder.getMeta()
  ]);


  return { data, meta };
};

const myTravel = async (userId: string) => {
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

  const IsUpdatedData = {
    title: updateData.title,
    destination: updateData.destination,
    startDate: new Date(updateData.startDate).toISOString(),
    endDate: new Date(updateData.endDate).toISOString(),
    travelType: updateData.travelType,
    budgetRange: updateData.budgetRange,
    visibility: updateData.visibility,
  };


  const updatedTravel = await prisma.travelPlan.update({
    where: { id },
    data: IsUpdatedData,
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

const checkSubscriptionStatus = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: {
      id: true,
      active: true,
      paymentStatus: true,
      endDate: true
    }
  });


  return {
    hasActiveSubscription: subscription?.active && subscription?.paymentStatus === 'COMPLETED',
    subscription
  };
};



const getAIClient = () => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new AppError(500, "Hugging Face API key is missing");
  }
  return apiKey;
};

const getAIAdventureRecommendation = async () => {
  const apiKey = getAIClient();

  const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: "Suggest 5 amazing travel adventure destinations with brief descriptions.",
      parameters: {
        max_length: 200,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new AppError(500, "Failed to get AI recommendation");
  }

  const result = await response.json();
  return result[0]?.generated_text || "Sorry, I couldn't generate recommendations right now.";
};

const askAI = async (query: string) => {
  if (!query || query.trim().length === 0) {
    throw new AppError(400, "Query is required");
  }

  const apiKey = getAIClient();

  const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        past_user_inputs: ["Hello, I'm looking for travel advice."],
        generated_responses: ["Hi! I'd be happy to help with travel recommendations and tips."],
        text: query
      },
      parameters: {
        max_length: 500,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new AppError(500, "Failed to get AI response");
  }

  const result = await response.json();
  return result.conversation?.generated_responses?.[0] || "Sorry, I couldn't process your question right now.";
};

export {
  createTravel,
  getTravelById,
  getAllTravels,
  updateTravel,
  deleteTravel,
  Travel,
  myTravel,
  checkSubscriptionStatus,
  getAIAdventureRecommendation,
  askAI,
};

