import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function SettingsPage() {
  const { admin, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const initials = admin?.email
    ? admin.email.substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and application preferences.</p>
      </div>

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-card">
          <div className="settings-card-title">Profile</div>
          <div className="settings-card-desc">Your account information.</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="avatar avatar-lg" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {admin?.email || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Administrator Account</div>
            </div>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Email</span>
            <span className="settings-row-value">{admin?.email || 'N/A'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Role</span>
            <span className="settings-row-value">Admin</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">User ID</span>
            <span className="settings-row-value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {admin?._id || 'N/A'}
            </span>
          </div>
        </div>

        {/* Security */}
        <div className="settings-card">
          <div className="settings-card-title">Security</div>
          <div className="settings-card-desc">Session and authentication settings.</div>

          <div className="settings-row">
            <span className="settings-row-label">Authentication</span>
            <span className="settings-row-value" style={{ color: 'var(--green-500)' }}>JWT Token Active</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Token Expiry</span>
            <span className="settings-row-value">7 days</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Session</span>
            <span className="settings-row-value" style={{ color: 'var(--green-500)' }}>Active</span>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <button onClick={logout} className="btn btn-danger" style={{ width: '100%' }}>
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-card">
          <div className="settings-card-title">Appearance</div>
          <div className="settings-card-desc">Choose how LeadPulse looks.</div>

          <div className="theme-switcher-row">
            <button
              className={'theme-option-btn' + (!isDark ? ' active' : '')}
              onClick={() => setTheme('light')}
              type="button"
            >
              ☀️ Light
            </button>
            <button
              className={'theme-option-btn' + (isDark ? ' active' : '')}
              onClick={() => setTheme('dark')}
              type="button"
            >
              🌙 Dark
            </button>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Current Theme</span>
            <span className="settings-row-value">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Primary Color</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />
              <span className="settings-row-value">#0ea5e9</span>
            </span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Style</span>
            <span className="settings-row-value">Glassmorphism</span>
          </div>
        </div>

        {/* About */}
        <div className="settings-card">
          <div className="settings-card-title">About LeadPulse CRM</div>
          <div className="settings-card-desc">Application information.</div>

          <div className="settings-row">
            <span className="settings-row-label">Version</span>
            <span className="settings-row-value">1.0.0</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Frontend</span>
            <span className="settings-row-value">React 18 + Vite</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Backend</span>
            <span className="settings-row-value">Node.js + Express</span>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">Database</span>
            <span className="settings-row-value">MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
