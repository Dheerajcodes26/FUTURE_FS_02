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

  const sc = STATUS_COLORS[status] || STATUS_COLORS.new;

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
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <div className="lead-panel-body">
          {/* Feedback messages */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '8px',
              fontSize: '0.875rem', marginBottom: '1rem'
            }}>{error}</div>
          )}
          {successMsg && (
            <div style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', padding: '0.75rem 1rem', borderRadius: '8px',
              fontSize: '0.875rem', marginBottom: '1rem'
            }}>{successMsg}</div>
          )}

          {/* Lead Info */}
          <section style={{
            background: '#0f172a', borderRadius: '10px', border: '1px solid #334155',
            padding: '1.25rem', marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '1rem' }}>
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
            <h3 style={{
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#64748b', marginBottom: '0.75rem'
            }}>
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
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: `1px solid ${isActive ? colors.border : '#334155'}`,
                      background: isActive ? colors.bg : 'transparent',
                      color: isActive ? colors.color : '#64748b',
                      fontWeight: isActive ? '700' : '500',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s'
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
            <h3 style={{
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#64748b', marginBottom: '0.75rem'
            }}>
              Add Follow-Up Note
            </h3>
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: addingNote || !noteText.trim() ? 'not-allowed' : 'pointer',
                  opacity: addingNote || !noteText.trim() ? 0.6 : 1,
                  alignSelf: 'flex-end'
                }}
              >
                {addingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </section>

          {/* Notes History */}
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#64748b', marginBottom: '0.75rem'
            }}>
              Follow-Up History ({notes.length})
            </h3>
            {notes.length === 0 ? (
              <p style={{ color: '#475569', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No notes yet. Add the first follow-up note above.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[...notes].reverse().map((note, idx) => (
                  <div key={note._id || idx} style={{
                    background: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    padding: '0.875rem 1rem'
                  }}>
                    <p style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                      {note.text}
                    </p>
                    <p style={{ color: '#475569', fontSize: '0.75rem' }}>
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Delete Lead */}
          <section>
            <h3 style={{
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              color: '#64748b', marginBottom: '0.75rem'
            }}>
              Danger Zone
            </h3>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.4)',
                  background: 'rgba(239,68,68,0.08)',
                  color: '#f87171',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Delete This Lead
              </button>
            ) : (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <p style={{ color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Are you sure? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      flex: 1, padding: '0.5rem',
                      borderRadius: '6px', border: 'none',
                      background: '#ef4444', color: '#fff',
                      fontWeight: '600', fontSize: '0.85rem',
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.7 : 1
                    }}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    style={{
                      flex: 1, padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #334155',
                      background: 'transparent',
                      color: '#94a3b8',
                      fontWeight: '600', fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
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
      <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </p>
      <p style={{ color: '#e2e8f0', fontSize: '0.9rem', fontWeight: '500' }}>
        {value}
      </p>
    </div>
  );
}

export default LeadDetailPanel;
