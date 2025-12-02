import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";

import httpStatus from 'http-status'
import { sendResponse } from "src/app/shared/sendResponse";

const createUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createUser(req.body)
    sendResponse(res,{
       statusCode: 201,
       success:true,
       message:"Patient created successfully",
       data: result
    })
}
)


const AllUser = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await UserService.getAllFromDB(query as Record<string,string>)
    sendResponse(res,{
       statusCode: 200,
       success:true,
       message:"Patient retrieve successfully",
       meta: result.meta,
       data: result.data
    })
}
)
const getMyProfile = catchAsync(async (req: Request  , res: Response) => {

    const user = req.user;

    const result = await UserService.getMyProfile(user);
    sendResponse(res,{
       statusCode: 200,
       success:true,
       message:"Patient retrieve successfully",
       data: result
    })
}
)


const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const result = await UserService.changeProfileStatus(id, req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users profile status changed!",
        data: result
    })
});


export const UserController = {
 createUser,
 AllUser,
 getMyProfile,
 changeProfileStatus
}