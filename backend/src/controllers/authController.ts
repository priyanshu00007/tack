import { Request, Response } from 'express';
import { User } from '../models/User';
import { JWTService } from '../utils/jwt';
import { logger } from '../utils/logger';
import { ILoginRequest, ISignupRequest, IAuthResponse } from '../types';
import { sendSuccess, sendError } from '../utils/errorHandler';

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, timezone }: ISignupRequest = req.body;

    logger.info('Signup request received:', { email, firstName, lastName });

    if (!email || !password || !firstName || !lastName) {
      return sendError(res, 'Email, password, first name, and last name are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 409);
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      timezone: timezone || 'UTC'
    });

    await user.save();

    const tokens = JWTService.generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    user.lastLogin = new Date();
    await user.save();

    logger.info(`New user registered: ${email}`);

    const response: IAuthResponse = {
      user: user.getPublicProfile(),
      tokens
    };

    return sendSuccess(res, 'User registered successfully', response, 201);

  } catch (error: any) {
    logger.error('Signup error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return sendError(res, 'Internal server error', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: ILoginRequest = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const tokens = JWTService.generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    const response: IAuthResponse = {
      user: user.getPublicProfile(),
      tokens
    };

    return sendSuccess(res, 'Login successful', response, 200);

  } catch (error: any) {
    logger.error('Login error:', error);
    return sendError(res, 'Internal server error', 500, error);
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken, displayName, photoURL, googleId, email } = req.body;

    if (!googleId || !email) {
      return sendError(res, 'Google ID and email are required', 400);
    }

    // Find or create user by Google ID or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.oauthProvider = 'google';
      }
      if (photoURL && !user.avatar) {
        user.avatar = photoURL;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user from Google data
      const names = (displayName || '').split(' ');
      user = new User({
        email,
        firstName: names[0] || 'User',
        lastName: names.slice(1).join(' ') || '',
        avatar: photoURL || null,
        googleId,
        oauthProvider: 'google',
        password: `google_${googleId}_${Date.now()}`, // Placeholder password for OAuth users
        lastLogin: new Date()
      });
      await user.save();
    }

    const tokens = JWTService.generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    logger.info(`Google login success: ${email}`);

    const response: IAuthResponse = {
      user: user.getPublicProfile(),
      tokens
    };

    return sendSuccess(res, 'Google login successful', response, 200);

  } catch (error: any) {
    logger.error('Google login error:', error);
    return sendError(res, 'Google login failed', 500, error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    const decoded = JWTService.verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendError(res, 'Invalid or inactive user', 401);
    }

    const tokens = JWTService.generateTokens({
      userId: user._id.toString(),
      email: user.email
    });

    logger.info(`Token refreshed for user: ${user.email}`);

    return sendSuccess(res, 'Token refreshed successfully', { tokens });

  } catch (error: any) {
    logger.error('Token refresh error:', error);
    return sendError(res, 'Invalid refresh token', 401, error);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    logger.info('User logged out');
    return sendSuccess(res, 'Logout successful');
  } catch (error: any) {
    logger.error('Logout error:', error);
    return sendError(res, 'Internal server error', 500, error);
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = req.user;
    return sendSuccess(res, 'Profile retrieved successfully', { user: user.getPublicProfile() });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    return sendError(res, 'Internal server error', 500, error);
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const allowedUpdates = ['firstName', 'lastName', 'avatar', 'timezone', 'bio', 'location', 'website'];
    const updates: any = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    logger.info(`Profile updated for user: ${user.email}`);
    return sendSuccess(res, 'Profile updated successfully', { user: user.getPublicProfile() });

  } catch (error: any) {
    logger.error('Update profile error:', error);
    return sendError(res, 'Internal server error', 500, error);
  }
};
