import Lead from '../models/Lead.js';

// @desc    Get public CRM stats (for login page)
// @route   GET /api/stats
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ status: 'converted' });
    const contactedLeads = await Lead.countDocuments({ status: 'contacted' });
    const newLeads = await Lead.countDocuments({ status: 'new' });

    const conversionRate = totalLeads > 0
      ? Math.round((convertedLeads / totalLeads) * 100)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalLeads,
        convertedLeads,
        contactedLeads,
        newLeads,
        conversionRate,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error fetching stats' });
  }
};
