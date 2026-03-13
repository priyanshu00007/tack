import { Response } from 'express';
import { Habit } from '../models/Habit';
import { logger } from '../utils/logger';
import { sendSuccess, sendError } from '../utils/errorHandler';

// GET /api/habits — Get all habits
export const getHabits = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;
        const { active } = req.query;

        const filter: any = { userId };
        if (active !== undefined) filter.isActive = active === 'true';

        const habits = await Habit.find(filter).sort({ createdAt: -1 });
        return sendSuccess(res, 'Habits retrieved', { habits });
    } catch (error: any) {
        logger.error('Get habits error:', error);
        return sendError(res, 'Failed to retrieve habits', 500, error);
    }
};

// POST /api/habits — Create habit
export const createHabit = async (req: any, res: Response) => {
    try {
        const { name, description, targetDays, color, icon } = req.body;

        if (!name) return sendError(res, 'Habit name is required', 400);

        const habit = new Habit({
            userId: req.user._id,
            name,
            description,
            targetDays: targetDays || 7,
            color: color || '#3B82F6',
            icon: icon || '🎯'
        });

        await habit.save();
        logger.info(`Habit created: ${name}`);
        return sendSuccess(res, 'Habit created', { habit }, 201);
    } catch (error: any) {
        logger.error('Create habit error:', error);
        return sendError(res, 'Failed to create habit', 500, error);
    }
};

// PUT /api/habits/:id — Update habit
export const updateHabit = async (req: any, res: Response) => {
    try {
        const allowedUpdates = ['name', 'description', 'targetDays', 'color', 'icon', 'isActive', 'reminderTime'];
        const updates: any = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!habit) return sendError(res, 'Habit not found', 404);
        return sendSuccess(res, 'Habit updated', { habit });
    } catch (error: any) {
        logger.error('Update habit error:', error);
        return sendError(res, 'Failed to update habit', 500, error);
    }
};

// POST /api/habits/:id/toggle — Toggle completion for a date
export const toggleHabitDate = async (req: any, res: Response) => {
    try {
        const { date } = req.body;
        const habitDate = date ? new Date(date) : new Date();

        const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
        if (!habit) return sendError(res, 'Habit not found', 404);

        const dateStr = habitDate.toDateString();
        const existingIndex = habit.completedDates.findIndex(
            (d: Date) => new Date(d).toDateString() === dateStr
        );

        if (existingIndex > -1) {
            habit.completedDates.splice(existingIndex, 1);
        } else {
            habit.completedDates.push(habitDate);
        }

        await habit.save();
        return sendSuccess(res, `Habit ${existingIndex > -1 ? 'uncompleted' : 'completed'}`, { habit });
    } catch (error: any) {
        logger.error('Toggle habit error:', error);
        return sendError(res, 'Failed to toggle habit', 500, error);
    }
};

// DELETE /api/habits/:id — Delete habit
export const deleteHabit = async (req: any, res: Response) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!habit) return sendError(res, 'Habit not found', 404);
        return sendSuccess(res, 'Habit deleted');
    } catch (error: any) {
        logger.error('Delete habit error:', error);
        return sendError(res, 'Failed to delete habit', 500, error);
    }
};

// POST /api/habits/bulk — Bulk sync habits
export const bulkSyncHabits = async (req: any, res: Response) => {
    try {
        const { habits } = req.body;
        if (!Array.isArray(habits)) return sendError(res, 'Habits array is required', 400);

        const results = [];
        for (const habitData of habits) {
            try {
                if (habitData._id) {
                    const updated = await Habit.findOneAndUpdate(
                        { _id: habitData._id, userId: req.user._id },
                        habitData,
                        { new: true, upsert: true, runValidators: true }
                    );
                    results.push({ status: 'updated', habit: updated });
                } else {
                    const habit = new Habit({ ...habitData, userId: req.user._id });
                    await habit.save();
                    results.push({ status: 'created', habit });
                }
            } catch (err: any) {
                results.push({ status: 'error', error: err.message });
            }
        }

        return sendSuccess(res, `Bulk sync: ${results.length} habits processed`, { results });
    } catch (error: any) {
        logger.error('Bulk sync habits error:', error);
        return sendError(res, 'Bulk sync failed', 500, error);
    }
};
