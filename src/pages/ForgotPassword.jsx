import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await apiClient.post('/forgot-password', { email });
      setMessage(response.data.message || 'Reset link sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Reset Password</h1>
        <p>Enter your email address and we'll send you a link to reset your password.</p>

        {message && <div className="status-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}