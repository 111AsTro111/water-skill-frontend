import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

const DISTRICTS = [
  'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
  'Meluri', 'Mokokchung', 'Mon', 'Niuland', 'Noklak',
  'Peren', 'Phek', 'Shamator', 'Tuensang', 'Tseminyu',
  'Wokha', 'Zunheboto',
];

// Inline styles for guaranteed visibility
const bannerStyles = {
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px 16px',
    borderRadius: '6px',
    borderLeft: '4px solid #28a745',
    marginBottom: '16px',
    fontWeight: '500',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '6px',
    borderLeft: '4px solid #dc3545',
    marginBottom: '16px',
    fontWeight: '500',
  },
};

export default function EditSupplierProfile() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient
      .get('/water-suppliers/me')
      .then((res) => {
        const s = res.data.supplier;
        setForm({
          business_name: s.business_name,
          phone: s.phone,
          service_area: s.service_area || '',
          district: s.district,
          rate_per_liter: s.rate_per_liter,
        });
      })
      .catch(() => setError('Could not load your supplier profile.'))
      .finally(() => setLoading(false));
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiClient.put('/water-suppliers/me', form);
      setSuccess('✅ Profile updated successfully!');
      // Optional: alert fallback – remove if you don't want popups
      // alert('Profile updated successfully!');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        'Could not update your profile.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Edit Supplier Profile</h1>
        <p>
          Changing your district affects which future orders get sent to you — it
          doesn't cancel any requests you already have pending.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : !form ? (
          <p>{error || 'Could not load your profile.'}</p>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: 420 }}>
            {error && <div style={bannerStyles.error}>{error}</div>}
            {success && <div style={bannerStyles.success}>{success}</div>}

            <label htmlFor="business_name">Business name</label>
            <input
              id="business_name"
              type="text"
              required
              value={form.business_name}
              onChange={(e) => updateField('business_name', e.target.value)}
            />

            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />

            <label htmlFor="district">District</label>
            <select
              id="district"
              required
              value={form.district}
              onChange={(e) => updateField('district', e.target.value)}
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label htmlFor="service_area">Service area details</label>
            <input
              id="service_area"
              type="text"
              value={form.service_area}
              onChange={(e) => updateField('service_area', e.target.value)}
            />

            <label htmlFor="rate_per_liter">Rate per liter (₹)</label>
            <input
              id="rate_per_liter"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.rate_per_liter}
              onChange={(e) => updateField('rate_per_liter', e.target.value)}
            />

            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        <BackButton />
      </div>
    </div>
  );
}