import express from "express"

import { AuthController } from './auth.controller';

import { Role } from "@prisma/client";
import { checkAuth } from "../../middleware/checkAuth";





const router = express.Router();

router.get("/getMe", checkAuth(Role.USER), AuthController.getMe)

router.post(
    "/login",
    AuthController.login

)
router.post(
    '/refresh-token',
    AuthController.refreshToken
);

router.post(
    '/change-password',
    checkAuth(
        Role.ADMIN, Role.USER
    ),
    AuthController.changePassword
);






export const authRouter = router;