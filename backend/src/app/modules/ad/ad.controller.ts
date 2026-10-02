import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { AdService } from './ad.service';

const getAd = catchAsync(async (req: Request, res: Response) => {
  const size = req.query.size as string | undefined;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  const ad = await AdService.serveAd(size, clientIp);

  if (!ad) {
    // 204 No Content when nothing matches the requested size or frequency capped
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  // Return the JSON directly as specified in the PDF
  return res.status(StatusCodes.OK).json(ad);
});

export const AdController = {
  getAd,
};
