import { Router } from 'express';
import {
  signup,
  login,
  googleLogin,
  refreshToken,
  logout,
  getProfile,
  updateProfile
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Base route to show available auth endpoints
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoints',
    endpoints: {
      public: {
        'POST /signup': 'Create a new user account',
        'POST /login': 'Login with email and password',
        'POST /google-login': 'Login with Google OAuth',
        'POST /refresh-token': 'Refresh access token'
      },
      protected: {
        'POST /logout': 'Logout user (requires auth)',
        'GET /profile': 'Get user profile (requires auth)',
        'PUT /profile': 'Update user profile (requires auth)'
      }
    }
  });
});

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
