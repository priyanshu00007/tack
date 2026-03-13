# 🚀 PostgreSQL + Prisma Setup Guide

## 📋 Overview

Clean, modern backend with:
- **PostgreSQL** - Production-grade database
- **Prisma** - Modern ORM with type safety
- **Express** - Simple, reliable web framework
- **Zod** - Type-safe validation
- **JWT + Argon2** - Modern authentication
- **OpenTelemetry + Prometheus** - Modern monitoring

## 🛠️ Quick Setup

### 1. Install Dependencies

```bash
cd d:\tack\tack\backend

# Use the clean package.json
copy package.clean.json package.json

# Install all dependencies
npm install
```

### 2. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Create database
createdb zenith_productivity

# Or use pgAdmin GUI
```

**Option B: Docker PostgreSQL**
```bash
docker run --name zenith-postgres \
  -e POSTGRES_DB=zenith_productivity \
  -e POSTGRES_USER=zenith_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Cloud PostgreSQL**
- **Supabase** (Free tier available)
- **Neon** (Modern PostgreSQL serverless)
- **Railway** (Simple deployment)
- **AWS RDS** (Enterprise)

### 3. Environment Configuration

```bash
# Copy environment template
copy env.postgresql.example .env

# Edit .env with your database URL
DATABASE_URL=postgresql://zenith_user:your_password@localhost:5432/zenith_productivity
```

### 4. Initialize Prisma

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │     Prisma      │    │   PostgreSQL    │
│                 │    │                 │    │                 │
│   REST API      │◄──►│   Type-Safe     │◄──►│   Relational    │
│   Validation    │    │   ORM           │    │   Database      │
│   Middleware    │    │   Migrations    │    │   ACID          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Database Schema

### Core Models:

**User:**
```typescript
{
  id: string
  email: string (unique)
  password: string (argon2 hashed)
  firstName: string
  lastName: string
  preferences: JSON
  subscription: JSON
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Task:**
```typescript
{
  id: string
  userId: string
  title: string
  description?: string
  date: DateTime
  estimatedMinutes: number
  quadrant: 'IU' | 'IBNU' | 'NIBU' | 'NINU'
  status: 'ACTIVE' | 'DONE' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  tags: string[]
  completedAt?: DateTime
}
```

**Habit:**
```typescript
{
  id: string
  userId: string
  name: string
  targetDays: number
  completedDates: DateTime[]
  streak: number
  bestStreak: number
  isActive: boolean
}
```

**Goal:**
```typescript
{
  id: string
  userId: string
  title: string
  targetDate: DateTime
  category: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  progress: number
  milestones: Milestone[]
}
```

## 🔧 Key Features

### 1. Type-Safe Database Operations

```typescript
import { prisma } from '@/config/prisma';

// Create user with type safety
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
    preferences: {
      theme: 'dark',
      dailyCapacityMinutes: 480
    }
  }
});

// Get user's tasks for today
const todayTasks = await prisma.task.findMany({
  where: {
    userId: user.id,
    date: {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
      lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  },
  orderBy: {
    date: 'asc'
  }
});
```

### 2. Zod Validation Integration

```typescript
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
  estimatedMinutes: z.number().min(5).max(480),
  quadrant: z.enum(['IU', 'IBNU', 'NIBU', 'NINU']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
});

// Type-safe validation
const validatedData = createTaskSchema.parse(req.body);
```

### 3. Modern Authentication

```typescript
import argon2 from 'argon2';

// Hash password
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
});

// Verify password
const isValid = await argon2.verify(hashedPassword, inputPassword);
```

### 4. Real-time Monitoring

```typescript
import { promClient } from 'prom-client';

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Track request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
});
```

## 🚀 Production Deployment

### 1. Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=256-bit-secret-key
REDIS_URL=redis://host:6379
```

### 2. Database Migrations

```bash
# Generate migration from schema changes
npx prisma migrate dev --name add_new_field

# Deploy migrations to production
npx prisma migrate deploy
```

### 3. Performance Optimization

**Database Indexes:**
```sql
-- Automatically created by Prisma
CREATE INDEX "tasks_userId_date_idx" ON "tasks"("userId", "date");
CREATE INDEX "tasks_userId_status_idx" ON "tasks"("userId", "status");
```

**Connection Pooling:**
```typescript
// Prisma handles connection pooling automatically
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
```

## 📈 Monitoring & Analytics

### 1. Health Check Endpoint

```typescript
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});
```

### 2. Metrics Dashboard

Access at: `http://localhost:5000/metrics`

```typescript
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

## 🧪 Testing

### 1. Unit Tests

```typescript
import { prisma } from '@/config/prisma';

describe('User Service', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should create user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    expect(user.email).toBe('test@example.com');
  });
});
```

### 2. Integration Tests

```typescript
import request from 'supertest';
import app from '@/index';

describe('POST /api/auth/signup', () => {
  it('should create new user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

## 🔍 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Test connection
   psql -h localhost -p 5432 -U zenith_user -d zenith_productivity
   ```

2. **Prisma Client Generation Failed**
   ```bash
   # Regenerate client
   npx prisma generate
   
   # Check schema syntax
   npx prisma validate
   ```

3. **Migration Conflicts**
   ```bash
   # Reset database (dev only)
   npx prisma migrate reset
   
   # Create new migration
   npx prisma migrate dev --name fresh_start
   ```

## 📚 Next Steps

1. ✅ Install dependencies
2. ✅ Set up PostgreSQL
3. ✅ Configure environment
4. ✅ Run Prisma migrations
5. ✅ Start development server
6. 🔄 Create API endpoints
7. 🔄 Add authentication middleware
8. 🔄 Implement business logic
9. 🔄 Add monitoring
10. 🔄 Deploy to production

## 🎯 Benefits of This Setup

- **Type Safety**: End-to-end TypeScript + Prisma + Zod
- **Performance**: PostgreSQL + connection pooling + indexes
- **Security**: Argon2 + JWT + rate limiting
- **Monitoring**: OpenTelemetry + Prometheus
- **Scalability**: Horizontal scaling ready
- **Developer Experience**: Prisma Studio + hot reload

This is a modern, production-ready setup that follows 2024 best practices! 🚀
