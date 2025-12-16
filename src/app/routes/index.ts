import express from "express"
import { authRouter } from "../modules/auth/auth.route";
import { userRouter } from "../modules/user/user.routes";
import { travelRouter } from "../modules/travel/travel.route";
import { reviewRouter } from "../modules/review/review.route";
import { requestRouter } from "../modules/request/request.route";

import { SubPlan } from "../modules/subPlan/subPlan.route";
import { paymentRoute } from "../modules/payment/payment.route";


const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: userRouter
    },
    {
        path: '/auth',
        route: authRouter
    },
    {
        path: '/travel',
        route: travelRouter
    },
    {
        path: '/review',
        route: reviewRouter
    },
    {
        path: '/request',
        route: requestRouter
    },
    {
        path: '/payment',
        route: paymentRoute
    },
    {
        path: '/sub',
        route: SubPlan
    },

 
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;