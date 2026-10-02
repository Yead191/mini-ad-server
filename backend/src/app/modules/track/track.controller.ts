import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import catchAsync from '../../../shared/catchAsync';
import { TrackService } from './track.service';

// 1x1 transparent GIF buffer
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const trackImpression = catchAsync(async (req: Request, res: Response) => {
  const creativeId = req.query.c as string | undefined;

  if (!creativeId || typeof creativeId !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Creative ID parameter "c" is required');
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const userAgent = req.headers['user-agent'];

  await TrackService.recordImpression(creativeId, clientIp, userAgent);

  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Content-Length', TRANSPARENT_GIF_BUFFER.length.toString());
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return res.status(StatusCodes.OK).end(TRANSPARENT_GIF_BUFFER);
});

const trackClick = catchAsync(async (req: Request, res: Response) => {
  const creativeId = req.query.c as string | undefined;

  if (!creativeId || typeof creativeId !== 'string') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Creative ID parameter "c" is required');
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string) ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const userAgent = req.headers['user-agent'];

  const destinationUrl = await TrackService.recordClick(
    creativeId,
    clientIp,
    userAgent
  );

  return res.redirect(StatusCodes.MOVED_TEMPORARILY, destinationUrl);
});

export const TrackController = {
  trackImpression,
  trackClick,
};
