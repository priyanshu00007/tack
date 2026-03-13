# 🚀 MongoDB Setup Guide

## 📋 Overview

Switched back to MongoDB with the optimized dependency stack:
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM with TypeScript support
- **Express** - Simple, reliable web framework
- **Zod** - Type-safe validation
- **Argon2** - Modern authentication
- **Optimized dependencies** - Clean, modern stack

## 🛠️ Quick Setup

### 1. Install Dependencies

```bash
cd d:\tack\tack\backend

# Use the optimized package.json (now with MongoDB)
copy package.optimized.json package.json

# Install all dependencies
npm install
```

### 2. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Or use mongosh
mongosh
```

**Option B: Docker MongoDB**
```bash
docker run --name zenith-mongodb \
  -e MONGO_INITDB_DATABASE=zenith_productivity \
  -p 27017:27017 \
  -d mongo:7
```

**Option C: MongoDB Atlas (Cloud)**
- **Free tier available** (512MB)
- **No server management**
- **Built-in security**
- Sign up at: https://www.mongodb.com/cloud/atlas

### 3. Environment Configuration

```bash
# Copy environment template
copy env.mongodb.example .env

# Edit .env with your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/zenith-productivity
```

### 4. Start Development Server

```bash
npm run dev
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express.js    │    │    Mongoose     │    │    MongoDB      │
│                 │    │                 │    │                 │
│   REST API      │◄──►│   ODM           │◄──►│   Document      │
│   Validation    │    │   Schemas       │    │   Database      │
│   Middleware    │    │   Models        │    │   Collections    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 Database Models (Mongoose)

### Core Models:

**User Model:**
```typescript
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  preferences: {
    theme: 'light' | 'dark';
    dailyCapacityMinutes: number;
    notifications: {
      email: boolean;
      push: boolean;
      taskReminders: boolean;
      habitReminders: boolean;
    };
  };
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    features: string[];
  };
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Task Model:**
```typescript
interface ITask {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  date: Date;
  estimatedMinutes: number;
  quadrant: 'iu' | 'ibnu' | 'nibu' | 'ninu';
  status: 'active' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Habit Model:**
```typescript
interface IHabit {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  description?: string;
  targetDays: number;
  completedDates: Date[];
  streak: number;
  bestStreak: number;
  isActive: boolean;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Goal Model:**
```typescript
interface IGoal {
  _id: ObjectId;
  userId: ObjectId;
  title: string;
  description?: string;
  targetDate: Date;
  category: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  milestones: {
    title: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  tags: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Key Features

### 1. Type-Safe Database Operations

```typescript
import { User, Task, Habit, Goal } from '@/models';

// Create user with type safety
const user = await User.create({
  email: 'user@example.com',
  password: hashedPassword,
  firstName: 'John',
  lastName: 'Doe',
  preferences: {
    theme: 'dark',
    dailyCapacityMinutes: 480
  }
});

// Get user's tasks for today
const todayTasks = await Task.find({
  userId: user.id,
  date: {
    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
    $lt: new Date(new Date().setHours(23, 59, 59, 999))
  }
}).sort({ date: 'asc' });
```

### 2. Mongoose Schemas with Validation

```typescript
import { Schema, model } from 'mongoose';

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

export const User = model<IUser>('User', userSchema);
```

### 3. Modern Authentication with Argon2

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

### 4. Database Indexes for Performance

```typescript
// Compound indexes for common queries
taskSchema.index({ userId: 1, date: -1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, quadrant: 1 });
taskSchema.index({ userId: 1, date: 1, status: 1 });

habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, completedDates: 1 });

goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, targetDate: 1 });
goalSchema.index({ userId: 1, category: 1 });
```

## 🚀 Production Deployment

### 1. Environment Variables

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zenith-production
JWT_SECRET=256-bit-secret-key
REDIS_URL=redis://host:6379
```

### 2. Connection Pooling

```typescript
mongoose.connect(uri, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
});
```

### 3. Database Security

```typescript
// Enable authentication in production
if (process.env.NODE_ENV === 'production') {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected with authentication');
  });
}
```

## 📈 Monitoring & Analytics

### 1. Health Check Endpoint

```typescript
app.get('/health', async (req, res) => {
  try {
    // Check MongoDB connection
    await mongoose.connection.db.admin().ping();
    
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

### 2. Database Metrics

```typescript
// Get collection stats
const dbStats = await mongoose.connection.db.stats();
const collectionStats = await mongoose.connection.db.collection('users').stats();

console.log({
  database: dbStats,
  users: collectionStats,
  uptime: process.uptime()
});
```

## 🧪 Testing

### 1. Unit Tests with MongoDB Memory Server

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB is running
   mongosh --eval "db.adminCommand('ping')"
   
   # Test connection
   mongosh "mongodb://localhost:27017/zenith-productivity"
   ```

2. **Authentication Issues**
   ```bash
   # Check user exists
   mongosh "mongodb://localhost:27017/zenith-productivity" --eval "db.users.findOne()"
   ```

3. **Performance Issues**
   ```bash
   # Check indexes
   mongosh "mongodb://localhost:27017/zenith-productivity" --eval "db.tasks.getIndexes()"
   
   # Check slow queries
   mongosh "mongodb://localhost:27017/zenith-productivity" --eval "db.setProfilingLevel(2)"
   ```

## 📚 Next Steps

1. ✅ Install dependencies
2. ✅ Set up MongoDB
3. ✅ Configure environment
4. ✅ Start development server
5. 🔄 Create Mongoose models
6. 🔄 Add authentication middleware
7. 🔄 Implement business logic
8. 🔄 Add monitoring
9. 🔄 Deploy to production

## 🎯 Benefits of MongoDB Setup

- **Flexible Schema**: Easy to evolve data structure
- **Document Model**: Natural fit for productivity data
- **Scalability**: Horizontal scaling with sharding
- **Performance**: In-memory operations with WiredTiger
- **Ecosystem**: Rich tooling and cloud options
- **Developer Experience**: Mongoose + TypeScript = Great DX

This MongoDB setup provides flexibility and performance for the Zenith Productivity Suite! 🚀
