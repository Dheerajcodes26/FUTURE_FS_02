import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

function timeAgo(dateString) {
  if (!dateString) return '';
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function deriveNotifications(leads) {
  if (!leads || leads.length === 0) return [];
  const notifications = [];
  const dayMs = 86400000;

  leads.forEach((lead) => {
    const createdDiff = Date.now() - new Date(lead.createdAt).getTime();

    if (createdDiff < dayMs * 7) {
      notifications.push({
        id: 'new-' + lead._id,
        type: 'new_lead',
        icon: '\uD83D\uDC64',
        title: 'New lead received',
        description: (lead.name || 'Someone') + ' submitted a new lead' + (lead.source ? ' from ' + lead.source : ''),
        timestamp: lead.createdAt,
        read: false,
      });
    }

    if (lead.status === 'contacted') {
      const diff = Date.now() - new Date(lead.updatedAt || lead.createdAt).getTime();
      if (diff < dayMs * 7) {
        notifications.push({
          id: 'contacted-' + lead._id,
          type: 'status_changed',
          icon: '\uD83D\uDCDE',
          title: 'Lead contacted',
          description: lead.name + ' was moved to contacted',
          timestamp: lead.updatedAt || lead.createdAt,
          read: false,
        });
      }
    }

    if (lead.status === 'converted') {
      const diff = Date.now() - new Date(lead.updatedAt || lead.createdAt).getTime();
      if (diff < dayMs * 7) {
        notifications.push({
          id: 'converted-' + lead._id,
          type: 'lead_converted',
          icon: '\u2705',
          title: 'Lead converted',
          description: lead.name + ' was converted successfully',
          timestamp: lead.updatedAt || lead.createdAt,
          read: false,
        });
      }
    }

    if (lead.notes && lead.notes.length > 0) {
      const latestNote = lead.notes[lead.notes.length - 1];
      const noteDiff = Date.now() - new Date(latestNote.createdAt).getTime();
      if (noteDiff < dayMs * 3) {
        notifications.push({
          id: 'note-' + lead._id + '-' + (latestNote._id || ''),
          type: 'note_added',
          icon: '\uD83D\uDCDD',
          title: 'Follow-up note added',
          description: 'A note was added for ' + lead.name,
          timestamp: latestNote.createdAt,
          read: false,
        });
      }
    }
  });

  notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return notifications;
}

function NotificationPanel({ onClose, isOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem('lp_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/leads');
        if (res.data.success) {
          setNotifications(deriveNotifications(res.data.data || []));
        }
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('lp_read_notifications', JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.notif-bell-btn')) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const unreadNotifications = notifications.filter((n) => !readIds.includes(n.id));
  const unreadCount = unreadNotifications.length;

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds((prev) => [...new Set([...prev, ...allIds])]);
  }, [notifications]);

  if (!isOpen) return null;

  return (
    <>
      <div className="notif-panel-backdrop" onClick={onClose} />
      <div
        className="notif-panel"
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
      >
        <div className="notif-panel-header">
          <div className="notif-panel-header-left">
            <span className="notif-panel-title">Notifications</span>
            {unreadCount > 0 && (
              <span className="notif-panel-count">{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button className="notif-panel-mark-read" onClick={markAllAsRead} type="button">
              Mark all as read
            </button>
          )}
        </div>

        <div className="notif-panel-body">
          {loading ? (
            <div className="notif-panel-loading">
              <div className="spinner" style={{ width: 20, height: 20 }} />
              <span>Loading...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notif-panel-empty">
              <div className="notif-panel-empty-icon">{'\uD83D\uDD14'}</div>
              <div className="notif-panel-empty-title">No new notifications</div>
              <div className="notif-panel-empty-desc">You are all caught up!</div>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={'notif-panel-item' + (readIds.includes(n.id) ? '' : ' unread')}
              >
                <div className="notif-panel-item-icon">{n.icon}</div>
                <div className="notif-panel-item-content">
                  <div className="notif-panel-item-title">{n.title}</div>
                  <div className="notif-panel-item-desc">{n.description}</div>
                  <div className="notif-panel-item-time">{timeAgo(n.timestamp)}</div>
                </div>
                {!readIds.includes(n.id) && <div className="notif-panel-item-dot" />}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
