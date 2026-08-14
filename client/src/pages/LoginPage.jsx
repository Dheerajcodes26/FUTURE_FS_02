import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setError(null);

    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      return;
    }
    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (!result.success) {
      // Error handled by AuthContext state
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            CRM
          </div>
          <h2 className="login-title">
            Admin Portal
          </h2>
          <p className="login-subtitle">
            Sign in to manage client leads and pipeline
          </p>
        </div>

        {(validationError || error) && (
          <div className="login-error-box">
            {validationError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@crm.com"
              disabled={submitting}
              className="form-input"
            />
          </div>

          <div className="form-group-last">
            <label className="form-label">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={submitting}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="login-btn"
            style={{
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Default Demo: <span style={{ color: '#94a3b8' }}>admin@crm.com</span> / <span style={{ color: '#94a3b8' }}>admin123</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
