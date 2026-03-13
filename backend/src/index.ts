import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import goalRoutes from './routes/goals';
import syncRoutes from './routes/sync';
import connectDB from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting by route groups
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // 20 auth requests per IP per 15 min
  message: { success: false, message: 'Too many auth attempts, please try again later.', status: 429 }
});

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200'),
  message: { success: false, message: 'Too many requests, please try again later.', status: 429 }
});

const syncLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30, // 30 sync requests per min
  message: { success: false, message: 'Sync rate limit exceeded, please wait.', status: 429 }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStates[dbStatus] || 'unknown',
      connected: dbStatus === 1,
      host: mongoose.connection.host || 'N/A'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    version: '2.0.0'
  });
});

// Server status endpoint
app.get('/status', (req, res) => {
  res.json({
    success: true,
    server: {
      status: 'running',
      port: PORT,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
    },
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      type: 'MongoDB'
    },
    routes: {
      auth: '/api/auth/*',
      tasks: '/api/tasks/*',
      habits: '/api/habits/*',
      goals: '/api/goals/*',
      sync: '/api/sync/*',
      endpoints: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'POST /api/auth/google-login',
        'POST /api/auth/refresh-token',
        'POST /api/auth/logout',
        'GET  /api/auth/profile',
        'PUT  /api/auth/profile',
        'GET  /api/tasks',
        'POST /api/tasks',
        'PUT  /api/tasks/:id',
        'DEL  /api/tasks/:id',
        'POST /api/tasks/bulk',
        'GET  /api/tasks/stats',
        'GET  /api/habits',
        'POST /api/habits',
        'PUT  /api/habits/:id',
        'DEL  /api/habits/:id',
        'POST /api/habits/:id/toggle',
        'POST /api/habits/bulk',
        'GET  /api/goals',
        'POST /api/goals',
        'PUT  /api/goals/:id',
        'DEL  /api/goals/:id',
        'POST /api/goals/:id/milestones',
        'PUT  /api/goals/:id/milestones/:idx/toggle',
        'POST /api/sync',
        'POST /api/sync/bulk',
        'GET  /api/sync/pull',
        'GET  /api/sync/stats'
      ]
    },
    security: {
      helmet: 'enabled',
      cors: 'configured',
      rateLimiting: 'enabled',
      compression: 'enabled'
    },
    environment: {
      JWT_SECRET: process.env.JWT_SECRET ? '✅ configured' : '❌ missing',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? '✅ configured' : '❌ missing',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ configured' : '❌ missing',
      FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
    }
  });
});

// API routes with rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);
app.use('/api/habits', apiLimiter, habitRoutes);
app.use('/api/goals', apiLimiter, goalRoutes);
app.use('/api/sync', syncLimiter, syncRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Zenith Productivity API Server',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      status: '/status',
      auth: '/api/auth',
      tasks: '/api/tasks',
      habits: '/api/habits',
      goals: '/api/goals',
      sync: '/api/sync'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS: Origin not allowed'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 Zenith Productivity Server v2.0.0`);
      console.log(`=====================================`);
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📊 Status: http://localhost:${PORT}/status`);
      console.log(`\n🔐 Auth:   /api/auth/*`);
      console.log(`📋 Tasks:  /api/tasks/*`);
      console.log(`🔄 Habits: /api/habits/*`);
      console.log(`🎯 Goals:  /api/goals/*`);
      console.log(`☁️  Sync:   /api/sync/*`);
      console.log(`\n📋 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Not Connected'}`);
      console.log(`🔑 JWT: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
      console.log(`=====================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
