import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
interface BotDetectionResult {
    isBot: boolean;
    confidence: number;
    reasons: string[];
    riskScore: number;
    fingerprint: string;
}
export declare class BotDetectionService {
    private hll;
    private suspiciousIPs;
    private knownBots;
    private redis;
    private requestCache;
    constructor(redis: Redis);
    private initializeKnownBots;
    private startCleanupInterval;
    private generateFingerprint;
    private getClientIP;
    private detectKnownBots;
    private analyzeRequestPattern;
    private calculateRiskScore;
    detect(req: Request): Promise<BotDetectionResult>;
    trackRequest(req: Request, responseTime: number, statusCode: number): void;
    flagSuspiciousIP(ip: string, reason: string): void;
    getAnalytics(): Promise<{
        uniqueVisitors: number;
        totalRequests: number;
        suspiciousRequests: number;
        botRequests: number;
        topIPs: Array<{
            ip: string;
            requests: number;
        }>;
    }>;
    cleanup(): Promise<void>;
}
export declare const createBotDetectionMiddleware: (redis: Redis) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=botDetection.d.ts.map