import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function SignupPage({ onSwitchView }) {
  const { setError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadNeeds, setLeadNeeds] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState('');
  const [leadError, setLeadError] = useState('');
  const [activeTab, setActiveTab] = useState('signup');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');
    setError(null);

    if (!fullName.trim()) { setValidationError('Please enter your full name.'); return; }
    if (!email.trim()) { setValidationError('Please enter your email address.'); return; }
    if (!password) { setValidationError('Please create a password.'); return; }
    if (password.length < 6) { setValidationError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setValidationError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      await axios.post('/api/auth/register', {
        name: fullName.trim(),
        email: email.trim(),
        password
      });
      setSuccessMsg('Account created successfully! You can now sign in.');
      setFullName(''); setEmail(''); setPassword(''); setConfirmPassword('');
    } catch (err) {
      let msg;
      if (!err.response) {
        msg = 'Unable to reach the server. Check that the backend is running.';
      } else if (err.response.status === 409) {
        msg = 'An account with this email already exists. Please sign in instead.';
      } else if (err.response.status === 400) {
        msg = err.response.data?.message || 'Please check your input.';
      } else {
        msg = err.response.data?.message || 'Registration failed. Please try again.';
      }
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setLeadError('');
    setLeadSuccess('');
    if (!leadName.trim()) { setLeadError('Full name is required.'); return; }
    if (!leadEmail.trim()) { setLeadError('Email address is required.'); return; }
    if (!leadPhone.trim()) { setLeadError('Phone number is required.'); return; }
    setLeadSubmitting(true);
    try {
      await axios.post('/api/leads', {
        name: leadName.trim(), email: leadEmail.trim(), phone: leadPhone.trim(),
        source: 'Website', notes: leadNeeds.trim() ? [{ text: leadNeeds.trim() }] : undefined,
      });
      setLeadSuccess('Thank you! Your information has been submitted. We will be in touch soon.');
      setLeadName(''); setLeadEmail(''); setLeadPhone(''); setLeadCompany(''); setLeadNeeds('');
    } catch (err) {
      setLeadError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally { setLeadSubmitting(false); }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <span className="login-brand-logo-icon">LP</span>
            <span className="login-brand-logo-text">LeadPulse CRM</span>
          </div>
          <h1 className="login-brand-title">
            Client Lead<br />
            <span className="login-brand-title-highlight">Management System</span>
          </h1>
          <p className="login-brand-description">
            Manage leads, track conversions, and grow your business efficiently.
          </p>
          <ul className="login-brand-features">
            <li><span className="login-brand-feature-icon">👤</span>Lead Tracking</li>
            <li><span className="login-brand-feature-icon">🔄</span>Status Updates</li>
            <li><span className="login-brand-feature-icon">📝</span>Follow-Up Notes</li>
            <li><span className="login-brand-feature-icon">📊</span>Analytics Dashboard</li>
          </ul>
        </div>
      </div>

      <div className="login-content">
        <div className="login-content-inner">
          <h2 className="login-content-title">Welcome to LeadPulse</h2>
          <p className="login-content-subtitle">Create an account or submit a lead</p>

          <div className="login-tabs">
            <button className={'login-tab ' + (activeTab === 'signup' ? 'active' : '')} onClick={() => setActiveTab('signup')} type="button">
              Create Account
            </button>
            <button className={'login-tab ' + (activeTab === 'lead' ? 'active' : '')} onClick={() => setActiveTab('lead')} type="button">
              Submit a Lead
            </button>
          </div>

          <div className="login-cards-row">
            <div className={'login-card ' + (activeTab === 'signup' ? 'active' : '')}>
              <div className="login-card-header">
                <h3 className="login-card-title">Create Account</h3>
                <p className="login-card-subtitle">Start your free trial today</p>
              </div>
              {(validationError || successMsg) && (
                <div className={successMsg ? 'login-success-box' : 'login-error-box'}>
                  {successMsg || validationError}
                </div>
              )}
              <form onSubmit={handleSignUp}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" disabled={submitting} className="input input-with-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">✉</span>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={submitting} className="input input-with-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" disabled={submitting} className="input input-with-icon" />
                    <button type="button" className="form-input-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" disabled={submitting} className="input input-with-icon" />
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="login-btn btn-signin">
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              <div className="login-card-footer">
                <p>Already have an account? <button type="button" className="login-link-btn" onClick={() => onSwitchView && onSwitchView('login')}>Sign In</button></p>
              </div>
            </div>

            <div className={'login-card lead-card ' + (activeTab === 'lead' ? 'active' : '')}>
              <div className="login-card-header">
                <h3 className="login-card-title">Get Started Today</h3>
                <p className="login-card-subtitle">Submit your info and we will contact you</p>
              </div>
              {leadSuccess && <div className="login-success-box">{leadSuccess}</div>}
              {leadError && <div className="login-error-box">{leadError}</div>}
              <form onSubmit={handleSubmitLead}>
                <div className="input-group">
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Full Name *" disabled={leadSubmitting} className="input input-with-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-wrapper">
                    <span className="input-icon">✉</span>
                    <input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="Email Address *" disabled={leadSubmitting} className="input input-with-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-wrapper">
                    <span className="input-icon">📞</span>
                    <input type="tel" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} placeholder="Phone Number *" disabled={leadSubmitting} className="input input-with-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-wrapper">
                    <span className="input-icon">🏢</span>
                    <input type="text" value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} placeholder="Company Name" disabled={leadSubmitting} className="input input-with-icon" />
                  </div>
                </div>
                <div className="input-group">
                  <div className="input-wrapper">
                    <span className="input-icon">📝</span>
                    <textarea value={leadNeeds} onChange={(e) => setLeadNeeds(e.target.value)} placeholder="Tell us about your needs..." disabled={leadSubmitting} className="input textarea" rows={2} />
                  </div>
                </div>
                <button type="submit" disabled={leadSubmitting} className="login-btn btn-submit-lead">
                  {leadSubmitting ? 'Submitting...' : 'Submit Lead'}
                </button>
              </form>
            </div>
          </div>

          <div className="login-footer">
            <p className="login-footer-security">Protected by enterprise-grade security. Your data is safe with us.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
