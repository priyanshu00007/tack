"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("@/controllers/authController");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
// Base route to show available auth endpoints
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Auth endpoints',
        endpoints: {
            public: {
                'POST /signup': 'Create a new user account',
                'POST /login': 'Login with email and password',
                'POST /refresh-token': 'Refresh access token'
            },
            protected: {
                'POST /logout': 'Logout user (requires auth)',
                'GET /profile': 'Get user profile (requires auth)'
            }
        }
    });
});
// Public routes
router.post('/signup', authController_1.signup);
router.post('/login', authController_1.login);
router.post('/refresh-token', authController_1.refreshToken);
// Protected routes
router.post('/logout', auth_1.authenticate, authController_1.logout);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
exports.default = router;
//# sourceMappingURL=auth.js.map