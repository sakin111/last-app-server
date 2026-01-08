import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes";
import { envVar } from "./app/config/envVar";
import notFound from "./app/error/notFound";
import globalErrorHandler from "./app/error/globalErrorHandler";
import { WebhookController } from "./app/modules/payment/webhook.controller";

export const app: Application = express();

app.set("trust proxy", 1);
app.use(cors({
  origin: envVar.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  WebhookController.stripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send({
    Message: "Travel buddy",
    environment: envVar.NODE_ENV,
    uptime: process.uptime().toFixed(2) + " sec",
    timeStamp: new Date().toISOString(),
  });
});


app.use(notFound);
app.use(globalErrorHandler);


