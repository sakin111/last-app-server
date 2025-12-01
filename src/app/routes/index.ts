import express from "express"
import { authRouter } from "../modules/auth/auth.route";
import { userRouter } from "../modules/user/user.routes";


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

 
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;