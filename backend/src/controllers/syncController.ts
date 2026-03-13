import { Response } from 'express';
import { Task } from '../models/Task';
import { Habit } from '../models/Habit';
import { Goal } from '../models/Goal';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/errorHandler';

/**
 * POST /api/sync — Full offline-to-online sync endpoint
 * Accepts all data types and syncs them to the database.
 * Designed for the frontend OfflineSyncService to push queued changes.
 */
export const syncAll = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { type, data } = req.body;

        if (!type || !data) {
            return sendError(res, 'Type and data are required', 400);
        }

        let result;

        switch (type) {
            case 'profile':
                const allowedProfileFields = ['firstName', 'lastName', 'avatar', 'timezone', 'bio', 'location', 'website'];
                const profileUpdates: any = {};
                for (const key of allowedProfileFields) {
                    if (data[key] !== undefined) profileUpdates[key] = data[key];
                }
                result = await User.findByIdAndUpdate(userId, profileUpdates, { new: true });
                break;

            case 'task':
                if (data._id) {
                    result = await Task.findOneAndUpdate(
                        { _id: data._id, userId },
                        { ...data, userId },
                        { new: true, upsert: true }
                    );
                } else {
                    const task = new Task({ ...data, userId });
                    result = await task.save();
                }
                break;

            case 'habit':
                if (data._id) {
                    result = await Habit.findOneAndUpdate(
                        { _id: data._id, userId },
                        { ...data, userId },
                        { new: true, upsert: true }
                    );
                } else {
                    const habit = new Habit({ ...data, userId });
                    result = await habit.save();
                }
                break;

            case 'goal':
                if (data._id) {
                    result = await Goal.findOneAndUpdate(
                        { _id: data._id, userId },
                        { ...data, userId },
                        { new: true, upsert: true }
                    );
                } else {
                    const goal = new Goal({ ...data, userId });
                    result = await goal.save();
                }
                break;

            default:
                return sendError(res, `Unknown sync type: ${type}`, 400);
        }

        logger.info(`Sync ${type} for user ${req.user.email}`);
        return sendSuccess(res, `${type} synced successfully`, { result });
    } catch (error: any) {
        logger.error('Sync error:', error);
        return sendError(res, 'Sync failed', 500, error);
    }
};

/**
 * POST /api/sync/bulk — Bulk sync multiple items at once
 */
export const bulkSync = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { items } = req.body;

        if (!Array.isArray(items)) {
            return sendError(res, 'Items array is required', 400);
        }

        const results = [];

        for (const item of items) {
            try {
                const { type, data } = item;
                let result;

                switch (type) {
                    case 'task':
                        if (data._id) {
                            result = await Task.findOneAndUpdate(
                                { _id: data._id, userId },
                                { ...data, userId },
                                { new: true, upsert: true }
                            );
                        } else {
                            result = await new Task({ ...data, userId }).save();
                        }
                        break;
                    case 'habit':
                        if (data._id) {
                            result = await Habit.findOneAndUpdate(
                                { _id: data._id, userId },
                                { ...data, userId },
                                { new: true, upsert: true }
                            );
                        } else {
                            result = await new Habit({ ...data, userId }).save();
                        }
                        break;
                    case 'goal':
                        if (data._id) {
                            result = await Goal.findOneAndUpdate(
                                { _id: data._id, userId },
                                { ...data, userId },
                                { new: true, upsert: true }
                            );
                        } else {
                            result = await new Goal({ ...data, userId }).save();
                        }
                        break;
                    default:
                        results.push({ status: 'error', type, error: 'Unknown type' });
                        continue;
                }

                results.push({ status: 'success', type, result });
            } catch (err: any) {
                results.push({ status: 'error', type: item.type, error: err.message });
            }
        }

        logger.info(`Bulk sync: ${results.length} items for user ${req.user.email}`);
        return sendSuccess(res, `Bulk sync complete: ${results.filter(r => r.status === 'success').length}/${results.length} succeeded`, { results });
    } catch (error: any) {
        logger.error('Bulk sync error:', error);
        return sendError(res, 'Bulk sync failed', 500, error);
    }
};

/**
 * GET /api/sync/pull — Pull all user data (for syncing to local)
 */
export const pullData = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { since } = req.query; // Optional: only get data updated after this timestamp

        const sinceDate = since ? new Date(since as string) : new Date(0);

        const [tasks, habits, goals, user] = await Promise.all([
            Task.find({ userId, updatedAt: { $gte: sinceDate } }).sort({ date: -1 }),
            Habit.find({ userId, updatedAt: { $gte: sinceDate } }).sort({ createdAt: -1 }),
            Goal.find({ userId, updatedAt: { $gte: sinceDate } }).sort({ targetDate: 1 }),
            User.findById(userId)
        ]);

        return sendSuccess(res, 'Data pulled successfully', {
            profile: user?.getPublicProfile(),
            tasks,
            habits,
            goals,
            syncedAt: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error('Pull data error:', error);
        return sendError(res, 'Failed to pull data', 500, error);
    }
};

/**
 * GET /api/stats — Get comprehensive user statistics
 */
export const getStats = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            totalTasks,
            doneTasks,
            activeTasks,
            todayTasks,
            todayDone,
            weekTasks,
            weekDone,
            monthTasks,
            monthDone,
            totalHabits,
            activeHabits,
            totalGoals,
            completedGoals,
            activeGoals
        ] = await Promise.all([
            Task.countDocuments({ userId }),
            Task.countDocuments({ userId, status: 'done' }),
            Task.countDocuments({ userId, status: 'active' }),
            Task.countDocuments({ userId, date: { $gte: today, $lt: tomorrow } }),
            Task.countDocuments({ userId, date: { $gte: today, $lt: tomorrow }, status: 'done' }),
            Task.countDocuments({ userId, date: { $gte: weekStart } }),
            Task.countDocuments({ userId, date: { $gte: weekStart }, status: 'done' }),
            Task.countDocuments({ userId, date: { $gte: monthStart } }),
            Task.countDocuments({ userId, date: { $gte: monthStart }, status: 'done' }),
            Habit.countDocuments({ userId }),
            Habit.countDocuments({ userId, isActive: true }),
            Goal.countDocuments({ userId }),
            Goal.countDocuments({ userId, status: 'completed' }),
            Goal.countDocuments({ userId, status: 'active' })
        ]);

        return sendSuccess(res, 'Stats retrieved', {
            stats: {
                tasks: {
                    total: totalTasks,
                    done: doneTasks,
                    active: activeTasks,
                    completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
                    today: { total: todayTasks, done: todayDone },
                    thisWeek: { total: weekTasks, done: weekDone },
                    thisMonth: { total: monthTasks, done: monthDone }
                },
                habits: {
                    total: totalHabits,
                    active: activeHabits
                },
                goals: {
                    total: totalGoals,
                    completed: completedGoals,
                    active: activeGoals,
                    completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
                }
            }
        });
    } catch (error: any) {
        logger.error('Get stats error:', error);
        return sendError(res, 'Failed to retrieve stats', 500, error);
    }
};
