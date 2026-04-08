
import { QueryBuilder } from "../../shared/QueryBuilder";
import { uploadMultipleToCloudinary } from "../../shared/cloudinary";
import { PaymentStatus, TravelType } from "@prisma/client";
import prisma from "../../shared/prisma";
import AppError from "../../error/AppError";
import cron from "node-cron"
import { abort } from "process";



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
  const fallback = [
    { id: "1", title: "Bali", description: "Tropical paradise", location: "Indonesia", type: "Adventure", difficulty: "Easy" },
    { id: "2", title: "Swiss Alps", description: "Snow mountains", location: "Switzerland", type: "Adventure", difficulty: "Hard" },
    { id: "3", title: "Sahara", description: "Desert safari", location: "Africa", type: "Adventure", difficulty: "Moderate" },
    { id: "4", title: "Amazon", description: "Rainforest exploration", location: "Brazil", type: "Adventure", difficulty: "Hard" },
    { id: "5", title: "Nepal", description: "Hiking & mountains", location: "Nepal", type: "Adventure", difficulty: "Moderate" },
  ];

  const prompt = `
Give me 5 travel adventure destinations.
Format:
1. Name - short description
`;

  const text = await askAI(prompt);

  if (!text) return fallback;

  const lines = text.split("\n").filter(Boolean);

  return lines.slice(0, 5).map((line: any, i: any) => {
    const clean = line.replace(/^[0-9]+\.\s*/, "");
    const [title, description] = clean.split(" - ");

    return {
      id: `rec-${i}`,
      title: title || clean,
      description: description || clean,
      location: "Unknown",
      type: "Adventure",
      difficulty: "Moderate",
    };
  });
};

const HF_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-base";

const CacheAI : Record<string, any> = {};

const askAI = async (prompt:string, retries = 2) => {
  if (!prompt || prompt.trim().length === 0) {
    throw new AppError(400, "Prompt is required");
  }
  if (CacheAI[prompt]) return CacheAI[prompt];

  for(let i= 0 ; i < retries; i++){
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
    const apiKey = getAIClient();

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: ["Hello, I'm looking for travel advice."],
          generated_responses: ["Hi! I'd be happy to help with travel recommendations and tips."],
          text: prompt
        },
        parameters: {
          max_length: 200,
          temperature: 0.7,
        },
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API Error:", response.status, errorText);
      continue;
    }

    const data = await response.json();
     const text = data?.[0]?.generated_text || data?.generated_text || JSON.stringify(data);
     CacheAI[prompt] = text;
     return text;
  } catch (error) {
    console.error("askAI Error:", error);
    console.log(`Retry ${i + 1} failed`);
    return `That's a great question about travel! For the best advice, I recommend:\n1. Checking travel guides specific to your destination\n2. Reading reviews from other travelers\n3. Contacting local tourism boards\n4. Consulting with travel agents`;
  }
  }
};

export const TravelService = {
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

