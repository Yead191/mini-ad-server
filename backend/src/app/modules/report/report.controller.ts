import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { ReportService } from './report.service';

const getReport = catchAsync(async (req: Request, res: Response) => {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const groupBy = (req.query.group_by as string) || 'campaign';

  const result = await ReportService.generateReport(from, to, groupBy);

  // Return the report JSON as specified in the PDF
  return res.status(StatusCodes.OK).json(result);
});

export const ReportController = {
  getReport,
};
