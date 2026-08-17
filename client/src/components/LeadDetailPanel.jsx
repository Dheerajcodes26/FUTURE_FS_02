import React, { useState } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = ['new', 'contacted', 'converted'];

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

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === status) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const res = await axios.put('/api/leads/' + lead._id, { status: newStatus });
      if (res.data.success) { setStatus(res.data.data.status); onUpdate(res.data.data); showSuccess('Status updated.'); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to update status.'); }
    finally { setUpdatingStatus(false); }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    setError(null);
    try {
      const res = await axios.post('/api/leads/' + lead._id + '/notes', { text: noteText.trim() });
      if (res.data.success) { setNotes(res.data.data.notes || []); setNoteText(''); onUpdate(res.data.data); showSuccess('Note added.'); }
    } catch (err) { setError(err.response?.data?.message || 'Failed to add note.'); }
    finally { setAddingNote(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await axios.delete('/api/leads/' + lead._id);
      onDelete(lead._id);
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete lead.'); setDeleting(false); setConfirmDelete(false); }
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div onClick={onClose} className="drawer-backdrop" />
      <div className="drawer">
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>{getInitials(lead.name)}</div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)' }}>{lead.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Lead Details & Follow-Up</p>
            </div>
          </div>
          <button onClick={onClose} className="drawer-close" aria-label="Close panel">✕</button>
        </div>

        <div className="drawer-body">
          {error && <div className="alert alert-error">{error}</div>}
          {successMsg && <div className="alert alert-success">{successMsg}</div>}

          <section className="drawer-section">
            <h3 className="drawer-section-title">Contact Information</h3>
            <div className="drawer-info-grid">
              <div className="drawer-info-item"><label>Email</label><span>{lead.email}</span></div>
              <div className="drawer-info-item"><label>Phone</label><span>{lead.phone || 'Not provided'}</span></div>
              <div className="drawer-info-item"><label>Source</label><span>{lead.source || 'Website'}</span></div>
              <div className="drawer-info-item"><label>Created</label><span>{formatDate(lead.createdAt)}</span></div>
              {lead.updatedAt && <div className="drawer-info-item"><label>Updated</label><span>{formatDate(lead.updatedAt)}</span></div>}
            </div>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section-title">Pipeline Status {updatingStatus && <span style={{ color: 'var(--sky-500)' }}>· Saving...</span>}</h3>
            <div className="status-options">
              {STATUS_OPTIONS.map((s) => (
                <button key={s} onClick={() => handleStatusChange(s)} disabled={updatingStatus}
                  className={'status-option ' + (status === s ? 'active' : '')} data-status={s} type="button">
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section-title">Add Follow-Up Note</h3>
            <form onSubmit={handleAddNote} className="note-input-area">
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a follow-up note here..." rows={3} disabled={addingNote} className="input textarea" />
              <button type="submit" disabled={addingNote || !noteText.trim()} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
                {addingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section-title">Follow-Up History ({notes.length})</h3>
            {notes.length === 0 ? (
              <p className="note-empty">No notes yet. Add the first follow-up note above.</p>
            ) : (
              <div className="notes-list">
                {[...notes].reverse().map((note, idx) => (
                  <div className="note-card" key={note._id || idx}>
                    <p className="note-text">{note.text}</p>
                    <p className="note-date">{formatDate(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="drawer-section">
            <h3 className="drawer-section-title">Danger Zone</h3>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="btn btn-danger" style={{ width: '100%' }}>Delete This Lead</button>
            ) : (
              <div className="danger-zone">
                <p style={{ color: 'var(--red-500)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>Are you sure? This action cannot be undone.</p>
                <div className="delete-actions">
                  <button onClick={handleDelete} disabled={deleting} className="btn btn-danger" style={{ flex: 1 }}>
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default LeadDetailPanel;
