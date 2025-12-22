import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { envVar } from "../../config/envVar";


const subscribe = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  const result = await PaymentService.createSubscription(req.body, user.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription created",
    data: result,
  });
});


const checkoutSession = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { stripePriceId, planId } = req.body;

  const successUrl = `${envVar.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${envVar.FRONTEND_URL}/payment/cancel`;

  const result = await PaymentService.createCheckoutSessionForSubscription(
    user.id,
    stripePriceId,
    planId,
    successUrl,
    cancelUrl
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Checkout session created",
    data: {
      url: result.sessionUrl,
      sessionId: result.sessionId,
    },
  });
});


const checkoutSuccess = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.query as { session_id: string };


  const result = await PaymentService.handleCheckoutSuccess(session_id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment successful, subscription activated",
    data: result,
  });
});


const checkoutCancel = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.query as { session_id: string };


  await PaymentService.handleCheckoutCancel(session_id);

  sendResponse(res, {
    statusCode: 200,
    success: false,
    message: "Payment cancelled",
    data: null,
  });
});


const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const result = await PaymentService.deleteSubscription(subscriptionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription deleted",
    data: result,
  });
});


const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;
  const payload = req.body;
  const result = await PaymentService.updateSubscription(subscriptionId, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription updated",
    data: result,
  });
});

const getSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await PaymentService.getAllSubscriptions(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscriptions retrieved",
    meta: result.meta,
    data: result.data,
  });
});


const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PaymentService.getActiveSubscription(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result ? "Active subscription found" : "No active subscription",
    data: result,
  });
});

const cancelMySubscription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PaymentService.handleCheckoutCancel(user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subscription cancelled successfully",
    data: result,
  });
});

export const PaymentController = {

  checkoutSession,
  checkoutSuccess,
  checkoutCancel,
  getSubscriptions,
  getMySubscription,
  cancelMySubscription,
  deleteSubscription,
  updateSubscription,
};