import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RequestService } from "./request.service";
import { RequestStatus } from "@prisma/client";


const createRequest = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");

  const result = await RequestService.createRequest(req.body, user.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Request created",
    data: result
  });
});


const getRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await RequestService.getRequestById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Request retrieved",
    data: result
  });
});


const getAll = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await RequestService.getAllRequests(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Requests retrieved",
    meta: result.meta,
    data: result.data
  });
});


const getRequestsForMyPlans = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");

  const result = await RequestService.getRequestsForMyPlans(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Requests for your travel plans retrieved",
    data: result
  });
});





const updateRequestStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) throw new Error("Unauthorized");

  const { id } = req.params; 
  const { status } = req.body;

  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    throw new Error("Invalid status. Must be ACCEPTED or REJECTED");
  }

  const result = await RequestService.updateRequestStatus(
    id,
    user.id,
    status as RequestStatus
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Request ${status.toLowerCase()}`,
    data: result
  });
});

export const RequestController = {
  createRequest,
  getRequest,
  getAll,
  getRequestsForMyPlans,
  updateRequestStatus
};
