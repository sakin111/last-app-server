import express from 'express';
import { UserController } from './user.controller';

import { Role } from '@prisma/client';

import { UserValidation } from './user.validation';
import validateRequest from '../../middleware/validateRequest';
import { checkAuth } from '../../middleware/checkAuth';
import { fileUploader } from '../../shared/fileUploader';



const router = express.Router();

router.post(
    "/create-user",
    validateRequest(UserValidation.createUserValidationSchema),
    UserController.createUser
),
router.patch(
    "/update-profileImage",checkAuth(Role.ADMIN, Role.USER),
    fileUploader,
    UserController.updateProfileImage
),

router.get(
    "/me",
     checkAuth(Role.ADMIN, Role.USER),
     UserController.getMyProfile
),

router.get(
    "/notifications",
     checkAuth(Role.USER),
     UserController.getMyNotifications
),


router.get(
    "/allUser",checkAuth(Role.ADMIN), UserController.AllUser
)

router.patch(
    '/:id/status',
    checkAuth(Role.ADMIN),
    UserController.changeProfileStatus
);
router.patch(
    '/update-profile',
    checkAuth(Role.ADMIN, Role.USER),
    UserController.updatedUser
);

export const userRouter = router;