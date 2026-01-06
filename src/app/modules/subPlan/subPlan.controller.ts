import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { planService } from "./subPlan.service";


const createPlanController = catchAsync(async (req: Request, res: Response) => {
  const plan = await planService.createPlan(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Plan created successfully",
    data: plan,
  });
});

 const updatePlanController = catchAsync(async (req: Request, res: Response) => {
  const plan = await planService.updatePlan(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plan updated successfully",
    data: plan,
  });
});

 const deletePlanController = catchAsync(async (req: Request, res: Response) => {
  const result = await planService.deletePlan(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plan deleted successfully",
    data: result,
  });
});

 const getAllPlansController = catchAsync(async (_req: Request, res: Response) => {
  const result = await planService.getAllPlans();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plans retrieved successfully",
    data: result,
  });
});

 const getMyPlan = catchAsync(async (_req: Request, res: Response) => {
  const userId = _req.user?.id;
  const result = await planService.getMySubscription(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plans retrieved successfully",
    data: result,
  });
});
 const getTotalActiveSubscribers = catchAsync(async (_req: Request, res: Response) => {
  const result = await planService.getTotalActiveSubscribers();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Plans retrieved successfully",
    data: result,
  });
});


export const planController = {
    createPlanController,
    updatePlanController,
    deletePlanController,
    getAllPlansController,
    getMyPlan,
    getTotalActiveSubscribers
}