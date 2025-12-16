import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TravelService } from "./travel.service";

const createTravel = catchAsync(async (req: Request, res: Response) => {
	 const user = req.user
	const files =req.files as Express.Multer.File[] || []
	const result = await TravelService.createTravel(req.body, user.id, files);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Travel plan created",
		data: result
	});
});

const getTravel = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const result = await TravelService.getTravelById(id);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Travel retrieved",
		data: result
	});
});

const getAll = catchAsync(async (req: Request, res: Response) => {
	const query = req.query as Record<string, string>;
	const result = await TravelService.getAllTravels(query);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Travels retrieved",
		meta: result.meta,
		data: result.data
	});
});

const updateTravel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const result = await TravelService.updateTravel(id, userId, req?.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Travel updated successfully',
    data: result
  });
});

const deleteTravel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  await TravelService.deleteTravel(id, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Travel deleted successfully',
    data: null
  });
});

const Travel = catchAsync(async (req: Request, res: Response) => {

  const result = await TravelService.Travel()

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Travel retrieved successfully',
    data: result
  });
});


const myTravel = catchAsync(async (req: Request, res: Response) => {

  const result = await TravelService.myTravel(req.user?.id as string)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Travel retrieved successfully',
    data: result
  });
});



export const TravelController = {
	createTravel,
	getTravel,
	getAll,
	updateTravel,
	deleteTravel,
	Travel,
	myTravel

};

