"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizers = exports.businessValidators = exports.validate = exports.goalSchemas = exports.habitSchemas = exports.taskSchemas = exports.userSchemas = void 0;
const zod_1 = require("zod");
const logger_1 = require("./logger");
// Common validation schemas
const emailSchema = zod_1.z.string().email('Invalid email format').toLowerCase().trim();
const passwordSchema = zod_1.z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain uppercase, lowercase, number, and special character');
const nameSchema = zod_1.z.string().min(1, 'Name is required').max(50, 'Name too long').trim();
// User validation schemas
exports.userSchemas = {
    signup: zod_1.z.object({
        email: emailSchema,
        password: passwordSchema,
        firstName: nameSchema,
        lastName: nameSchema,
        timezone: zod_1.z.string().optional().default('UTC'),
        acceptTerms: zod_1.z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
        recaptchaToken: zod_1.z.string().min(1, 'reCAPTCHA verification required')
    }),
    login: zod_1.z.object({
        email: emailSchema,
        password: zod_1.z.string().min(1, 'Password is required'),
        rememberMe: zod_1.z.boolean().optional().default(false),
        deviceFingerprint: zod_1.z.string().optional()
    }),
    updateProfile: zod_1.z.object({
        firstName: nameSchema.optional(),
        lastName: nameSchema.optional(),
        timezone: zod_1.z.string().optional(),
        avatar: zod_1.z.string().url('Invalid avatar URL').optional(),
        preferences: zod_1.z.object({
            theme: zod_1.z.enum(['light', 'dark']).optional(),
            dailyCapacityMinutes: zod_1.z.number().min(60).max(1440).optional(),
            notifications: zod_1.z.object({
                email: zod_1.z.boolean().optional(),
                push: zod_1.z.boolean().optional(),
                taskReminders: zod_1.z.boolean().optional(),
                habitReminders: zod_1.z.boolean().optional()
            }).optional()
        }).optional()
    }),
    changePassword: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: passwordSchema,
        confirmPassword: zod_1.z.string().min(1, 'Password confirmation is required')
    }).refine(data => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword']
    })
};
// Task validation schemas
exports.taskSchemas = {
    create: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Task title is required').max(200, 'Title too long').trim(),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        date: zod_1.z.string().datetime('Invalid date format'),
        estimatedMinutes: zod_1.z.number().min(5, 'Minimum 5 minutes').max(480, 'Maximum 8 hours'),
        quadrant: zod_1.z.enum(['iu', 'ibnu', 'nibu', 'ninu'], {
            errorMap: (issue, ctx) => {
                if (issue.code === 'invalid_enum_value') {
                    return { message: 'Invalid Eisenhower quadrant' };
                }
                return { message: ctx.defaultError };
            }
        }),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional().default('medium'),
        tags: zod_1.z.array(zod_1.z.string().max(20)).max(10, 'Too many tags').optional(),
        recurrence: zod_1.z.object({
            type: zod_1.z.enum(['daily', 'weekly', 'monthly']),
            interval: zod_1.z.number().min(1),
            endDate: zod_1.z.string().datetime().optional()
        }).optional()
    }),
    update: zod_1.z.object({
        title: zod_1.z.string().min(1).max(200).trim().optional(),
        description: zod_1.z.string().max(1000).optional(),
        date: zod_1.z.string().datetime().optional(),
        estimatedMinutes: zod_1.z.number().min(5).max(480).optional(),
        quadrant: zod_1.z.enum(['iu', 'ibnu', 'nibu', 'ninu']).optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        status: zod_1.z.enum(['active', 'done', 'cancelled']).optional(),
        tags: zod_1.z.array(zod_1.z.string().max(20)).max(10).optional()
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).default(1),
        limit: zod_1.z.coerce.number().min(1).max(100).default(20),
        status: zod_1.z.enum(['active', 'done', 'cancelled']).optional(),
        quadrant: zod_1.z.enum(['iu', 'ibnu', 'nibu', 'ninu']).optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        dateFrom: zod_1.z.string().datetime().optional(),
        dateTo: zod_1.z.string().datetime().optional(),
        search: zod_1.z.string().max(100).optional(),
        sort: zod_1.z.enum(['date', 'priority', 'created']).default('date'),
        order: zod_1.z.enum(['asc', 'desc']).default('asc')
    })
};
// Habit validation schemas
exports.habitSchemas = {
    create: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Habit name is required').max(100, 'Name too long').trim(),
        description: zod_1.z.string().max(500, 'Description too long').optional(),
        targetDays: zod_1.z.number().min(1, 'At least 1 day').max(7, 'Maximum 7 days'),
        color: zod_1.z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color').optional(),
        icon: zod_1.z.string().max(2, 'Icon too long').optional(),
        reminderTime: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
        category: zod_1.z.string().max(30).optional()
    }),
    update: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).trim().optional(),
        description: zod_1.z.string().max(500).optional(),
        targetDays: zod_1.z.number().min(1).max(7).optional(),
        color: zod_1.z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        icon: zod_1.z.string().max(2).optional(),
        reminderTime: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        category: zod_1.z.string().max(30).optional(),
        isActive: zod_1.z.boolean().optional()
    }),
    toggle: zod_1.z.object({
        date: zod_1.z.string().datetime('Invalid date format').optional().default(() => new Date().toISOString())
    })
};
// Goal validation schemas
exports.goalSchemas = {
    create: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Goal title is required').max(200, 'Title too long').trim(),
        description: zod_1.z.string().max(1000, 'Description too long').optional(),
        targetDate: zod_1.z.string().datetime('Invalid date format').refine(date => new Date(date) > new Date(), 'Target date must be in the future'),
        category: zod_1.z.string().min(1, 'Category is required').max(50, 'Category too long'),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional().default('medium'),
        milestones: zod_1.z.array(zod_1.z.object({
            title: zod_1.z.string().min(1).max(200),
            description: zod_1.z.string().max(500).optional(),
            dueDate: zod_1.z.string().datetime().optional()
        })).max(20, 'Too many milestones').optional(),
        tags: zod_1.z.array(zod_1.z.string().max(20)).max(10, 'Too many tags').optional()
    }),
    update: zod_1.z.object({
        title: zod_1.z.string().min(1).max(200).trim().optional(),
        description: zod_1.z.string().max(1000).optional(),
        targetDate: zod_1.z.string().datetime().optional(),
        category: zod_1.z.string().min(1).max(50).optional(),
        status: zod_1.z.enum(['active', 'completed', 'paused']).optional(),
        priority: zod_1.z.enum(['low', 'medium', 'high']).optional(),
        progress: zod_1.z.number().min(0).max(100).optional(),
        tags: zod_1.z.array(zod_1.z.string().max(20)).max(10).optional()
    }),
    addMilestone: zod_1.z.object({
        title: zod_1.z.string().min(1).max(200),
        description: zod_1.z.string().max(500).optional(),
        dueDate: zod_1.z.string().datetime().optional()
    })
};
// Validation middleware factory
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = req[source];
            const result = schema.safeParse(data);
            if (!result.success) {
                const errors = result.error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code
                }));
                logger_1.logger.warn('Validation failed', {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    errors,
                    data: source === 'body' ? { ...data, password: '[REDACTED]' } : data
                });
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                    timestamp: new Date().toISOString()
                });
            }
            // Add validated data to request
            req[source] = result.data;
            next();
        }
        catch (error) {
            logger_1.logger.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during validation'
            });
        }
    };
};
exports.validate = validate;
// Business logic validators
exports.businessValidators = {
    // Check if user can create more tasks (rate limiting based on subscription)
    canCreateTask: (user) => {
        const taskLimit = user.subscription?.plan === 'free' ? 50 :
            user.subscription?.plan === 'pro' ? 500 : Infinity;
        return {
            allowed: true, // This would check current task count in DB
            limit: taskLimit,
            message: taskLimit === Infinity ? 'Unlimited tasks' : `Task limit: ${taskLimit}`
        };
    },
    // Validate business hours for task scheduling
    validateBusinessHours: (date) => {
        const hour = date.getHours();
        const day = date.getDay();
        // No tasks on weekends (optional business rule)
        if (day === 0 || day === 6) {
            return {
                valid: false,
                message: 'Tasks cannot be scheduled on weekends'
            };
        }
        // Business hours: 9 AM - 6 PM
        if (hour < 9 || hour > 18) {
            return {
                valid: false,
                message: 'Tasks must be scheduled during business hours (9 AM - 6 PM)'
            };
        }
        return { valid: true };
    },
    // Check habit streak consistency
    validateHabitStreak: (completedDates, targetDays) => {
        const lastWeek = completedDates.filter(date => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(date) >= weekAgo;
        });
        const consistency = (lastWeek.length / 7) * 100;
        return {
            consistency: Math.round(consistency),
            isOnTrack: consistency >= (targetDays / 7) * 100,
            message: `${Math.round(consistency)}% consistency this week`
        };
    },
    // Goal deadline validation
    validateGoalDeadline: (targetDate, milestones = []) => {
        const now = new Date();
        const daysUntilDeadline = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDeadline < 30) {
            return {
                urgent: true,
                message: `Goal deadline is in ${daysUntilDeadline} days`,
                risk: 'high'
            };
        }
        if (daysUntilDeadline < 90) {
            return {
                urgent: false,
                message: `Goal deadline is in ${daysUntilDeadline} days`,
                risk: 'medium'
            };
        }
        return {
            urgent: false,
            message: `Goal deadline is in ${daysUntilDeadline} days`,
            risk: 'low'
        };
    }
};
// Sanitization utilities
exports.sanitizers = {
    // Remove HTML and scripts from text
    sanitizeText: (text) => {
        return text
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    },
    // Sanitize and validate email
    sanitizeEmail: (email) => {
        return email.toLowerCase().trim().replace(/\s+/g, '');
    },
    // Sanitize phone numbers
    sanitizePhone: (phone) => {
        return phone.replace(/[^\d+]/g, '');
    }
};
exports.default = {
    userSchemas: exports.userSchemas,
    taskSchemas: exports.taskSchemas,
    habitSchemas: exports.habitSchemas,
    goalSchemas: exports.goalSchemas,
    validate: exports.validate,
    businessValidators: exports.businessValidators,
    sanitizers: exports.sanitizers
};
//# sourceMappingURL=validation.js.map