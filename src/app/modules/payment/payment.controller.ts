import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { PaymentService } from "./payment.service";

const subscribe = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  const result = await PaymentService.createSubscription(req.body, user.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subscription created",
    data: result
  });
});

const checkoutSession = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  const { stripePriceId, plan } = req.body;
  
  // Get base URL from request
  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;
  
  const successUrl = `${baseUrl}/api/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/api/payment/cancel`;

  const result = await PaymentService.createCheckoutSessionForSubscription(
    { stripePriceId, plan },
    user.id,
    successUrl,
    cancelUrl
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Checkout session created",
    data: result
  });
});

const paymentIntent = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const user = req.user;
  const result = await PaymentService.createPaymentIntent(req.body, user.id);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment intent created",
    data: result
  });
});

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPayment(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment created",
    data: result
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
    data: result.data
  });
});

export const PaymentController = { subscribe, checkoutSession, paymentIntent, createPayment, getSubscriptions };
