import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CampaignService } from './campaign.service';

const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignService.createCampaignToDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Campaign created successfully',
    data: result,
  });
});

const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const result = await CampaignService.getAllCampaignsFromDB();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaigns retrieved successfully',
    data: result,
  });
});

const getCampaignById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CampaignService.getCampaignByIdFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign retrieved successfully',
    data: result,
  });
});

const updateCampaign = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CampaignService.updateCampaignToDB(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign updated successfully',
    data: result,
  });
});

const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CampaignService.deleteCampaignFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Campaign deleted successfully',
    data: result,
  });
});

export const CampaignController = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
