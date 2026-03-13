import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

// Common validation schemas
const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number, and special character');
const nameSchema = z.string().min(1, 'Name is required').max(50, 'Name too long').trim();

// User validation schemas
export const userSchemas = {
  signup: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: nameSchema,
    lastName: nameSchema,
    timezone: z.string().optional().default('UTC'),
    acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms and conditions'),
    recaptchaToken: z.string().min(1, 'reCAPTCHA verification required')
  }),

  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
    deviceFingerprint: z.string().optional()
  }),

  updateProfile: z.object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    timezone: z.string().optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark']).optional(),
      dailyCapacityMinutes: z.number().min(60).max(1440).optional(),
      notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        taskReminders: z.boolean().optional(),
        habitReminders: z.boolean().optional()
      }).optional()
    }).optional()
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
};

// Task validation schemas
export const taskSchemas = {
  create: z.object({
    title: z.string().min(1, 'Task title is required').max(200, 'Title too long').trim(),
    description: z.string().max(1000, 'Description too long').optional(),
    date: z.string().datetime('Invalid date format'),
    estimatedMinutes: z.number().min(5, 'Minimum 5 minutes').max(480, 'Maximum 8 hours'),
    quadrant: z.enum(['iu', 'ibnu', 'nibu', 'ninu'], {
      errorMap: (issue, ctx) => {
        if (issue.code === 'invalid_enum_value') {
          return { message: 'Invalid Eisenhower quadrant' };
        }
        return { message: ctx.defaultError };
      }
    }),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    tags: z.array(z.string().max(20)).max(10, 'Too many tags').optional(),
    recurrence: z.object({
      type: z.enum(['daily', 'weekly', 'monthly']),
      interval: z.number().min(1),
      endDate: z.string().datetime().optional()
    }).optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(1000).optional(),
    date: z.string().datetime().optional(),
    estimatedMinutes: z.number().min(5).max(480).optional(),
    quadrant: z.enum(['iu', 'ibnu', 'nibu', 'ninu']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['active', 'done', 'cancelled']).optional(),
    tags: z.array(z.string().max(20)).max(10).optional()
  }),

  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    status: z.enum(['active', 'done', 'cancelled']).optional(),
    quadrant: z.enum(['iu', 'ibnu', 'nibu', 'ninu']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    search: z.string().max(100).optional(),
    sort: z.enum(['date', 'priority', 'created']).default('date'),
    order: z.enum(['asc', 'desc']).default('asc')
  })
};

// Habit validation schemas
export const habitSchemas = {
  create: z.object({
    name: z.string().min(1, 'Habit name is required').max(100, 'Name too long').trim(),
    description: z.string().max(500, 'Description too long').optional(),
    targetDays: z.number().min(1, 'At least 1 day').max(7, 'Maximum 7 days'),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color').optional(),
    icon: z.string().max(2, 'Icon too long').optional(),
    reminderTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
    category: z.string().max(30).optional()
  }),

  update: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(500).optional(),
    targetDays: z.number().min(1).max(7).optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
    icon: z.string().max(2).optional(),
    reminderTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    category: z.string().max(30).optional(),
    isActive: z.boolean().optional()
  }),

  toggle: z.object({
    date: z.string().datetime('Invalid date format').optional().default(() => new Date().toISOString())
  })
};

// Goal validation schemas
export const goalSchemas = {
  create: z.object({
    title: z.string().min(1, 'Goal title is required').max(200, 'Title too long').trim(),
    description: z.string().max(1000, 'Description too long').optional(),
    targetDate: z.string().datetime('Invalid date format').refine(
      date => new Date(date) > new Date(),
      'Target date must be in the future'
    ),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    milestones: z.array(z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(500).optional(),
      dueDate: z.string().datetime().optional()
    })).max(20, 'Too many milestones').optional(),
    tags: z.array(z.string().max(20)).max(10, 'Too many tags').optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(1000).optional(),
    targetDate: z.string().datetime().optional(),
    category: z.string().min(1).max(50).optional(),
    status: z.enum(['active', 'completed', 'paused']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    progress: z.number().min(0).max(100).optional(),
    tags: z.array(z.string().max(20)).max(10).optional()
  }),

  addMilestone: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    dueDate: z.string().datetime().optional()
  })
};

// Validation middleware factory
export const validate = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const result = schema.safeParse(data);
      
      if (!result.success) {
        const errors = result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Validation failed', {
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
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during validation'
      });
    }
  };
};

// Business logic validators
export const businessValidators = {
  // Check if user can create more tasks (rate limiting based on subscription)
  canCreateTask: (user: any) => {
    const taskLimit = user.subscription?.plan === 'free' ? 50 : 
                     user.subscription?.plan === 'pro' ? 500 : Infinity;
    
    return {
      allowed: true, // This would check current task count in DB
      limit: taskLimit,
      message: taskLimit === Infinity ? 'Unlimited tasks' : `Task limit: ${taskLimit}`
    };
  },

  // Validate business hours for task scheduling
  validateBusinessHours: (date: Date) => {
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
  validateHabitStreak: (completedDates: Date[], targetDays: number) => {
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
  validateGoalDeadline: (targetDate: Date, milestones: any[] = []) => {
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
export const sanitizers = {
  // Remove HTML and scripts from text
  sanitizeText: (text: string): string => {
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  },

  // Sanitize and validate email
  sanitizeEmail: (email: string): string => {
    return email.toLowerCase().trim().replace(/\s+/g, '');
  },

  // Sanitize phone numbers
  sanitizePhone: (phone: string): string => {
    return phone.replace(/[^\d+]/g, '');
  }
};

export default {
  userSchemas,
  taskSchemas,
  habitSchemas,
  goalSchemas,
  validate,
  businessValidators,
  sanitizers
};
