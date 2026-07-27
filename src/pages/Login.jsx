import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SECTION_STORAGE_KEY } from './ChooseSection';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);

      const remembered = localStorage.getItem(SECTION_STORAGE_KEY);
      if (remembered === 'skillmesh') {
        navigate('/skillmesh/dashboard');
      } else if (remembered === 'water') {
        navigate('/water/dashboard');
      } else {
        navigate('/choose');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Something went wrong. Please check your connection and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Log in to SkillMesh</h1>

        {error && <div className="error-banner">{error}</div>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log in'}
        </button>

        {/* ✅ Forgot Password link */}
        <p className="auth-forgot">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}