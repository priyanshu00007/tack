import jwt, { SignOptions } from 'jsonwebtoken';

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private static readonly accessTokenSecret = process.env.JWT_SECRET!;
  private static readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;

  private static readonly accessTokenExpiry: string =
    process.env.JWT_EXPIRE ?? '7d';

  private static readonly refreshTokenExpiry: string =
    process.env.JWT_REFRESH_EXPIRE ?? '30d';

  static generateTokens(payload: { userId: string; email: string }): IAuthTokens {
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessOptions: SignOptions = {
      expiresIn: this.accessTokenExpiry as SignOptions["expiresIn"],
      issuer: 'zenith-productivity',
      audience: 'zenith-users'
    };

    const refreshOptions: SignOptions = {
      expiresIn: this.refreshTokenExpiry as SignOptions["expiresIn"],
      issuer: 'zenith-productivity',
      audience: 'zenith-users'
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, accessOptions);
    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, refreshOptions);

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessTokenSecret, {
      issuer: 'zenith-productivity',
      audience: 'zenith-users'
    });
  }

  static verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshTokenSecret, {
      issuer: 'zenith-productivity',
      audience: 'zenith-users'
    });
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }

  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  static isTokenExpired(token: string): boolean {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  }
}
