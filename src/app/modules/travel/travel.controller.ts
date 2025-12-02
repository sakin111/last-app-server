import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { TravelService } from "./travel.service";

const createTravel = catchAsync(async (req: Request & { user?: any }, res: Response) => {
	const user = req.user;
	const files = (req as any).files as Express.Multer.File[] | undefined;
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

export const TravelController = {
	createTravel,
	getTravel,
	getAll
};

