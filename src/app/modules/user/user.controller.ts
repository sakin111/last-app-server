import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { IJwtPayload } from "../../Types/common";
import httpStatus from 'http-status'

const createPatient = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createPatient(req)
    sendResponse(res,{
       statusCode: 201,
       success:true,
       message:"Patient created successfully",
       data: result
    })
}
)
const createDoctor = catchAsync(async (req: Request, res: Response) => {
    console.log(req);
    const result = await UserService.createDoctor(req)
    sendResponse(res,{
       statusCode: 201,
       success:true,
       message:"Doctor created successfully",
       data: result
    })
}
)
const createAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.createAdmin(req)
    sendResponse(res,{
       statusCode: 201,
       success:true,
       message:"Admin created successfully",
       data: result
    })
}
)
const AllUser = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query,["status","role","email","searchTerm"])
    const option = pick(req.query,["page","limit","sortBy","sortOrder"])

    const result = await UserService.getAllFromDB(filter, option)
    sendResponse(res,{
       statusCode: 200,
       success:true,
       message:"Patient retrieve successfully",
       meta: result.meta,
       data: result.data
    })
}
)
const getMyProfile = catchAsync(async (req: Request & {user?:IJwtPayload} , res: Response) => {

    
    const user = req.user;

    const result = await UserService.getMyProfile(user as IJwtPayload);
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
 createPatient,
 createDoctor,
 createAdmin,
 AllUser,
 getMyProfile,
 changeProfileStatus
}