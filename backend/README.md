# Zenith Productivity Backend

A production-ready Node.js/Express backend for the Zenith Productivity Suite.

## Features

- **Authentication**: JWT-based auth with refresh tokens
- **User Management**: Profile management with preferences
- **Task Management**: CRUD operations with Eisenhower Matrix
- **Habit Tracking**: Daily habit tracking with streaks
- **Goal Setting**: Long-term goal management with milestones
- **Security**: Rate limiting, CORS, helmet, input validation
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Winston-based structured logging

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

## Installation

```bash
cd backend
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update environment variables:
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret for JWT tokens
   - `JWT_REFRESH_SECRET`: Secret for refresh tokens

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Tasks (Coming Soon)
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Habits (Coming Soon)
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `POST /api/habits/:id/toggle` - Toggle habit completion

### Goals (Coming Soon)
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

## Database Schema

### User
- Email, password, name, avatar
- Preferences (theme, notifications)
- Subscription details

### Task
- Title, description, date, estimated time
- Eisenhower quadrant, priority, status

### Habit
- Name, target days, completion dates
- Streak tracking, color/icon

### Goal
- Title, description, target date
- Progress, milestones, status

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention (NoSQL injection)

## Logging

Structured logging with Winston:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

