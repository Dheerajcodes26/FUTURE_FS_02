import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LeadDetailPanel from '../components/LeadDetailPanel';

const FILTER_OPTIONS = ['all', 'new', 'contacted', 'converted'];

const ANALYTICS_CONFIG = [
  { key: 'total',     label: 'Total Leads',    color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' },
  { key: 'new',       label: 'New',            color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)' },
  { key: 'contacted', label: 'Contacted',       color: '#fbbf24', borderColor: 'rgba(251,191,36,0.3)' },
  { key: 'converted', label: 'Converted',       color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' },
  { key: 'rate',      label: 'Conversion Rate', color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)' },
];

function DashboardPage() {
  const { admin, logout } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/leads');
      if (response.data.success) {
        setLeads(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleLeadUpdate = (updatedLead) => {
    setLeads((prev) => prev.map((l) => (l._id === updatedLead._id ? updatedLead : l)));
    setSelectedLead(updatedLead);
  };

  const handleLeadDelete = (deletedId) => {
    setLeads((prev) => prev.filter((l) => l._id !== deletedId));
    setSelectedLead(null);
  };

  const analytics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';
    return { total, new: newCount, contacted, converted, rate: `${rate}%` };
  }, [leads]);

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

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || 'new').toLowerCase();
    return <span className={`badge badge-${s}`}>{s}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>

      {/* ── Header Navigation ── */}
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="dashboard-header-brand">
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'bold', fontSize: '0.9rem'
            }}>CRM</div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Mini CRM Lead Dashboard
            </h1>
          </div>

          <div className="dashboard-header-actions">
            <span className="admin-label">
              Admin: <strong style={{ color: '#f8fafc' }}>{admin?.email}</strong>
            </span>
            <button
              onClick={logout}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                border: '1px solid #ef4444', background: 'rgba(239,68,68,0.1)',
                color: '#fca5a5', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="container">

        {/* Analytics Cards */}
        {!loading && (
          <div className="analytics-grid">
            {ANALYTICS_CONFIG.map(({ key, label, color, borderColor }) => (
              <div key={key} style={{
                background: '#1e293b', border: `1px solid ${borderColor}`,
                borderRadius: '12px', padding: '1.125rem', textAlign: 'center'
              }}>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  {label}
                </p>
                <p style={{ fontSize: '1.875rem', fontWeight: '800', color, lineHeight: 1 }}>
                  {analytics[key]}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Section Heading */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#f8fafc' }}>Incoming Leads</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.2rem' }}>
            Click any row to view details, update status, or add notes.
          </p>
        </div>

        {/* Search & Filter Bar */}
        {!loading && (
          <div className="search-filter-bar">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <span style={{
                position: 'absolute', left: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', color: '#64748b', fontSize: '1rem', pointerEvents: 'none'
              }}>⌕</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem'
                  }}
                >✕</button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {FILTER_OPTIONS.map((f) => {
                const isActive = activeFilter === f;
                const count = f === 'all' ? leads.length : leads.filter(l => l.status === f).length;
                return (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    style={{
                      padding: '0.4rem 0.85rem', borderRadius: '6px', border: 'none',
                      background: isActive ? '#6366f1' : 'transparent',
                      color: isActive ? '#fff' : '#94a3b8',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '0.8rem', textTransform: 'capitalize',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}
                  >
                    {f} <span style={{ opacity: 0.75 }}>({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', padding: '1rem', borderRadius: '10px',
            marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.75rem'
          }}>
            <span>{error}</span>
            <button onClick={fetchLeads} style={{
              background: '#ef4444', color: '#fff', border: 'none',
              padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem'
            }}>Retry</button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <div className="spinner"></div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Fetching leads from database...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          /* Empty / No Results State */
          <div style={{
            background: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
            padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8'
          }}>
            <p style={{ fontSize: '1.1rem', color: '#f8fafc', marginBottom: '0.5rem' }}>
              {searchQuery || activeFilter !== 'all' ? 'No matching leads found.' : 'No Leads Yet'}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {searchQuery || activeFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Incoming contact submissions will appear here.'}
            </p>
            {(searchQuery || activeFilter !== 'all') && (
              <button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }} style={{
                marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '8px',
                border: '1px solid #334155', background: 'transparent',
                color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem'
              }}>Clear Filters</button>
            )}
          </div>
        ) : (
          /* Lead Table */
          <div className="table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Lead Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => setSelectedLead(lead)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view details"
                  >
                    <td style={{ fontWeight: '600', color: '#f8fafc' }}>{lead.name}</td>
                    <td style={{ color: '#cbd5e1' }}>{lead.email}</td>
                    <td style={{ color: '#94a3b8' }}>{lead.phone || 'N/A'}</td>
                    <td style={{ color: '#cbd5e1' }}>{lead.source || 'Website'}</td>
                    <td>{getStatusBadge(lead.status)}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{lead.notes?.length || 0}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{formatDate(lead.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Results summary */}
        {!loading && filteredLeads.length > 0 && (searchQuery || activeFilter !== 'all') && (
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', textAlign: 'right' }}>
            Showing {filteredLeads.length} of {leads.length} leads
          </p>
        )}
      </div>

      {/* Lead Detail Side Panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
          onDelete={handleLeadDelete}
        />
      )}
    </div>
  );
}

export default DashboardPage;
