import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'leads', label: 'Leads', icon: '👥' },
  { key: 'add-lead', label: 'Add Lead', icon: '➕' },
  { key: 'analytics', label: 'Analytics', icon: '📈' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

function AppShell({ currentPage, onNavigate, children }) {
  const { admin, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const initials = admin?.email
    ? admin.email.substring(0, 2).toUpperCase()
    : 'AD';

  const handleNav = (key) => {
    onNavigate(key);
    setSidebarOpen(false);
  };

  // Close profile dropdown on outside click (works on both desktop and mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inTrigger = profileRef.current && profileRef.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inTrigger && !inDropdown) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [profileOpen]);

  // Close both dropdowns + modal on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setShowLogoutModal(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setProfileOpen(false);
    logout();
  };

  const toggleNotifications = useCallback(() => {
    setNotifOpen((prev) => !prev);
    setProfileOpen(false);
  }, []);

  const closeNotifications = useCallback(() => {
    setNotifOpen(false);
  }, []);

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">LP</div>
          <span className="sidebar-brand-text">LeadPulse</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Main</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`sidebar-nav-item ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => handleNav(item.key)}
              type="button"
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              type="button"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <span className="header-page-title">
              {NAV_ITEMS.find(n => n.key === currentPage)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="header-search">
            <span className="header-search-icon">🔍</span>
            <input type="text" placeholder="Search..." aria-label="Global search" />
          </div>

          <div className="header-actions">
            <button
              className="header-btn theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <div ref={bellRef} style={{ position: 'relative' }}>
              <button
                className="header-btn notif-bell-btn"
                type="button"
                aria-label="Notifications"
                onClick={toggleNotifications}
                aria-expanded={notifOpen}
              >
                🔔
              </button>
              <NotificationPanel
                isOpen={notifOpen}
                onClose={closeNotifications}
              />
            </div>

            <div className="header-user-menu" ref={profileRef}>
              <button
                className="header-user-menu-trigger"
                type="button"
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="header-user-avatar">{initials}</div>
                <span className="header-user-name">{admin?.email || 'Admin'}</span>
                <span className="header-user-chevron">▾</span>
              </button>
            </div>
          </div>
        </header>

        <div className="page-content animate-fade-in">
          {children}
        </div>
      </div>

      {/* Profile Dropdown — rendered outside header for proper z-index on mobile */}
      {profileOpen && (
        <>
          <div className="profile-dropdown-backdrop" onClick={() => setProfileOpen(false)} />
          <div className="profile-dropdown" role="menu" ref={dropdownRef}>
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-avatar">{initials}</div>
              <div className="profile-dropdown-info">
                <div className="profile-dropdown-email">{admin?.email || 'Admin'}</div>
                <div className="profile-dropdown-role">Administrator</div>
              </div>
            </div>
            <div className="profile-dropdown-divider" />
            <button
              className="profile-dropdown-item"
              onClick={() => { setProfileOpen(false); onNavigate('settings'); }}
              type="button"
              role="menuitem"
            >
              <span className="profile-dropdown-icon">👤</span>
              Profile
            </button>
            <button
              className="profile-dropdown-item"
              onClick={() => { setProfileOpen(false); onNavigate('settings'); }}
              type="button"
              role="menuitem"
            >
              <span className="profile-dropdown-icon">⚙️</span>
              Settings
            </button>
            <button
              className="profile-dropdown-item"
              onClick={() => { setProfileOpen(false); toggleTheme(); }}
              type="button"
              role="menuitem"
            >
              <span className="profile-dropdown-icon">{isDark ? '☀️' : '🌙'}</span>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="profile-dropdown-divider" />
            <button
              className="profile-dropdown-item profile-dropdown-danger"
              onClick={() => { setProfileOpen(false); setShowLogoutModal(true); }}
              type="button"
              role="menuitem"
            >
              <span className="profile-dropdown-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-backdrop" />
          <div className="modal logout-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Sign out confirmation">
            <div className="modal-body">
              <div className="modal-icon">🚪</div>
              <h3 className="modal-title">Sign out?</h3>
              <p className="modal-desc">Are you sure you want to sign out of LeadPulse?</p>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLogoutModal(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleLogoutConfirm}
                type="button"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;
