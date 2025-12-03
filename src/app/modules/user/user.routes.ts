import express from 'express';
import { UserController } from './user.controller';
import { checkAuth } from 'src/app/middleware/checkAuth';
import { Role } from '@prisma/client';
import validateRequest from 'src/app/middleware/validateRequest';
import { UserValidation } from './user.validation';


const router = express.Router();

router.post(
    "/create-user",
    validateRequest(UserValidation.createUserValidationSchema),
    UserController.createUser
),

router.get(
    "/me",
     checkAuth(Role.ADMIN, Role.USER),
     UserController.getMyProfile
),


router.get(
    "/allUser",checkAuth(Role.ADMIN), UserController.AllUser
)

router.patch(
    '/:id/status',
    checkAuth(Role.ADMIN),
    UserController.changeProfileStatus
);

export const userRouter = router;