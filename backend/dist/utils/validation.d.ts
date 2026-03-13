import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
export declare const userSchemas: {
    signup: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        timezone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        acceptTerms: z.ZodBoolean;
        recaptchaToken: z.ZodString;
    }, z.core.$strip>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        deviceFingerprint: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    updateProfile: z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        timezone: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        preferences: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodEnum<{
                light: "light";
                dark: "dark";
            }>>;
            dailyCapacityMinutes: z.ZodOptional<z.ZodNumber>;
            notifications: z.ZodOptional<z.ZodObject<{
                email: z.ZodOptional<z.ZodBoolean>;
                push: z.ZodOptional<z.ZodBoolean>;
                taskReminders: z.ZodOptional<z.ZodBoolean>;
                habitReminders: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    changePassword: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
        confirmPassword: z.ZodString;
    }, z.core.$strip>;
};
export declare const taskSchemas: {
    create: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        date: z.ZodString;
        estimatedMinutes: z.ZodNumber;
        quadrant: z.ZodEnum<{
            iu: "iu";
            ibnu: "ibnu";
            nibu: "nibu";
            ninu: "ninu";
        }>;
        priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        recurrence: z.ZodOptional<z.ZodObject<{
            type: z.ZodEnum<{
                daily: "daily";
                weekly: "weekly";
                monthly: "monthly";
            }>;
            interval: z.ZodNumber;
            endDate: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    update: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
        estimatedMinutes: z.ZodOptional<z.ZodNumber>;
        quadrant: z.ZodOptional<z.ZodEnum<{
            iu: "iu";
            ibnu: "ibnu";
            nibu: "nibu";
            ninu: "ninu";
        }>>;
        priority: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            done: "done";
            cancelled: "cancelled";
        }>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            done: "done";
            cancelled: "cancelled";
        }>>;
        quadrant: z.ZodOptional<z.ZodEnum<{
            iu: "iu";
            ibnu: "ibnu";
            nibu: "nibu";
            ninu: "ninu";
        }>>;
        priority: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        sort: z.ZodDefault<z.ZodEnum<{
            date: "date";
            priority: "priority";
            created: "created";
        }>>;
        order: z.ZodDefault<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
};
export declare const habitSchemas: {
    create: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        targetDays: z.ZodNumber;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        reminderTime: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    update: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        targetDays: z.ZodOptional<z.ZodNumber>;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        reminderTime: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
    toggle: z.ZodObject<{
        date: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
};
export declare const goalSchemas: {
    create: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        targetDate: z.ZodString;
        category: z.ZodString;
        priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>>;
        milestones: z.ZodOptional<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            dueDate: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    update: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        targetDate: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            active: "active";
            completed: "completed";
            paused: "paused";
        }>>;
        priority: z.ZodOptional<z.ZodEnum<{
            low: "low";
            medium: "medium";
            high: "high";
        }>>;
        progress: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    addMilestone: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        dueDate: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
export declare const validate: (schema: z.ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const businessValidators: {
    canCreateTask: (user: any) => {
        allowed: boolean;
        limit: number;
        message: string;
    };
    validateBusinessHours: (date: Date) => {
        valid: boolean;
        message: string;
    } | {
        valid: boolean;
        message?: undefined;
    };
    validateHabitStreak: (completedDates: Date[], targetDays: number) => {
        consistency: number;
        isOnTrack: boolean;
        message: string;
    };
    validateGoalDeadline: (targetDate: Date, milestones?: any[]) => {
        urgent: boolean;
        message: string;
        risk: string;
    };
};
export declare const sanitizers: {
    sanitizeText: (text: string) => string;
    sanitizeEmail: (email: string) => string;
    sanitizePhone: (phone: string) => string;
};
declare const _default: {
    userSchemas: {
        signup: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            timezone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
            acceptTerms: z.ZodBoolean;
            recaptchaToken: z.ZodString;
        }, z.core.$strip>;
        login: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
            rememberMe: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            deviceFingerprint: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        updateProfile: z.ZodObject<{
            firstName: z.ZodOptional<z.ZodString>;
            lastName: z.ZodOptional<z.ZodString>;
            timezone: z.ZodOptional<z.ZodString>;
            avatar: z.ZodOptional<z.ZodString>;
            preferences: z.ZodOptional<z.ZodObject<{
                theme: z.ZodOptional<z.ZodEnum<{
                    light: "light";
                    dark: "dark";
                }>>;
                dailyCapacityMinutes: z.ZodOptional<z.ZodNumber>;
                notifications: z.ZodOptional<z.ZodObject<{
                    email: z.ZodOptional<z.ZodBoolean>;
                    push: z.ZodOptional<z.ZodBoolean>;
                    taskReminders: z.ZodOptional<z.ZodBoolean>;
                    habitReminders: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        changePassword: z.ZodObject<{
            currentPassword: z.ZodString;
            newPassword: z.ZodString;
            confirmPassword: z.ZodString;
        }, z.core.$strip>;
    };
    taskSchemas: {
        create: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            date: z.ZodString;
            estimatedMinutes: z.ZodNumber;
            quadrant: z.ZodEnum<{
                iu: "iu";
                ibnu: "ibnu";
                nibu: "nibu";
                ninu: "ninu";
            }>;
            priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
            recurrence: z.ZodOptional<z.ZodObject<{
                type: z.ZodEnum<{
                    daily: "daily";
                    weekly: "weekly";
                    monthly: "monthly";
                }>;
                interval: z.ZodNumber;
                endDate: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        update: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            date: z.ZodOptional<z.ZodString>;
            estimatedMinutes: z.ZodOptional<z.ZodNumber>;
            quadrant: z.ZodOptional<z.ZodEnum<{
                iu: "iu";
                ibnu: "ibnu";
                nibu: "nibu";
                ninu: "ninu";
            }>>;
            priority: z.ZodOptional<z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>>;
            status: z.ZodOptional<z.ZodEnum<{
                active: "active";
                done: "done";
                cancelled: "cancelled";
            }>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>;
        query: z.ZodObject<{
            page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            status: z.ZodOptional<z.ZodEnum<{
                active: "active";
                done: "done";
                cancelled: "cancelled";
            }>>;
            quadrant: z.ZodOptional<z.ZodEnum<{
                iu: "iu";
                ibnu: "ibnu";
                nibu: "nibu";
                ninu: "ninu";
            }>>;
            priority: z.ZodOptional<z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>>;
            dateFrom: z.ZodOptional<z.ZodString>;
            dateTo: z.ZodOptional<z.ZodString>;
            search: z.ZodOptional<z.ZodString>;
            sort: z.ZodDefault<z.ZodEnum<{
                date: "date";
                priority: "priority";
                created: "created";
            }>>;
            order: z.ZodDefault<z.ZodEnum<{
                asc: "asc";
                desc: "desc";
            }>>;
        }, z.core.$strip>;
    };
    habitSchemas: {
        create: z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            targetDays: z.ZodNumber;
            color: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            reminderTime: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        update: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            targetDays: z.ZodOptional<z.ZodNumber>;
            color: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            reminderTime: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
            isActive: z.ZodOptional<z.ZodBoolean>;
        }, z.core.$strip>;
        toggle: z.ZodObject<{
            date: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>;
    };
    goalSchemas: {
        create: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            targetDate: z.ZodString;
            category: z.ZodString;
            priority: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>>>;
            milestones: z.ZodOptional<z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                dueDate: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>;
        update: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            targetDate: z.ZodOptional<z.ZodString>;
            category: z.ZodOptional<z.ZodString>;
            status: z.ZodOptional<z.ZodEnum<{
                active: "active";
                completed: "completed";
                paused: "paused";
            }>>;
            priority: z.ZodOptional<z.ZodEnum<{
                low: "low";
                medium: "medium";
                high: "high";
            }>>;
            progress: z.ZodOptional<z.ZodNumber>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>;
        addMilestone: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            dueDate: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    validate: (schema: z.ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    businessValidators: {
        canCreateTask: (user: any) => {
            allowed: boolean;
            limit: number;
            message: string;
        };
        validateBusinessHours: (date: Date) => {
            valid: boolean;
            message: string;
        } | {
            valid: boolean;
            message?: undefined;
        };
        validateHabitStreak: (completedDates: Date[], targetDays: number) => {
            consistency: number;
            isOnTrack: boolean;
            message: string;
        };
        validateGoalDeadline: (targetDate: Date, milestones?: any[]) => {
            urgent: boolean;
            message: string;
            risk: string;
        };
    };
    sanitizers: {
        sanitizeText: (text: string) => string;
        sanitizeEmail: (email: string) => string;
        sanitizePhone: (phone: string) => string;
    };
};
export default _default;
//# sourceMappingURL=validation.d.ts.map