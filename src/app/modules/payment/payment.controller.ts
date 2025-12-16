import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { handleCheckoutSuccess, handleCheckoutCancel } from "../../shared/stripe";


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
  const { stripePriceId, plan } = req.body;

  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;

  const successUrl = `${baseUrl}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/api/payment/cancel?session_id={CHECKOUT_SESSION_ID}`;

  const result = await PaymentService.createCheckoutSessionForSubscription(
    user.id,
    stripePriceId as string,
    plan as any,
    successUrl,
    cancelUrl
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Checkout session created",
    data: result,
  });
});

// Handle checkout success redirect
const checkoutSuccess = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.query as { session_id: string };
  const result = await handleCheckoutSuccess(session_id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment successful, subscription activated",
    data: result,
  });
});

// Handle checkout cancel/failure redirect
const checkoutCancel = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.query as { session_id: string };
  const result = await handleCheckoutCancel(session_id);

  sendResponse(res, {
    statusCode: 400,
    success: false,
    message: "Payment failed or cancelled",
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const {subscriptionId} = req.params 
  const result = await PaymentService.deleteSubscription(subscriptionId);

  sendResponse(res, {
    statusCode: 400,
    success: false,
    message: "Payment failed or cancelled",
    data: result,
  });
});
const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const {subscriptionId} = req.params 
  const payload = req.body 
  const result = await PaymentService.updateSubscription(subscriptionId,payload);

  sendResponse(res, {
    statusCode: 400,
    success: false,
    message: "Payment failed or cancelled",
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

export const PaymentController = {
  subscribe,
  checkoutSession,
  checkoutSuccess,
  checkoutCancel,
  getSubscriptions,
  deleteSubscription,
  updateSubscription
};
