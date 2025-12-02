import { prisma } from "../../shared/prisma";
import { QueryBuilder } from "../../shared/QueryBuilder";

const reviewSearchableFields = ["comment"];

const createReview = async (payload: any, authorId: string) => {
  const result = await prisma.review.create({
    data: {
      rating: Number(payload.rating),
      comment: payload.comment,
      author: { connect: { id: authorId } },
      target: { connect: { id: payload.targetId } }
    }
  });

  return result;
};

const getReviewById = async (id: string) => {
  const review = await prisma.review.findUniqueOrThrow({
    where: { id },
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      target: { select: { id: true, fullName: true, email: true } }
    }
  });

  return review;
};

const getAllReviews = async (query: Record<string, string>) => {
  const qb = new QueryBuilder(prisma.review, query as any);

  const builder = qb.filter().search(reviewSearchableFields).sort().fields().paginate();

  const [data, meta] = await Promise.all([builder.build(), qb.getMeta()]);

  return { data, meta };
};

export const ReviewService = { createReview, getReviewById, getAllReviews };
