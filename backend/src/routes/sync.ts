import { Router } from 'express';
import { syncAll, bulkSync, pullData, getStats } from '../controllers/syncController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Sync endpoints
router.post('/', syncAll);         // Single item sync
router.post('/bulk', bulkSync);    // Bulk sync
router.get('/pull', pullData);     // Pull all data for offline storage

// Stats
router.get('/stats', getStats);    // Comprehensive statistics

export default router;
