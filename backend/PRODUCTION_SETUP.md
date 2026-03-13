# 🚀 Production-Grade Backend Setup Guide

## 📋 Overview

This backend includes enterprise-grade features:
- **HyperLogLog Bot Detection** - Advanced bot vs human detection
- **Zod Validation** - Strong business logic validation
- **Redis Caching** - High-performance caching layer
- **Advanced Rate Limiting** - Multi-tier rate limiting
- **Security Middleware** - Comprehensive security stack
- **Real-time Analytics** - Live monitoring and metrics
- **Production Logging** - Structured logging with Winston

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd d:\tack\tack\backend

# Full production installation
npm install

# If issues occur, try staged installation:
npm install express mongoose bcryptjs jsonwebtoken cors helmet dotenv
npm install zod joi redis ioredis hyperloglog bloom-filters
npm install winston morgan compression express-rate-limit
npm install @types/node @types/express typescript ts-node nodemon
```

### 2. Environment Configuration

Create `.env` file:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zenith-production

# Redis Configuration
REDIS_URL=redis://username:password@redis-host:6379
REDIS_PASSWORD=your-redis-password

# JWT Configuration
JWT_SECRET=super-secure-production-jwt-secret-key-256-bits
JWT_REFRESH_SECRET=super-secure-production-refresh-secret-key-256-bits
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Security Configuration
BCRYPT_ROUNDS=14
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Bot Detection
HYPERLOGLOG_WINDOW=3600
BOT_DETECTION_THRESHOLD=0.8

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### 3. Database Setup

**MongoDB:**
```bash
# Connect to MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/zenith-production"

# Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.tasks.createIndex({ userId: 1, date: -1 })
db.habits.createIndex({ userId: 1, completedDates: 1 })
db.goals.createIndex({ userId: 1, targetDate: 1 })
```

**Redis:**
```bash
# Connect to Redis
redis-cli -h redis-host -p 6379

# Test connection
ping
```

### 4. Start Production Server

```bash
# Build TypeScript
npm run build

# Start production server
npm start

# Or with PM2 for clustering
pm2 start ecosystem.config.js
```

## 🔧 Production Features

### 1. Bot Detection System

**HyperLogLog Algorithm:**
- Tracks unique visitors with minimal memory
- Distinguishes bots from humans using multiple signals
- Real-time fingerprinting and behavior analysis

**Detection Factors:**
- User-Agent analysis
- Request frequency patterns
- Geographic IP analysis
- Header validation
- Behavioral anomalies

### 2. Advanced Validation

**Zod Schemas:**
```typescript
// Strong password validation
passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 
    'Password must contain uppercase, lowercase, number, and special character')

// Business logic validation
validateBusinessHours: (date: Date) => {
  const hour = date.getHours();
  if (hour < 9 || hour > 18) {
    return { valid: false, message: 'Tasks must be scheduled during business hours' };
  }
  return { valid: true };
}
```

### 3. Rate Limiting

**Multi-Tier Protection:**
```typescript
// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

// Endpoint-specific limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5 // limit to 5 login attempts per 15 minutes
});

// Redis-backed distributed rate limiting
const redisLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});
```

### 4. Security Stack

**Middleware Layers:**
```typescript
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Input sanitization
app.use(expressMongoSanitize());
app.use(xss());

// Parameter pollution
app.use(hpp());
```

### 5. Caching Strategy

**Redis Caching:**
```typescript
// User session caching
await redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));

// API response caching
await redis.setex(`api:${endpoint}:${hash}`, 300, JSON.stringify(response));

// Bot detection caching
await redis.setex(`bot_detection:${ip}:${fingerprint}`, 300, JSON.stringify(result));
```

### 6. Monitoring & Analytics

**Real-time Metrics:**
```typescript
// Request tracking
botDetection.trackRequest(req, responseTime, statusCode);

// Analytics dashboard
const analytics = await botDetection.getAnalytics();
console.log({
  uniqueVisitors: analytics.uniqueVisitors,
  totalRequests: analytics.totalRequests,
  suspiciousRequests: analytics.suspiciousRequests,
  botRequests: analytics.botRequests
});
```

## 📊 Performance Optimization

### 1. Database Optimization

**MongoDB Indexes:**
```javascript
// Compound indexes for common queries
db.tasks.createIndex({ userId: 1, status: 1, date: -1 });
db.habits.createIndex({ userId: 1, isActive: 1, "completedDates": -1 });
db.goals.createIndex({ userId: 1, status: 1, targetDate: 1 });

// Text search indexes
db.tasks.createIndex({ title: "text", description: "text" });
```

### 2. Connection Pooling

**MongoDB:**
```typescript
mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0
});
```

**Redis:**
```typescript
const redis = new Redis(REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});
```

## 🔍 Monitoring & Debugging

### 1. Logging

**Winston Configuration:**
```typescript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### 2. Health Checks

**Endpoint: `/health`**
```json
{
  "success": true,
  "message": "Zenith Productivity API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "uptime": 3600,
  "memory": {
    "used": "150MB",
    "total": "512MB"
  },
  "database": {
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

### 3. Metrics

**Prometheus Metrics:**
```typescript
const promClient = require('prom-client');

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});
```

## 🚀 Deployment

### 1. Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### 2. PM2 Clustering

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'zenith-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log'
  }]
};
```

### 3. Environment Variables

**Production Checklist:**
- [ ] Strong JWT secrets (256-bit)
- [ ] MongoDB connection with SSL
- [ ] Redis with authentication
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Logging level set to 'info' or 'warn'
- [ ] Database indexes created
- [ ] Backup strategy implemented

## 🧪 Testing

### 1. Load Testing

**Artillery Configuration:**
```yaml
config:
  target: 'https://api.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
```

### 2. Security Testing

```bash
# Test bot detection
curl -H "User-Agent: BadBot/1.0" https://api.yourdomain.com/health

# Test rate limiting
for i in {1..10}; do curl https://api.yourdomain.com/api/auth/login; done

# Test input validation
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid-email", "password": "123"}'
```

## 📈 Scaling

### 1. Horizontal Scaling

- **Load Balancer:** Nginx or AWS ALB
- **Multiple Instances:** PM2 clustering
- **Database:** MongoDB replica set
- **Cache:** Redis cluster

### 2. Vertical Scaling

- **CPU:** 2+ cores for production
- **Memory:** 2GB+ RAM
- **Storage:** SSD for database
- **Network:** High bandwidth for API calls

## 🔧 Troubleshooting

### Common Issues:

1. **High Memory Usage:**
   - Check Redis memory usage
   - Monitor MongoDB connections
   - Review caching strategy

2. **Slow Response Times:**
   - Check database indexes
   - Monitor query performance
   - Review caching hit rates

3. **Bot Detection False Positives:**
   - Adjust detection threshold
   - Review fingerprinting logic
   - Monitor false positive rates

4. **Rate Limiting Issues:**
   - Check Redis connectivity
   - Review rate limit configurations
   - Monitor distributed rate limiting

## 📚 Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Set up databases
4. ✅ Deploy to production
5. 🔄 Monitor performance
6. 🔄 Scale as needed
7. 🔄 Optimize based on metrics

This production setup provides enterprise-grade security, performance, and reliability for the Zenith Productivity Suite! 🎯
