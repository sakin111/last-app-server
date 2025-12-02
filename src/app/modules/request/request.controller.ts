import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { RequestService } from "./request.service";

const createRequest = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
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

export const RequestController = { createRequest, getRequest, getAll };
