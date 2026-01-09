import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";

import httpStatus from 'http-status'
import { sendResponse } from "../../shared/sendResponse";
import prisma from "../../shared/prisma";
import { QueryParser } from "../../shared/QueryParser";
import { getUploadedFiles } from "../../shared/fileUploader";
import AppError from "../../error/AppError";


const createUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createUser(req.body)
    sendResponse(res,{
       statusCode: 201,
       success:true,
       message:"User created successfully",
       data: result
    })
}
)


const AllUser = catchAsync(async (req: Request, res: Response) => {


  const result = await UserService.getAllFromDB(req.query as any);
  console.log(result,"alluser result");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getMyProfile = catchAsync(async (req: Request  , res: Response) => {

    const user = req.user;

    const result = await UserService.getMyProfile(user);
    sendResponse(res,{
       statusCode: 200,
       success:true,
       message:"User retrieve successfully",
       data: result
    })
}
)
const PublicProfile = catchAsync(async (req: Request  , res: Response) => {


    const id = req.params.id as string

    const result = await UserService.PublicProfile(id);

      if (!result) {
    return res.status(404).json({ message: "User not found" });
  }
    sendResponse(res,{
       statusCode: 200,
       success:true,
       message:"User retrieve successfully",
       data: result
    })
}
)


const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const payload =  req.body
    

    const result = await UserService.changeProfileStatus(id, payload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users profile status changed!",
        data: result
    })
});


const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved",
    data: notifications
  });
});
const updatedUser = catchAsync(async (req: Request, res: Response) => {

  const id = req.user?.id;
  const payload = req.body;

  const result = await UserService.updatedUser(id as string, payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved",
    data: result
  });
});
const updateProfileImage = catchAsync(async (req: Request, res: Response) => {

  const id = req.user?.id;
  const files = getUploadedFiles(req)


  const result = await UserService.updateProfileImage(id as string,files);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved",
    data: result
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const result = await UserService.deleteUser(id as string);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user Deleted successfully",
    data: result
  });
});

const AllUserCount = catchAsync(async (req: Request, res: Response) => {

  const result = await prisma.user.count()
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "user Deleted successfully",
    data: result
  });
});


export const UserController = {
 createUser,
 AllUser,
 getMyProfile,
 changeProfileStatus,
 getMyNotifications,
 updatedUser,
 updateProfileImage,
 deleteUser,
 PublicProfile,
 AllUserCount
}