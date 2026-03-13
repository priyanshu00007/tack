import { Router } from 'express';
import {
    getGoals,
    createGoal,
    updateGoal,
    addMilestone,
    toggleMilestone,
    deleteGoal
} from '../controllers/goalController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.post('/:id/milestones', addMilestone);
router.put('/:id/milestones/:milestoneIndex/toggle', toggleMilestone);
router.delete('/:id', deleteGoal);

export default router;
