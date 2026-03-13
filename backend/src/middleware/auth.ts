import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = JWTService.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = JWTService.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = JWTService.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = JWTService.verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const requireSubscription = (plan: 'pro' | 'enterprise') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
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
