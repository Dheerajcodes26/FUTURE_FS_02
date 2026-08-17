import express from 'express';
import { loginAdmin, getMe, registerAdmin } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.get('/me', protect, getMe);

export default router;
