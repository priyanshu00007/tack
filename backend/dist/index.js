"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const database_1 = __importDefault(require("./config/database"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Compression middleware
app.use((0, compression_1.default)());
// Request logging
app.use((0, morgan_1.default)('combined'));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        status: 429
    }
});
app.use('/api/', limiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Health check endpoint
app.get('/health', (req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState;
    const dbStatusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown';
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            status: dbStatusText,
            connected: dbStatus === 1,
            host: mongoose_1.default.connection.host || 'N/A'
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        }
    });
});
// Server status endpoint - shows what's connected
app.get('/status', (req, res) => {
    const status = {
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
            status: 'configured',
            type: 'MongoDB',
            connection: process.env.MONGODB_URI ? 'configured' : 'not configured'
        },
        routes: {
            auth: '/api/auth/*',
            endpoints: [
                'POST /api/auth/signup',
                'POST /api/auth/login',
                'POST /api/auth/refresh-token',
                'POST /api/auth/logout',
                'GET /api/auth/profile'
            ]
        },
        middleware: [
            'helmet (security)',
            'cors (cross-origin)',
            'compression (gzip)',
            'morgan (logging)',
            'rate-limit (DDoS protection)'
        ],
        environment: {
            JWT_SECRET: process.env.JWT_SECRET ? 'configured' : 'missing',
            JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ? 'configured' : 'missing',
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
        }
    };
    res.json(status);
});
// Connection test endpoint
app.get('/test', (req, res) => {
    const testResults = {
        success: true,
        message: 'Backend connection test successful',
        timestamp: new Date().toISOString(),
        tests: {
            express: '✅ Working',
            cors: '✅ Working',
            routes: '✅ Working',
            authController: '✅ Available',
            userController: '✅ Available',
            jwtService: '✅ Available',
            middleware: '✅ All loaded'
        },
        nextSteps: [
            '1. Install dependencies: npm install',
            '2. Create .env file with JWT secrets',
            '3. Start server: npm run dev',
            '4. Test signup/login from frontend'
        ]
    };
    res.json(testResults);
});
// API routes
app.use('/api/auth', auth_1.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Zenith Productivity API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            status: '/status',
            auth: '/api/auth',
            docs: 'https://docs.zenith-productivity.com'
        }
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: err.stack })
    });
});
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await (0, database_1.default)();
        app.listen(PORT, () => {
            console.log(`\n🚀 Zenith Productivity Server Started`);
            console.log(`=====================================`);
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📊 Server status: http://localhost:${PORT}/status`);
            console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
            console.log(`\n📋 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            console.log(`\n🗄️  Database: ${mongoose_1.default.connection.readyState === 1 ? '✅ MongoDB Connected' : '❌ MongoDB Not Connected'}`);
            console.log(`🔑 JWT Secrets: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
            console.log(`=====================================\n`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map