import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CreativeService } from './creative.service';

const createCreative = catchAsync(async (req: Request, res: Response) => {
  const result = await CreativeService.createCreativeToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Creative created successfully',
    data: result,
  });
});

const getAllCreatives = catchAsync(async (req: Request, res: Response) => {
  const campaignId = req.query.campaign_id as string | undefined;
  const result = await CreativeService.getAllCreativesFromDB(campaignId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Creatives retrieved successfully',
    data: result,
  });
});

const getCreativeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CreativeService.getCreativeByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Creative retrieved successfully',
    data: result,
  });
});

const updateCreative = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CreativeService.updateCreativeToDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Creative updated successfully',
    data: result,
  });
});

const deleteCreative = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CreativeService.deleteCreativeFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Creative deleted successfully',
    data: result,
  });
});

export const CreativeController = {
  createCreative,
  getAllCreatives,
  getCreativeById,
  updateCreative,
  deleteCreative,
};
