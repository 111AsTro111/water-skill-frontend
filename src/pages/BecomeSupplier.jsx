import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

const DISTRICTS = [
  'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
  'Meluri', 'Mokokchung', 'Mon', 'Niuland', 'Noklak',
  'Peren', 'Phek', 'Shamator', 'Tuensang', 'Tseminyu',
  'Wokha', 'Zunheboto',
];

export default function BecomeSupplier() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    business_name: '',
    phone: '',
    district: '',
    service_area: '',
    rate_per_liter: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await apiClient.post('/water-suppliers', form);
      navigate('/water/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        'Something went wrong. Please check your details and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Become a Supplier</h1>
        <p>Register your tanker business to start receiving delivery requests.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-banner">{error}</div>}

          <label htmlFor="business_name">Business name</label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            value={form.business_name}
            onChange={handleChange}
            required
            maxLength={255}
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            maxLength={20}
          />

          <label htmlFor="district">District</label>
          <select id="district" name="district" value={form.district} onChange={handleChange} required>
            <option value="" disabled>
              Select your district
            </option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <label htmlFor="service_area">
            Service area details <span className="field-optional">(optional)</span>
          </label>
          <input
            id="service_area"
            name="service_area"
            type="text"
            value={form.service_area}
            onChange={handleChange}
            placeholder="e.g. North side, near the market"
            maxLength={255}
          />

          <label htmlFor="rate_per_liter">Rate per liter (₹)</label>
          <p className="field-hint">A common local rate is around ₹0.70/liter (₹700 per 1,000L).</p>
          <input
            id="rate_per_liter"
            name="rate_per_liter"
            type="number"
            step="0.01"
            min="0.01"
            value={form.rate_per_liter}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for verification'}
          </button>
        </form>

        <BackButton />
      </div>
    </div>
  );
}
