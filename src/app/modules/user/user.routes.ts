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
);
router.patch(
    "/update-profileImage",checkAuth(Role.ADMIN, Role.USER),
    fileUploader('profileImage', 1),
    UserController.updateProfileImage
);

router.get(
    "/allUser",checkAuth(Role.ADMIN), UserController.AllUser
);

router.get(
    "/me",
     checkAuth(Role.ADMIN, Role.USER),
     UserController.getMyProfile
);
router.get(
    "/profile/public/:id",
     UserController.PublicProfile
);

router.get(
    "/notifications",
     checkAuth(Role.USER),
     UserController.getMyNotifications
);


router.get(
    "/allUserCount",checkAuth(Role.ADMIN), UserController.AllUserCount
);

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
router.delete(
    '/delete/:id',
    checkAuth(Role.ADMIN),
    UserController.deleteUser
);



export const userRouter = router;