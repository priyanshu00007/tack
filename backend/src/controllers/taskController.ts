import { Response } from 'express';
import { Task } from '../models/Task';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/errorHandler';

// GET /api/tasks — Get all tasks for the user (with optional filters)
export const getTasks = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { status, quadrant, dateFrom, dateTo, search, page = 1, limit = 50, sort = 'date', order = 'desc' } = req.query;

        const filter: any = { userId };

        if (status) filter.status = status;
        if (quadrant) filter.quadrant = quadrant;
        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) filter.date.$gte = new Date(dateFrom as string);
            if (dateTo) filter.date.$lte = new Date(dateTo as string);
        }
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }

        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
        const sortObj: any = {};
        sortObj[sort as string] = order === 'asc' ? 1 : -1;

        const [tasks, total] = await Promise.all([
            Task.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit as string)),
            Task.countDocuments(filter)
        ]);

        return sendSuccess(res, 'Tasks retrieved successfully', {
            tasks,
            pagination: {
                total,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                pages: Math.ceil(total / parseInt(limit as string))
            }
        });
    } catch (error: any) {
        logger.error('Get tasks error:', error);
        return sendError(res, 'Failed to retrieve tasks', 500, error);
    }
};

// GET /api/tasks/:id — Get single task
export const getTask = async (req: any, res: Response) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }
        return sendSuccess(res, 'Task retrieved', { task });
    } catch (error: any) {
        logger.error('Get task error:', error);
        return sendError(res, 'Failed to retrieve task', 500, error);
    }
};

// POST /api/tasks — Create new task
export const createTask = async (req: any, res: Response) => {
    try {
        const { title, description, date, estimatedMinutes, quadrant, priority, tags } = req.body;

        if (!title || !date || !estimatedMinutes || !quadrant) {
            return sendError(res, 'Title, date, estimated minutes, and quadrant are required', 400);
        }

        const task = new Task({
            userId: req.user._id,
            title,
            description,
            date: new Date(date),
            estimatedMinutes: parseInt(estimatedMinutes),
            quadrant,
            priority: priority || 'medium',
            tags: tags || [],
            status: 'active'
        });

        await task.save();
        logger.info(`Task created: ${title} by ${req.user.email}`);
        return sendSuccess(res, 'Task created successfully', { task }, 201);
    } catch (error: any) {
        logger.error('Create task error:', error);
        return sendError(res, 'Failed to create task', 500, error);
    }
};

// PUT /api/tasks/:id — Update task
export const updateTask = async (req: any, res: Response) => {
    try {
        const allowedUpdates = ['title', 'description', 'date', 'estimatedMinutes', 'quadrant', 'status', 'priority', 'tags', 'note'];
        const updates: any = {};

        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (updates.date) updates.date = new Date(updates.date);
        if (updates.status === 'done' && !updates.completedAt) {
            updates.completedAt = new Date();
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!task) {
            return sendError(res, 'Task not found', 404);
        }

        logger.info(`Task updated: ${task.title}`);
        return sendSuccess(res, 'Task updated successfully', { task });
    } catch (error: any) {
        logger.error('Update task error:', error);
        return sendError(res, 'Failed to update task', 500, error);
    }
};

// DELETE /api/tasks/:id — Delete task
export const deleteTask = async (req: any, res: Response) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }
        logger.info(`Task deleted: ${task.title}`);
        return sendSuccess(res, 'Task deleted successfully');
    } catch (error: any) {
        logger.error('Delete task error:', error);
        return sendError(res, 'Failed to delete task', 500, error);
    }
};

// POST /api/tasks/bulk — Bulk create/sync tasks
export const bulkSyncTasks = async (req: any, res: Response) => {
    try {
        const { tasks } = req.body;
        if (!Array.isArray(tasks)) {
            return sendError(res, 'Tasks array is required', 400);
        }

        const results = [];
        for (const taskData of tasks) {
            try {
                if (taskData._id) {
                    // Update existing
                    const updated = await Task.findOneAndUpdate(
                        { _id: taskData._id, userId: req.user._id },
                        taskData,
                        { new: true, upsert: true, runValidators: true }
                    );
                    results.push({ status: 'updated', task: updated });
                } else {
                    // Create new
                    const task = new Task({ ...taskData, userId: req.user._id });
                    await task.save();
                    results.push({ status: 'created', task });
                }
            } catch (err: any) {
                results.push({ status: 'error', error: err.message, data: taskData });
            }
        }

        return sendSuccess(res, `Bulk sync complete: ${results.length} tasks processed`, { results });
    } catch (error: any) {
        logger.error('Bulk sync tasks error:', error);
        return sendError(res, 'Bulk sync failed', 500, error);
    }
};

// GET /api/tasks/stats — Get task statistics
export const getTaskStats = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const [total, active, done, cancelled] = await Promise.all([
            Task.countDocuments({ userId }),
            Task.countDocuments({ userId, status: 'active' }),
            Task.countDocuments({ userId, status: 'done' }),
            Task.countDocuments({ userId, status: 'cancelled' })
        ]);

        // Get today's tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayTasks = await Task.countDocuments({
            userId,
            date: { $gte: today, $lt: tomorrow }
        });

        const todayDone = await Task.countDocuments({
            userId,
            date: { $gte: today, $lt: tomorrow },
            status: 'done'
        });

        return sendSuccess(res, 'Task stats retrieved', {
            stats: {
                total,
                active,
                done,
                cancelled,
                completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
                today: {
                    total: todayTasks,
                    done: todayDone,
                    remaining: todayTasks - todayDone
                }
            }
        });
    } catch (error: any) {
        logger.error('Get task stats error:', error);
        return sendError(res, 'Failed to retrieve stats', 500, error);
    }
};
