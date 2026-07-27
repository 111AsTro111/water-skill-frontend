import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or missing reset token.');
    }
  }, [token, email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await apiClient.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Set New Password</h1>

        {message && <div className="status-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}

        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <label htmlFor="password_confirmation">Confirm Password</label>
        <input
          id="password_confirmation"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          required
          minLength={8}
        />

        <button type="submit" disabled={submitting || !!error}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}