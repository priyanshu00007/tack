import { Response } from 'express';
import { Goal } from '../models/Goal';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/errorHandler';

// GET /api/goals
export const getGoals = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { status, category } = req.query;

        const filter: any = { userId };
        if (status) filter.status = status;
        if (category) filter.category = category;

        const goals = await Goal.find(filter).sort({ targetDate: 1, createdAt: -1 });
        return sendSuccess(res, 'Goals retrieved', { goals });
    } catch (error: any) {
        logger.error('Get goals error:', error);
        return sendError(res, 'Failed to retrieve goals', 500, error);
    }
};

// POST /api/goals
export const createGoal = async (req: any, res: Response) => {
    try {
        const { title, description, targetDate, category, priority, milestones, tags } = req.body;

        if (!title || !targetDate || !category) {
            return sendError(res, 'Title, target date, and category are required', 400);
        }

        const goal = new Goal({
            userId: req.user._id,
            title,
            description,
            targetDate: new Date(targetDate),
            category,
            priority: priority || 'medium',
            milestones: milestones || [],
            tags: tags || []
        });

        await goal.save();
        logger.info(`Goal created: ${title}`);
        return sendSuccess(res, 'Goal created', { goal }, 201);
    } catch (error: any) {
        logger.error('Create goal error:', error);
        return sendError(res, 'Failed to create goal', 500, error);
    }
};

// PUT /api/goals/:id
export const updateGoal = async (req: any, res: Response) => {
    try {
        const allowedUpdates = ['title', 'description', 'targetDate', 'category', 'status', 'priority', 'progress', 'tags'];
        const updates: any = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (updates.targetDate) updates.targetDate = new Date(updates.targetDate);

        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!goal) return sendError(res, 'Goal not found', 404);
        return sendSuccess(res, 'Goal updated', { goal });
    } catch (error: any) {
        logger.error('Update goal error:', error);
        return sendError(res, 'Failed to update goal', 500, error);
    }
};

// POST /api/goals/:id/milestones — Add milestone
export const addMilestone = async (req: any, res: Response) => {
    try {
        const { title } = req.body;
        if (!title) return sendError(res, 'Milestone title is required', 400);

        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
        if (!goal) return sendError(res, 'Goal not found', 404);

        goal.milestones.push({ title, completed: false });
        await goal.save();

        return sendSuccess(res, 'Milestone added', { goal });
    } catch (error: any) {
        logger.error('Add milestone error:', error);
        return sendError(res, 'Failed to add milestone', 500, error);
    }
};

// PUT /api/goals/:id/milestones/:milestoneIndex/toggle — Toggle milestone
export const toggleMilestone = async (req: any, res: Response) => {
    try {
        const { milestoneIndex } = req.params;
        const idx = parseInt(milestoneIndex);

        const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
        if (!goal) return sendError(res, 'Goal not found', 404);

        if (idx < 0 || idx >= goal.milestones.length) {
            return sendError(res, 'Invalid milestone index', 400);
        }

        goal.milestones[idx].completed = !goal.milestones[idx].completed;
        goal.milestones[idx].completedAt = goal.milestones[idx].completed ? new Date() : undefined;
        await goal.save();

        return sendSuccess(res, 'Milestone toggled', { goal });
    } catch (error: any) {
        logger.error('Toggle milestone error:', error);
        return sendError(res, 'Failed to toggle milestone', 500, error);
    }
};

// DELETE /api/goals/:id
export const deleteGoal = async (req: any, res: Response) => {
    try {
        const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!goal) return sendError(res, 'Goal not found', 404);
        return sendSuccess(res, 'Goal deleted');
    } catch (error: any) {
        logger.error('Delete goal error:', error);
        return sendError(res, 'Failed to delete goal', 500, error);
    }
};
