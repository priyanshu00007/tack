# Installation Guide for Zenith Backend

## Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string
- Git (optional)

## Step 1: Install Dependencies

```bash
cd d:\tack\tack\backend
npm install
```

### If npm install fails, try:

**Option A: Clean Install**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Option B: Force Install**
```bash
npm install --force
```

**Option C: Install Core Dependencies Only**
```bash
npm install express mongoose bcryptjs jsonwebtoken cors helmet dotenv
```

## Step 2: Environment Setup

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Required variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zenith-productivity
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

## Step 3: Start Development Server

```bash
npm run dev
```

Server should start on: http://localhost:5000

## Step 4: Test APIs

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Zenith Productivity API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Available Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Try: `mongosh` to test connection

### TypeScript Errors
```bash
npm run build
```

### Missing Dependencies
```bash
npm audit fix
npm install
```

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm test         # Run tests
npm run lint     # Check code quality
```

## Production Deployment

1. Set environment variables:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-production-secret
```

2. Build and start:
```bash
npm run build
npm start
```

## Next Steps After Installation

1. ✅ Test health endpoint
2. ✅ Create user account
3. ✅ Test login
4. 🔄 Create productivity APIs (tasks, habits, goals)
5. 🔄 Connect frontend to backend
6. 🔄 Add real-time features

## Support

If you encounter issues:
1. Check Node.js version: `node --version` (should be 18+)
2. Check npm version: `npm --version`
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and reinstall
