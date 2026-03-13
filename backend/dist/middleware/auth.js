"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSubscription = exports.optionalAuth = exports.authenticate = void 0;
const jwt_1 = require("@/utils/jwt");
const User_1 = require("../models/User");
const logger_1 = require("@/utils/logger");
const authenticate = async (req, res, next) => {
    try {
        const token = jwt_1.JWTService.extractTokenFromHeader(req.headers.authorization);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }
        const decoded = jwt_1.JWTService.verifyAccessToken(token);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user'
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        const token = jwt_1.JWTService.extractTokenFromHeader(req.headers.authorization);
        if (token) {
            const decoded = jwt_1.JWTService.verifyAccessToken(token);
            const user = await User_1.User.findById(decoded.userId);
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        // For optional auth, we don't return error, just continue without user
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireSubscription = (plan) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const userPlan = req.user.subscription?.plan;
        if (userPlan !== plan && userPlan !== 'enterprise') {
            return res.status(403).json({
                success: false,
                message: `${plan} subscription required`
            });
        }
        next();
    };
};
exports.requireSubscription = requireSubscription;
//# sourceMappingURL=auth.js.map