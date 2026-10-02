import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { IErrorMessage } from '../types/errors.types';

export const handlePrismaClientKnownRequestError = (
  error: Prisma.PrismaClientKnownRequestError
) => {
  let statusCode = StatusCodes.BAD_REQUEST;
  let message = 'Database Error';
  let errorMessages: IErrorMessage[] = [];

  if (error.code === 'P2002') {
    const target = (error.meta?.target as string[]) || [];
    statusCode = StatusCodes.CONFLICT;
    message = `Duplicate key violation: ${target.join(', ')}`;
    errorMessages = [
      {
        path: target.join(', '),
        message: `${target.join(', ')} already exists`,
      },
    ];
  } else if (error.code === 'P2025') {
    statusCode = StatusCodes.NOT_FOUND;
    message = (error.meta?.cause as string) || 'Record not found';
    errorMessages = [
      {
        path: '',
        message,
      },
    ];
  } else {
    message = error.message;
    errorMessages = [
      {
        path: '',
        message: error.message,
      },
    ];
  }

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export const handlePrismaValidationError = (
  error: Prisma.PrismaClientValidationError
) => {
  return {
    statusCode: StatusCodes.BAD_REQUEST,
    message: 'Prisma Validation Error',
    errorMessages: [
      {
        path: '',
        message: error.message,
      },
    ],
  };
};
