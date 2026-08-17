import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

const SOURCE_COLORS = {
  Website: '#0ea5e9', LinkedIn: '#0284c7', Facebook: '#3b82f6',
  Instagram: '#8b5cf6', Referral: '#22c55e', 'Google Ads': '#f59e0b', Other: '#94a3b8',
};

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function DashboardPage({ onNavigate, onSelectLead }) {
  const { admin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get('/api/leads');
        if (res.data.success) setLeads(res.data.data || []);
      } catch {} finally { setLoading(false); }
    };
    fetchLeads();
  }, []);

  const analytics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';
    const sourceCounts = {};
    leads.forEach(l => { const s = l.source || 'Website'; sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
    return { total, new: newCount, contacted, converted, rate: rate + '%', sourceCounts };
  }, [leads]);

  const recentLeads = useMemo(() => leads.slice(0, 6), [leads]);
  const maxSource = Math.max(...Object.values(analytics.sourceCounts), 1);

  const metrics = [
    { label: 'Total Leads', value: analytics.total, icon: '\u{1F4CA}', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { label: 'New', value: analytics.new, icon: '\u{1F195}', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
    { label: 'Contacted', value: analytics.contacted, icon: '\u{1F4DE}', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Converted', value: analytics.converted, icon: '\u2705', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Conversion Rate', value: analytics.rate, icon: '\u{1F4C8}', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {admin?.email || 'Admin'}. Here is your CRM overview.</p>
      </div>
      <div className="analytics-grid">
        {metrics.map((m) => (
          <div className="analytics-card" key={m.label}>
            <div className="analytics-card-icon" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
            <div className="analytics-card-label">{m.label}</div>
            <div className="analytics-card-value" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-composition">
        <div className="dashboard-main">
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Recent Leads</span>
              <button className="btn btn-sm btn-ghost" onClick={() => onNavigate('leads')}>View All</button>
            </div>
            <div className="dash-card-body">
              {loading ? (
                <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>Loading...</div>
              ) : recentLeads.length === 0 ? (
                <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>No leads yet</div>
              ) : (
                recentLeads.map((lead) => (
                  <div className="recent-lead-item" key={lead._id} onClick={() => onSelectLead(lead)}>
                    <div className="avatar avatar-sm" style={{ background: getAvatarColor(lead.name) }}>{getInitials(lead.name)}</div>
                    <div className="recent-lead-info">
                      <div className="recent-lead-name">{lead.name}</div>
                      <div className="recent-lead-email">{lead.email}</div>
                    </div>
                    <span className={'badge badge-' + lead.status}>{lead.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card-header"><span className="dash-card-title">Quick Actions</span></div>
            <div className="dash-card-body">
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => onNavigate('add-lead')}>
                  <span className="quick-action-icon">+</span>Add New Lead
                </button>
                <button className="quick-action-btn" onClick={() => onNavigate('leads')}>
                  <span className="quick-action-icon">@</span>View All Leads
                </button>
                <button className="quick-action-btn" onClick={() => onNavigate('analytics')}>
                  <span className="quick-action-icon">%</span>View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-sidebar-right">
          <div className="dash-card">
            <div className="dash-card-header"><span className="dash-card-title">Lead Sources</span></div>
            <div className="dash-card-body">
              {Object.keys(analytics.sourceCounts).length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No data yet</p>
              ) : (
                Object.entries(analytics.sourceCounts).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                  <div className="source-bar" key={source}>
                    <span className="source-bar-label">{source}</span>
                    <div className="source-bar-track">
                      <div className="source-bar-fill" style={{ width: (count / maxSource) * 100 + '%', background: SOURCE_COLORS[source] || '#94a3b8' }} />
                    </div>
                    <span className="source-bar-count">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card-header"><span className="dash-card-title">Pipeline Summary</span></div>
            <div className="dash-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[{ label: 'New Leads', value: analytics.new, color: '#0ea5e9' },
                  { label: 'Contacted', value: analytics.contacted, color: '#f59e0b' },
                  { label: 'Converted', value: analytics.converted, color: '#22c55e' }
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '700', color }}>{value}</span>
                    </div>
                    <div className="source-bar-track">
                      <div className="source-bar-fill" style={{ width: analytics.total > 0 ? (value / analytics.total) * 100 + '%' : '0%', background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
