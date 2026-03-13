"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBotDetectionMiddleware = exports.BotDetectionService = void 0;
const hyperloglog_1 = require("hyperloglog");
const bloom_filters_1 = require("bloom-filters");
const logger_1 = require("./logger");
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const ua_parser_js_1 = require("ua-parser-js");
class BotDetectionService {
    constructor(redis) {
        this.requestCache = new Map();
        this.redis = redis;
        this.hll = new hyperloglog_1.HyperLogLog(12); // 2^12 registers
        this.suspiciousIPs = bloom_filters_1.BloomFilter.create(10000, 0.01); // 10k items, 1% false positive rate
        this.knownBots = bloom_filters_1.BloomFilter.create(1000, 0.01);
        this.initializeKnownBots();
        this.startCleanupInterval();
    }
    initializeKnownBots() {
        const knownBotPatterns = [
            'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
            'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
            'whatsapp', 'telegrambot', 'discordbot', 'slackbot', 'applebot',
            'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'crawler',
            'spider', 'scraper', 'bot', 'crawl', 'scan', 'test', 'monitor'
        ];
        knownBotPatterns.forEach(pattern => {
            this.knownBots.add(pattern.toLowerCase());
        });
    }
    startCleanupInterval() {
        // Clean up old request data every hour
        setInterval(() => {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            this.requestCache.forEach((requests, ip) => {
                const recentRequests = requests.filter(req => req.timestamp > oneHourAgo);
                if (recentRequests.length === 0) {
                    this.requestCache.delete(ip);
                }
                else {
                    this.requestCache.set(ip, recentRequests);
                }
            });
        }, 60 * 60 * 1000);
    }
    generateFingerprint(req) {
        const ua = (0, ua_parser_js_1.UAParser)(req.get('User-Agent') || '');
        const ip = this.getClientIP(req);
        // Create fingerprint from various request attributes
        const fingerprintData = [
            ip,
            ua.browser.name || '',
            ua.browser.version || '',
            ua.os.name || '',
            ua.os.version || '',
            ua.device.model || '',
            ua.device.type || '',
            req.get('Accept-Language') || '',
            req.get('Accept-Encoding') || '',
            req.get('Accept') || ''
        ].join('|');
        // Simple hash function for fingerprinting
        let hash = 0;
        for (let i = 0; i < fingerprintData.length; i++) {
            const char = fingerprintData.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
    getClientIP(req) {
        return (req.get('CF-Connecting-IP') || // Cloudflare
            req.get('X-Forwarded-For')?.split(',')[0]?.trim() || // Standard proxy
            req.get('X-Real-IP') || // Nginx
            req.connection?.remoteAddress || // Fallback
            req.socket?.remoteAddress || // Fallback
            req.ip // Express fallback
        ) || 'unknown';
    }
    detectKnownBots(userAgent) {
        const ua = userAgent.toLowerCase();
        // Check against known bot patterns
        for (const pattern of this.knownBots.array) {
            if (ua.includes(pattern)) {
                return true;
            }
        }
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /\+https?:\/\//, // URLs in UA (common for bots)
            /bot|crawler|spider|scraper|scan/i,
            /wget|curl|python|java|node|go|ruby|php/i,
            /monitor|check|test|audit/i
        ];
        return suspiciousPatterns.some(pattern => pattern.test(ua));
    }
    analyzeRequestPattern(ip, fingerprint) {
        const requests = this.requestCache.get(ip) || [];
        const now = new Date();
        // Recent requests (last 5 minutes)
        const recentRequests = requests.filter(req => (now.getTime() - req.timestamp.getTime()) < 5 * 60 * 1000);
        // Very recent requests (last 30 seconds)
        const burstRequests = requests.filter(req => (now.getTime() - req.timestamp.getTime()) < 30 * 1000);
        const frequency = recentRequests.length;
        const velocity = burstRequests.length;
        const burst = velocity > 10; // More than 10 requests in 30 seconds
        return { frequency, velocity, burst };
    }
    calculateRiskScore(isKnownBot, frequency, velocity, burst, geoData, userAgent) {
        let scoreValue = 0;
        const reasons = [];
        // Known bot patterns
        if (isKnownBot) {
            scoreValue += 50;
            reasons.push('Known bot user agent detected');
        }
        // High frequency requests
        if (frequency > 100) {
            scoreValue += 30;
            reasons.push('High request frequency');
        }
        else if (frequency > 50) {
            scoreValue += 15;
            reasons.push('Elevated request frequency');
        }
        // Burst requests
        if (burst) {
            scoreValue += 25;
            reasons.push('Request burst detected');
        }
        // High velocity
        if (velocity > 20) {
            scoreValue += 20;
            reasons.push('High request velocity');
        }
        // Geographic anomalies
        if (geoData) {
            // Check for data center IPs
            const dataCenterPatterns = ['aws', 'google cloud', 'azure', 'digital ocean', 'vultr'];
            if (dataCenterPatterns.some(pattern => geoData.org?.toLowerCase().includes(pattern))) {
                scoreValue += 15;
                reasons.push('Data center IP detected');
            }
        }
        // Suspicious user agent characteristics
        const ua = userAgent.toLowerCase();
        if (!ua.includes('mozilla') || ua.length < 20) {
            scoreValue += 10;
            reasons.push('Suspicious user agent');
        }
        // Missing common headers
        // This would be checked in the main detection method
        return { score: scoreValue, reasons };
    }
    async detect(req) {
        const ip = this.getClientIP(req);
        const userAgent = req.get('User-Agent') || '';
        const fingerprint = this.generateFingerprint(req);
        // Check Redis cache first
        const cacheKey = `bot_detection:${ip}:${fingerprint}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        // Analyze request pattern
        const pattern = this.analyzeRequestPattern(ip, fingerprint);
        // Geographic analysis
        const geoData = geoip_lite_1.default.lookup(ip);
        // Known bot detection
        const isKnownBot = this.detectKnownBots(userAgent);
        // Risk calculation
        const { score, reasons } = this.calculateRiskScore(isKnownBot, pattern.frequency, pattern.velocity, pattern.burst, geoData, userAgent);
        // Check suspicious IPs bloom filter
        const isSuspiciousIP = this.suspiciousIPs.has(ip);
        if (isSuspiciousIP) {
            const updatedScore = score + 20;
            reasons.push('Previously flagged as suspicious');
        }
        // Update HyperLogLog for unique visitor tracking
        this.hll.add(fingerprint);
        // Determine if it's a bot
        const finalScore = isSuspiciousIP ? score + 20 : score;
        const isBot = finalScore >= 50 || isKnownBot;
        const confidence = Math.min(finalScore / 100, 1);
        const result = {
            isBot,
            confidence,
            reasons,
            riskScore: finalScore,
            fingerprint
        };
        // Cache result for 5 minutes
        await this.redis.setex(cacheKey, 300, JSON.stringify(result));
        // Log high-risk requests
        if (finalScore >= 30) {
            logger_1.logger.warn('Suspicious request detected', {
                ip,
                fingerprint,
                score: finalScore,
                reasons,
                userAgent,
                endpoint: req.path,
                method: req.method
            });
        }
        return result;
    }
    trackRequest(req, responseTime, statusCode) {
        const ip = this.getClientIP(req);
        const fingerprint = this.generateFingerprint(req);
        const metrics = {
            ip,
            userAgent: req.get('User-Agent') || '',
            fingerprint,
            timestamp: new Date(),
            endpoint: req.path,
            method: req.method,
            statusCode,
            responseTime
        };
        // Store in memory cache
        if (!this.requestCache.has(ip)) {
            this.requestCache.set(ip, []);
        }
        this.requestCache.get(ip).push(metrics);
        // Also store in Redis for persistence
        const redisKey = `requests:${ip}:${new Date().toISOString().split('T')[0]}`;
        this.redis.lpush(redisKey, JSON.stringify(metrics));
        this.redis.expire(redisKey, 24 * 60 * 60); // 24 hours
    }
    flagSuspiciousIP(ip, reason) {
        this.suspiciousIPs.add(ip);
        logger_1.logger.warn('IP flagged as suspicious', {
            ip,
            reason,
            timestamp: new Date().toISOString()
        });
        // Store in Redis for persistence
        this.redis.sadd('suspicious_ips', ip);
        this.redis.expire('suspicious_ips', 30 * 24 * 60 * 60); // 30 days
    }
    async getAnalytics() {
        const uniqueVisitors = this.hll.count();
        // Get analytics from Redis
        const totalRequests = await this.redis.get('analytics:total_requests') || '0';
        const suspiciousRequests = await this.redis.get('analytics:suspicious_requests') || '0';
        const botRequests = await this.redis.get('analytics:bot_requests') || '0';
        // Get top IPs
        const topIPs = await this.redis.zrevrange('analytics:top_ips', 0, 9, 'WITHSCORES');
        const formattedTopIPs = [];
        for (let i = 0; i < topIPs.length; i += 2) {
            formattedTopIPs.push({
                ip: topIPs[i],
                requests: parseInt(topIPs[i + 1])
            });
        }
        return {
            uniqueVisitors,
            totalRequests: parseInt(totalRequests),
            suspiciousRequests: parseInt(suspiciousRequests),
            botRequests: parseInt(botRequests),
            topIPs: formattedTopIPs
        };
    }
    async cleanup() {
        await this.redis.quit();
    }
}
exports.BotDetectionService = BotDetectionService;
// Middleware factory
const createBotDetectionMiddleware = (redis) => {
    const botDetection = new BotDetectionService(redis);
    return async (req, res, next) => {
        const startTime = Date.now();
        try {
            // Detect bots
            const result = await botDetection.detect(req);
            // Add detection result to request
            req.botDetection = result;
            // Block high-risk bots
            if (result.isBot && result.confidence > 0.8) {
                logger_1.logger.warn('Bot blocked', {
                    ip: botDetection['getClientIP'](req),
                    fingerprint: result.fingerprint,
                    confidence: result.confidence,
                    reasons: result.reasons
                });
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                    error: 'BOT_DETECTED'
                });
            }
            // Track request
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                botDetection.trackRequest(req, responseTime, res.statusCode);
            });
            next();
        }
        catch (error) {
            logger_1.logger.error('Bot detection error:', error);
            next(); // Allow request to proceed if detection fails
        }
    };
};
exports.createBotDetectionMiddleware = createBotDetectionMiddleware;
//# sourceMappingURL=botDetection.js.map