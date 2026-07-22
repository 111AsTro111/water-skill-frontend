import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

const STATUS_LABELS = {
  assigned: 'Assigned',
  en_route: 'On the way',
  delivered: 'Delivered',
};

// Mirrors the same allowed transitions the backend enforces in
// WaterOrderController::updateStatus() — assigned -> en_route -> delivered,
// one step at a time. Kept here just to decide which single button to show
// next; the backend is still the real source of truth and will reject
// anything out of order regardless of what this renders.
const NEXT_STATUS = {
  assigned: 'en_route',
  en_route: 'delivered',
};

export default function MyAssignedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  function loadOrders() {
    setLoading(true);
    apiClient
      .get('/water-orders/assigned')
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError('Could not load your assigned orders.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function advanceStatus(order) {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    setUpdatingId(order.id);
    setError('');
    try {
      await apiClient.post(`/water-orders/${order.id}/status`, { status: nextStatus });
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update this order.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>My Assigned Orders</h1>
        <p>Deliveries you've accepted and are fulfilling.</p>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No assigned orders yet. Check Pending Requests for new ones to accept.</p>
        ) : (
          <div className="dashboard-cards">
            {orders.map((order) => (
              <div key={order.id} className="dashboard-card">
                <h3>Order #{order.id}</h3>
                <p>
                  {order.quantity_liters?.toLocaleString()}L ({order.water_type}) —{' '}
                  {order.address_text}
                </p>
                <p>
                  {order.requested_date} at {order.requested_time_window}
                </p>
                <p>Customer phone: {order.phone}</p>
                <p className="order-price">₹{order.price_estimate}</p>

                <span className={`status-badge ${order.status === 'delivered' ? 'status-completed' : ''}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>

                {NEXT_STATUS[order.status] && (
                  <button onClick={() => advanceStatus(order)} disabled={updatingId === order.id}>
                    Mark as {STATUS_LABELS[NEXT_STATUS[order.status]]}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <BackButton />
      </div>
    </div>
  );
}
