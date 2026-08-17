import React, { useState } from 'react';
import axios from 'axios';

function AddLeadPage({ onLeadCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('Website');
  const [status, setStatus] = useState('new');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Invalid email format';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source,
        status,
      };
      if (notes.trim()) payload.notes = [{ text: notes.trim() }];

      await axios.post('/api/leads', payload);
      setSuccess('Lead created successfully!');
      setName(''); setEmail(''); setPhone('');
      setSource('Website'); setStatus('new'); setNotes('');
      setFieldErrors({});
      if (onLeadCreated) onLeadCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add Lead</h1>
        <p>Create a new lead record in the CRM pipeline.</p>
      </div>

      <div className="add-lead-wrapper">
        <div className="glass-strong add-lead-form">
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={`input ${fieldErrors.name ? 'input-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.name && <p className="input-error-text">{fieldErrors.name}</p>}
              </div>

              <div className="input-group">
                <label className="input-label">Email <span className="required">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                  disabled={submitting}
                />
                {fieldErrors.email && <p className="input-error-text">{fieldErrors.email}</p>}
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="input"
                  disabled={submitting}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="input select"
                  disabled={submitting}
                >
                  <option value="Website">Website</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Referral">Referral</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label className="input-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input select"
                  disabled={submitting}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div />
            </div>

            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information about this lead..."
                className="input textarea"
                rows={3}
                disabled={submitting}
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              {submitting ? 'Creating Lead...' : 'Create Lead'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddLeadPage;
