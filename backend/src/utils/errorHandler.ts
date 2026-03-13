import { Response } from 'express';
import { logger } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): Response => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  logger.error(`API Error [${statusCode}]:`, {
    message,
    error: error?.message || error,
    stack: error?.stack
  });

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && error && { error: error.message })
  });
};

export const handleControllerError = (
  res: Response,
  error: any,
  defaultMessage: string = 'Internal server error'
): Response => {
  if (error.statusCode) {
    return sendError(res, error.message, error.statusCode, error);
  }
  
  return sendError(res, defaultMessage, 500, error);
};
