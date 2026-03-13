"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = exports.sendError = exports.sendSuccess = void 0;
const logger_1 = require("./logger");
const sendSuccess = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500, error) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    logger_1.logger.error(`API Error [${statusCode}]:`, {
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
exports.sendError = sendError;
const handleControllerError = (res, error, defaultMessage = 'Internal server error') => {
    if (error.statusCode) {
        return (0, exports.sendError)(res, error.message, error.statusCode, error);
    }
    return (0, exports.sendError)(res, defaultMessage, 500, error);
};
exports.handleControllerError = handleControllerError;
//# sourceMappingURL=errorHandler.js.map