import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

const PLATE_REGEX = /^NL[ -]?\d{2}[ -]?[A-Z]{1,2}[ -]?\d{4}$/i;

export default function MyTankers() {
  const [tankers, setTankers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ capacity_liters: '', plate_number: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function loadTankers() {
    setLoading(true);
    apiClient
      .get('/tankers/my')
      .then((res) => setTankers(res.data.tankers))
      .catch(() => setError('Could not load your tankers.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTankers();
  }, []);

  async function handleAddTanker(e) {
    e.preventDefault();
    setFormError('');

    // Client-side check first, purely for a faster error message — the
    // backend re-validates the exact same pattern regardless, so this is
    // a nicety, not the actual security boundary.
    if (!PLATE_REGEX.test(form.plate_number.trim())) {
      setFormError('Enter a valid Nagaland plate number, e.g. NL-02-AB-1234');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/tankers', {
        capacity_liters: Number(form.capacity_liters),
        plate_number: form.plate_number.trim().toUpperCase(),
      });
      setForm({ capacity_liters: '', plate_number: '' });
      loadTankers();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        'Could not add tanker. Please check the details and try again.';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAvailability(tanker) {
    try {
      await apiClient.put(`/tankers/${tanker.id}`, {
        is_available: !tanker.is_available,
      });
      loadTankers();
    } catch {
      setError('Could not update that tanker.');
    }
  }

  async function removeTanker(tanker) {
    if (!confirm(`Remove tanker ${tanker.plate_number}?`)) return;
    try {
      await apiClient.delete(`/tankers/${tanker.id}`);
      loadTankers();
    } catch {
      setError('Could not remove that tanker.');
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>My Tankers</h1>
        <p>Manage your fleet's availability.</p>

        <form onSubmit={handleAddTanker} className="auth-form" style={{ maxWidth: 400, marginBottom: '2rem' }}>
          {formError && <div className="error-banner">{formError}</div>}

          <label htmlFor="capacity_liters">Capacity (liters)</label>
          <input
            id="capacity_liters"
            type="number"
            min="100"
            required
            value={form.capacity_liters}
            onChange={(e) => setForm({ ...form, capacity_liters: e.target.value })}
          />

          <label htmlFor="plate_number">Plate number</label>
          <input
            id="plate_number"
            type="text"
            placeholder="NL-02-AB-1234"
            required
            value={form.plate_number}
            onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Tanker'}
          </button>
        </form>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading tankers...</p>
        ) : tankers.length === 0 ? (
          <p>No tankers added yet.</p>
        ) : (
          <div className="dashboard-cards">
            {tankers.map((tanker) => (
              <div key={tanker.id} className="dashboard-card">
                <h3>{tanker.plate_number}</h3>
                <p>{tanker.capacity_liters.toLocaleString()}L capacity</p>
                <p>
                  <span className={`status-badge ${tanker.is_available ? 'status-completed' : ''}`}>
                    {tanker.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </p>
                <button onClick={() => toggleAvailability(tanker)} className="secondary">
                  Mark {tanker.is_available ? 'Unavailable' : 'Available'}
                </button>
                <button onClick={() => removeTanker(tanker)} className="secondary">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <BackButton />
      </div>
    </div>
  );
}
