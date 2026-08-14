import express from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addLeadNote
} from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/leads is public (for contact form submissions)
// GET /api/leads is protected (for admin CRM dashboard)
router.route('/')
  .post(createLead)
  .get(protect, getLeads);

router.route('/:id')
  .get(protect, getLeadById)
  .put(protect, updateLead)
  .delete(protect, deleteLead);

router.post('/:id/notes', protect, addLeadNote);

export default router;
