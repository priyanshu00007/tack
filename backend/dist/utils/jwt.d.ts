import { IAuthTokens } from '@/types';
export declare class JWTService {
    private static readonly accessTokenSecret;
    private static readonly refreshTokenSecret;
    private static readonly accessTokenExpiry;
    private static readonly refreshTokenExpiry;
    static generateTokens(payload: {
        userId: string;
        email: string;
    }): IAuthTokens;
    static verifyAccessToken(token: string): any;
    static verifyRefreshToken(token: string): any;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static decodeToken(token: string): any;
    static isTokenExpired(token: string): boolean;
}
//# sourceMappingURL=jwt.d.ts.map