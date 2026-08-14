import React, { useState } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = ['new', 'contacted', 'converted'];

const STATUS_COLORS = {
  new: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  contacted: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  converted: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
};

function LeadDetailPanel({ lead, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(lead.status || 'new');
  const [noteText, setNoteText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notes, setNotes] = useState(lead.notes || []);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const res = await axios.put(`/api/leads/${lead._id}`, { status: newStatus });
      if (res.data.success) {
        setStatus(res.data.data.status);
        onUpdate(res.data.data);
        showSuccess('Status updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    setError(null);
    try {
      const res = await axios.post(`/api/leads/${lead._id}/notes`, { text: noteText.trim() });
      if (res.data.success) {
        setNotes(res.data.data.notes || []);
        setNoteText('');
        onUpdate(res.data.data);
        showSuccess('Note added successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await axios.delete(`/api/leads/${lead._id}`);
      onDelete(lead._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lead.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="lead-panel-backdrop" />

      {/* Side Panel */}
      <div className="lead-panel">
        {/* Panel Header */}
        <div className="lead-panel-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
              {lead.name}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Lead Details & Follow-Up
            </p>
          </div>
          <button
            onClick={onClose}
            className="lead-panel-close"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <div className="lead-panel-body">
          {/* Feedback messages */}
          {error && (
            <div className="panel-alert-error">{error}</div>
          )}
          {successMsg && (
            <div className="panel-alert-success">{successMsg}</div>
          )}

          {/* Lead Info */}
          <section className="lead-info-section">
            <h3 className="section-label">
              Contact Information
            </h3>
            <div className="info-grid">
              <InfoField label="Email" value={lead.email} />
              <InfoField label="Phone" value={lead.phone || 'Not provided'} />
              <InfoField label="Source" value={lead.source || 'Website'} />
              <InfoField label="Created" value={formatDate(lead.createdAt)} />
            </div>
          </section>

          {/* Status Changer */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-label-sm">
              Pipeline Status {updatingStatus && <span style={{ color: '#6366f1' }}>· Saving...</span>}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((s) => {
                const colors = STATUS_COLORS[s];
                const isActive = status === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updatingStatus}
                    className="status-btn"
                    style={{
                      border: `1px solid ${isActive ? colors.border : '#334155'}`,
                      background: isActive ? colors.bg : 'transparent',
                      color: isActive ? colors.color : '#64748b',
                      fontWeight: isActive ? '700' : '500',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Add Note */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-label-sm">
              Add Follow-Up Note
            </h3>
            <form onSubmit={handleAddNote} className="note-form">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a follow-up note here..."
                rows={3}
                disabled={addingNote}
                className="form-textarea"
              />
              <button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="btn-add-note"
                style={{
                  cursor: addingNote || !noteText.trim() ? 'not-allowed' : 'pointer',
                  opacity: addingNote || !noteText.trim() ? 0.6 : 1,
                }}
              >
                {addingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </section>

          {/* Notes History */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 className="section-label-sm">
              Follow-Up History ({notes.length})
            </h3>
            {notes.length === 0 ? (
              <p className="note-empty">
                No notes yet. Add the first follow-up note above.
              </p>
            ) : (
              <div className="notes-list">
                {[...notes].reverse().map((note, idx) => (
                  <div key={note._id || idx} className="note-card">
                    <p className="note-text">
                      {note.text}
                    </p>
                    <p className="note-date">
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delete Lead */}
          <section>
            <h3 className="section-label-sm">
              Danger Zone
            </h3>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn-delete-lead"
              >
                Delete This Lead
              </button>
            ) : (
              <div className="delete-confirm-box">
                <p className="delete-confirm-text">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="delete-actions">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="btn-confirm-delete"
                    style={{
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.7 : 1
                    }}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="btn-cancel-delete"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="info-field-label">
        {label}
      </p>
      <p className="info-field-value">
        {value}
      </p>
    </div>
  );
}

export default LeadDetailPanel;
