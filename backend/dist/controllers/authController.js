"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refreshToken = exports.login = exports.signup = void 0;
const User_1 = require("@/models/User");
const jwt_1 = require("@/utils/jwt");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/utils/errorHandler");
const signup = async (req, res) => {
    try {
        const { email, password, firstName, lastName, timezone } = req.body;
        logger_1.logger.info('Signup request received:', { email, firstName, lastName });
        // Basic validation
        if (!email || !password || !firstName || !lastName) {
            return (0, errorHandler_1.sendError)(res, 'Email, password, first name, and last name are required', 400);
        }
        if (password.length < 6) {
            return (0, errorHandler_1.sendError)(res, 'Password must be at least 6 characters long', 400);
        }
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            return (0, errorHandler_1.sendError)(res, 'User with this email already exists', 409);
        }
        // Create new user
        const user = new User_1.User({
            email,
            password,
            firstName,
            lastName,
            timezone: timezone || 'UTC'
        });
        await user.save();
        // Generate tokens
        const tokens = jwt_1.JWTService.generateTokens({
            userId: user._id.toString(),
            email: user.email
        });
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        logger_1.logger.info(`New user registered: ${email}`);
        const response = {
            user: user.getPublicProfile(),
            tokens
        };
        return (0, errorHandler_1.sendSuccess)(res, 'User registered successfully', response, 201);
    }
    catch (error) {
        logger_1.logger.error('Signup error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        return (0, errorHandler_1.sendError)(res, 'Internal server error', 500, error);
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Basic validation
        if (!email || !password) {
            return (0, errorHandler_1.sendError)(res, 'Email and password are required', 400);
        }
        // Find user with password
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            return (0, errorHandler_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Check if user is active
        if (!user.isActive) {
            return (0, errorHandler_1.sendError)(res, 'Account is deactivated', 401);
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return (0, errorHandler_1.sendError)(res, 'Invalid email or password', 401);
        }
        // Generate tokens
        const tokens = jwt_1.JWTService.generateTokens({
            userId: user._id.toString(),
            email: user.email
        });
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        logger_1.logger.info(`User logged in: ${email}`);
        const response = {
            user: user.getPublicProfile(),
            tokens
        };
        return (0, errorHandler_1.sendSuccess)(res, 'Login successful', response, 200);
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        return (0, errorHandler_1.sendError)(res, 'Internal server error', 500, error);
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }
        // Verify refresh token
        const decoded = jwt_1.JWTService.verifyRefreshToken(refreshToken);
        // Find user
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user'
            });
        }
        // Generate new tokens
        const tokens = jwt_1.JWTService.generateTokens({
            userId: user._id.toString(),
            email: user.email
        });
        logger_1.logger.info(`Token refreshed for user: ${user.email}`);
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: { tokens }
        });
    }
    catch (error) {
        logger_1.logger.error('Token refresh error:', error);
        return (0, errorHandler_1.sendError)(res, 'Invalid refresh token', 401, error);
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just return success
        logger_1.logger.info('User logged out');
        return (0, errorHandler_1.sendSuccess)(res, 'Logout successful');
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        return (0, errorHandler_1.sendError)(res, 'Internal server error', 500, error);
    }
};
exports.logout = logout;
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        return (0, errorHandler_1.sendSuccess)(res, 'Profile retrieved successfully', { user: user.getPublicProfile() });
    }
    catch (error) {
        logger_1.logger.error('Get profile error:', error);
        return (0, errorHandler_1.sendError)(res, 'Internal server error', 500, error);
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map