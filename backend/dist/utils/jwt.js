"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTService {
    static generateTokens(payload) {
        if (!this.accessTokenSecret || !this.refreshTokenSecret) {
            throw new Error('JWT secrets are not configured');
        }
        const accessOptions = {
            expiresIn: this.accessTokenExpiry,
            issuer: 'zenith-productivity',
            audience: 'zenith-users'
        };
        const refreshOptions = {
            expiresIn: this.refreshTokenExpiry,
            issuer: 'zenith-productivity',
            audience: 'zenith-users'
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, accessOptions);
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, refreshOptions);
        return { accessToken, refreshToken };
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.accessTokenSecret, {
            issuer: 'zenith-productivity',
            audience: 'zenith-users'
        });
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret, {
            issuer: 'zenith-productivity',
            audience: 'zenith-users'
        });
    }
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer '))
            return null;
        return authHeader.substring(7);
    }
    static decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    static isTokenExpired(token) {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp)
            return true;
        return Date.now() >= decoded.exp * 1000;
    }
}
exports.JWTService = JWTService;
JWTService.accessTokenSecret = process.env.JWT_SECRET;
JWTService.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
JWTService.accessTokenExpiry = process.env.JWT_EXPIRE ?? '7d';
JWTService.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRE ?? '30d';
//# sourceMappingURL=jwt.js.map