import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const FILTER_OPTIONS = ['all', 'new', 'contacted', 'converted'];

const AVATAR_COLORS = [
  'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function formatDate(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function LeadsPage({ onSelectLead, refreshTrigger }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/leads');
      if (res.data.success) setLeads(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [refreshTrigger]);

  const filteredLeads = useMemo(() => {
    let result = leads;
    if (activeFilter !== 'all') result = result.filter(l => l.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l =>
        l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [leads, activeFilter, searchQuery]);

  return (
    <div>
      <div className="page-header">
        <h1>Leads</h1>
        <p>Manage and track all your incoming leads in one place.</p>
      </div>

      <div className="filter-bar">
        <div className="input-wrapper" style={{ flex: '1 1 240px' }}>
          <span className="input-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="input input-with-icon"
          />
        </div>

        <div className="filter-tabs">
          {FILTER_OPTIONS.map((f) => {
            const count = f === 'all' ? leads.length : leads.filter(l => l.status === f).length;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`btn-filter ${activeFilter === f ? 'active' : ''}`}
                type="button"
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={fetchLeads} className="btn btn-sm btn-danger">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>{searchQuery || activeFilter !== 'all' ? 'No matching leads' : 'No Leads Yet'}</h3>
          <p>{searchQuery || activeFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Incoming contact submissions will appear here.'}</p>
          {(searchQuery || activeFilter !== 'all') && (
            <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div className="avatar avatar-sm" style={{ background: getAvatarColor(lead.name) }}>
                          {getInitials(lead.name)}
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{lead.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{lead.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{lead.phone || 'N/A'}</td>
                    <td>{lead.source || 'Website'}</td>
                    <td><span className={`badge badge-${lead.status}`}>{lead.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lead.notes?.length || 0}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(lead.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="table-action-btn" title="View" onClick={() => onSelectLead(lead)}>👁</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'right' }}>
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
        </>
      )}
    </div>
  );
}

export default LeadsPage;
