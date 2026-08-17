import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const SOURCE_COLORS = {
  Website: '#0ea5e9',
  LinkedIn: '#0284c7',
  Facebook: '#3b82f6',
  Instagram: '#8b5cf6',
  Referral: '#22c55e',
  'Google Ads': '#f59e0b',
  Other: '#94a3b8',
};

function AnalyticsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/api/leads');
        if (res.data.success) setLeads(res.data.data || []);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const analytics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

    const sourceCounts = {};
    leads.forEach(l => {
      const s = l.source || 'Website';
      sourceCounts[s] = (sourceCounts[s] || 0) + 1;
    });

    return { total, newCount, contacted, converted, rate, sourceCounts };
  }, [leads]);

  const maxSource = Math.max(...Object.values(analytics.sourceCounts), 1);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Insights into your lead pipeline performance.</p>
      </div>

      <div className="analytics-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="analytics-card" style={{ '--accent': '#0ea5e9' }}>
          <div className="analytics-card-icon" style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>📊</div>
          <div className="analytics-card-label">Total Leads</div>
          <div className="analytics-card-value" style={{ color: '#0ea5e9' }}>{analytics.total}</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>🆕</div>
          <div className="analytics-card-label">New</div>
          <div className="analytics-card-value" style={{ color: '#0ea5e9' }}>{analytics.newCount}</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>📞</div>
          <div className="analytics-card-label">Contacted</div>
          <div className="analytics-card-value" style={{ color: '#f59e0b' }}>{analytics.contacted}</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>✅</div>
          <div className="analytics-card-label">Converted</div>
          <div className="analytics-card-value" style={{ color: '#22c55e' }}>{analytics.converted}</div>
        </div>
        <div className="analytics-card">
          <div className="analytics-card-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>📈</div>
          <div className="analytics-card-label">Conversion Rate</div>
          <div className="analytics-card-value" style={{ color: '#8b5cf6' }}>{analytics.rate}%</div>
        </div>
      </div>

      <div className="analytics-charts">
        {/* Lead Sources Bar Chart */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Lead Sources</div>
          </div>
          <div className="chart-card-body">
            {Object.keys(analytics.sourceCounts).length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', textAlign: 'center', width: '100%', padding: '2rem 0' }}>No data available</p>
            ) : (
              <div className="bar-chart">
                {Object.entries(analytics.sourceCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count]) => (
                    <div className="bar-col" key={source}>
                      <span className="bar-value">{count}</span>
                      <div
                        className="bar-fill"
                        style={{
                          height: `${(count / maxSource) * 140}px`,
                          background: SOURCE_COLORS[source] || '#94a3b8',
                        }}
                      />
                      <span className="bar-label">{source}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Donut */}
        <div className="chart-card">
          <div className="chart-card-header">
            <div className="chart-card-title">Status Distribution</div>
          </div>
          <div className="chart-card-body">
            {analytics.total === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', textAlign: 'center', width: '100%', padding: '2rem 0' }}>No data available</p>
            ) : (
              <div className="donut-chart">
                <svg className="donut-svg" viewBox="0 0 36 36">
                  {(() => {
                    const items = [
                      { label: 'New', value: analytics.newCount, color: '#0ea5e9' },
                      { label: 'Contacted', value: analytics.contacted, color: '#f59e0b' },
                      { label: 'Converted', value: analytics.converted, color: '#22c55e' },
                    ];
                    let offset = 0;
                    return items.map(({ label, value, color }) => {
                      if (value === 0) return null;
                      const pct = (value / analytics.total) * 100;
                      const dash = pct;
                      const gap = 100 - pct;
                      const el = (
                        <circle
                          key={label}
                          cx="18" cy="18" r="15.915"
                          fill="none"
                          stroke={color}
                          strokeWidth="3"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={-offset}
                          style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div className="donut-legend">
                  <div className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ background: '#0ea5e9' }} />
                    New ({analytics.newCount})
                  </div>
                  <div className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ background: '#f59e0b' }} />
                    Contacted ({analytics.contacted})
                  </div>
                  <div className="donut-legend-item">
                    <span className="donut-legend-dot" style={{ background: '#22c55e' }} />
                    Converted ({analytics.converted})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
