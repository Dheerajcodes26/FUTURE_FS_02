import mongoose from 'mongoose';
import Lead from '../models/Lead.js';

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public (or Admin protected in later tasks)
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const leadData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      source: source && source.trim() ? source.trim() : 'Website',
      status: status && ['new', 'contacted', 'converted'].includes(status.toLowerCase())
        ? status.toLowerCase()
        : 'new'
    };

    if (notes) {
      if (typeof notes === 'string' && notes.trim()) {
        leadData.notes = [{ text: notes.trim() }];
      } else if (Array.isArray(notes)) {
        leadData.notes = notes.map(n => typeof n === 'string' ? { text: n } : n);
      }
    }

    const lead = await Lead.create(leadData);
    return res.status(201).json({ success: true, data: lead });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'Server error creating lead', error: error.message });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Public / Protected
export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching leads', error: error.message });
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Public / Protected
export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Lead ID format' });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching lead', error: error.message });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Public / Protected
export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Lead ID format' });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const { name, email, phone, source, status } = req.body;

    if (name !== undefined) lead.name = name.trim();
    if (email !== undefined) lead.email = email.trim().toLowerCase();
    if (phone !== undefined) lead.phone = phone.trim();
    if (source !== undefined) lead.source = source.trim();
    if (status !== undefined) {
      if (!['new', 'contacted', 'converted'].includes(status.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Status must be new, contacted, or converted' });
      }
      lead.status = status.toLowerCase();
    }

    const updatedLead = await lead.save();
    return res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    return res.status(500).json({ success: false, message: 'Server error updating lead', error: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Public / Protected
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Lead ID format' });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await lead.deleteOne();
    return res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting lead', error: error.message });
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Public / Protected
export const addLeadNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Lead ID format' });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.push({ text: text.trim() });
    await lead.save();

    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error adding note', error: error.message });
  }
};
