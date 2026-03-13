import { Router } from 'express';
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    bulkSyncTasks,
    getTaskStats
} from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTask);
router.post('/', createTask);
router.post('/bulk', bulkSyncTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
