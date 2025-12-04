import z from "zod";
import { RequestStatus } from "@prisma/client";

export const RequestValidation = {

  createRequestValidationSchema: z.object({
    travelPlanId: z.string({error: "Travel plan ID is required" }),
    status: z.string().optional() 
  }),


  updateRequestStatusValidationSchema: z.object({
    status: z.enum([RequestStatus.ACCEPTED, RequestStatus.REJECTED], {
      message: "Status must be ACCEPTED or REJECTED"
    })
  })
};
