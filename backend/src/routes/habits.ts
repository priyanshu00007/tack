import { Router } from 'express';
import {
    getHabits,
    createHabit,
    updateHabit,
    toggleHabitDate,
    deleteHabit,
    bulkSyncHabits
} from '../controllers/habitController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getHabits);
router.post('/', createHabit);
router.post('/bulk', bulkSyncHabits);
router.put('/:id', updateHabit);
router.post('/:id/toggle', toggleHabitDate);
router.delete('/:id', deleteHabit);

export default router;
