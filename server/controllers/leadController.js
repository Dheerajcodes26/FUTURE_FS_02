import mongoose from 'mongoose';
import Lead from '../models/Lead.js';

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public (or Admin protected in later tasks)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Validate field lengths
    if (name.trim().length > 200) {
      return res.status(400).json({ success: false, message: 'Name must be 200 characters or less' });
    }
    if (email.trim().length > 254) {
      return res.status(400).json({ success: false, message: 'Email must be 254 characters or less' });
    }
    if (phone && phone.trim().length > 30) {
      return res.status(400).json({ success: false, message: 'Phone must be 30 characters or less' });
    }
    if (source && source.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Source must be 100 characters or less' });
    }

    // Validate note length if provided
    if (notes) {
      const noteTexts = typeof notes === 'string' ? [notes] : (Array.isArray(notes) ? notes : []);
      for (const n of noteTexts) {
        const txt = typeof n === 'string' ? n : n.text;
        if (txt && txt.trim().length > 2000) {
          return res.status(400).json({ success: false, message: 'Each note must be 2000 characters or less' });
        }
      }
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
    return res.status(500).json({ success: false, message: 'Server error creating lead' });
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
    return res.status(500).json({ success: false, message: 'Server error fetching leads' });
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
    return res.status(500).json({ success: false, message: 'Server error fetching lead' });
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

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' });
      }
      if (name.trim().length > 200) {
        return res.status(400).json({ success: false, message: 'Name must be 200 characters or less' });
      }
      lead.name = name.trim();
    }
    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({ success: false, message: 'Email cannot be empty' });
      }
      if (!EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }
      if (email.trim().length > 254) {
        return res.status(400).json({ success: false, message: 'Email must be 254 characters or less' });
      }
      lead.email = email.trim().toLowerCase();
    }
    if (phone !== undefined) {
      if (phone.trim().length > 30) {
        return res.status(400).json({ success: false, message: 'Phone must be 30 characters or less' });
      }
      lead.phone = phone.trim();
    }
    if (source !== undefined) {
      if (!source.trim()) {
        return res.status(400).json({ success: false, message: 'Source cannot be empty' });
      }
      if (source.trim().length > 100) {
        return res.status(400).json({ success: false, message: 'Source must be 100 characters or less' });
      }
      lead.source = source.trim();
    }
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
    return res.status(500).json({ success: false, message: 'Server error updating lead' });
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
    return res.status(500).json({ success: false, message: 'Server error deleting lead' });
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

    if (text.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Note must be 2000 characters or less' });
    }

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.push({ text: text.trim() });
    await lead.save();

    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error adding note' });
  }
};
