import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    statusCode?: number;
}
export declare const sendSuccess: <T>(res: Response, message: string, data?: T, statusCode?: number) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number, error?: any) => Response;
export declare const handleControllerError: (res: Response, error: any, defaultMessage?: string) => Response;
//# sourceMappingURL=errorHandler.d.ts.map