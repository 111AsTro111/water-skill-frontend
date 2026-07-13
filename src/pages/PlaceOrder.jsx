import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { waterOrdersApi } from '../api/water';
import Navbar from '../components/Navbar';

const TANKER_SIZES = [1000, 2000, 5000]; // matches typical tanker capacities from Day 6

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    address_text: '',
    landmark_notes: '',
    quantity_liters: 1000,
    water_type: 'general',
    requested_date: '',
    requested_time_window: '',
    phone: '',
    payment_method: 'cod',
  });
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function useMyLocation() {
    // Browser geolocation — optional, since the text address is the
    // reliable fallback in areas where GPS pins can be unreliable
    // (worth remembering given the connectivity notes from Day 9).
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Silently ignore denial/failure — address_text alone is enough to
        // place an order, coordinates are a nice-to-have, not a requirement.
      }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = { ...form, ...coords };
      const result = await waterOrdersApi.place(payload);
      navigate('/my-orders', { state: { justPlacedId: result.order.id } });
    } catch (err) {
      const message =
        err.response?.data?.error ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        'Could not place the order. Check your connection and try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Order Water</h1>

        <form onSubmit={handleSubmit} className="order-form">
          {error && <div className="error-banner">{error}</div>}

          <label>Delivery address</label>
          <input
            type="text"
            required
            placeholder="Street / locality"
            value={form.address_text}
            onChange={(e) => updateField('address_text', e.target.value)}
          />

          <button type="button" onClick={useMyLocation} className="secondary small">
            {coords ? '📍 Location captured' : 'Use my current location'}
          </button>

          <label>Landmark / access notes (optional)</label>
          <input
            type="text"
            placeholder="e.g. Blue gate, narrow lane"
            value={form.landmark_notes}
            onChange={(e) => updateField('landmark_notes', e.target.value)}
          />

          <label>Quantity</label>
          <select
            value={form.quantity_liters}
            onChange={(e) => updateField('quantity_liters', Number(e.target.value))}
          >
            {TANKER_SIZES.map((size) => (
              <option key={size} value={size}>
                {size.toLocaleString()} liters
              </option>
            ))}
          </select>

          <label>Water type</label>
          <select value={form.water_type} onChange={(e) => updateField('water_type', e.target.value)}>
            <option value="general">General use</option>
            <option value="drinking">Drinking water</option>
          </select>

          <label>Preferred date</label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={form.requested_date}
            onChange={(e) => updateField('requested_date', e.target.value)}
          />

          <label>Preferred time window</label>
          <input
            type="text"
            required
            placeholder="e.g. 10:00-13:00"
            value={form.requested_time_window}
            onChange={(e) => updateField('requested_time_window', e.target.value)}
          />

          <label>Contact phone</label>
          <input
            type="tel"
            required
            placeholder="For the driver to reach you"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />

          <label>Payment method</label>
          <select
            value={form.payment_method}
            onChange={(e) => updateField('payment_method', e.target.value)}
          >
            <option value="cod">Cash on delivery</option>
            <option value="online">Pay online now</option>
          </select>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
