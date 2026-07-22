import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { waterOrdersApi } from '../api/water';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';

const QUANTITY_OPTIONS = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

const DISTRICTS = [
  'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng',
  'Meluri', 'Mokokchung', 'Mon', 'Niuland', 'Noklak',
  'Peren', 'Phek', 'Shamator', 'Tuensang', 'Tseminyu',
  'Wokha', 'Zunheboto',
];

export default function PlaceOrder() {
  const navigate = useNavigate();
  const location = useLocation();
  const preferred = location.state || {};

  const [form, setForm] = useState({
    address_text: '',
    district: preferred.preferredDistrict || '',
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

  // Informational only — this is NOT a "pick your supplier" selector.
  // Dispatch still auto-broadcasts to the top 5 on submit; this just shows
  // the buyer who's actually out there before they commit to an order, so
  // "no verified suppliers in your district yet" isn't a surprise after
  // the fact.
  const [districtSuppliers, setDistrictSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    if (!form.district) {
      setDistrictSuppliers([]);
      return;
    }
    setLoadingSuppliers(true);
    apiClient
      .get('/water-suppliers', { params: { district: form.district } })
      .then((res) => setDistrictSuppliers(res.data.suppliers))
      .catch(() => setDistrictSuppliers([]))
      .finally(() => setLoadingSuppliers(false));
  }, [form.district]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {}
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = { ...form, ...coords };
      if (preferred.preferredSupplierId) {
        payload.supplier_id = preferred.preferredSupplierId;
      }
      const result = await waterOrdersApi.place(payload);
      navigate('/water/my-orders', { state: { justPlacedId: result.order.id } });
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

        {preferred.preferredSupplierName && (
          <div className="info-banner">
            Ordering directly from <strong>{preferred.preferredSupplierName}</strong>. This
            request goes only to them, not the usual pool of nearby suppliers.
          </div>
        )}

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

          <label>District</label>
          <select
            required
            disabled={!!preferred.preferredSupplierId}
            value={form.district}
            onChange={(e) => updateField('district', e.target.value)}
          >
            <option value="" disabled>
              Select your district
            </option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {form.district && !preferred.preferredSupplierId && (
            <div className="district-suppliers-preview">
              {loadingSuppliers ? (
                <p className="field-hint">Checking suppliers in {form.district}...</p>
              ) : districtSuppliers.length === 0 ? (
                <p className="field-hint">
                  No verified suppliers in {form.district} yet — you can still place the
                  order, but it may take longer to be accepted.
                </p>
              ) : (
                <div className="field-hint">
                  <p>{districtSuppliers.length} verified supplier(s) in {form.district}:</p>
                  <ul>
                    {districtSuppliers.map((s) => (
                      <li key={s.id}>
                        {s.business_name} — ₹{s.rate_per_liter}/L
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

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
            {QUANTITY_OPTIONS.map((size) => (
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

        <BackButton />
      </div>
    </div>
  );
}
