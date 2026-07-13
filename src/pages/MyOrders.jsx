import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { waterOrdersApi } from '../api/water';
import Navbar from '../components/Navbar';
import PayButton from '../components/PayButton';

const STATUS_LABELS = {
  placed: 'Order placed',
  assigned: 'Supplier assigned',
  en_route: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function MyOrders() {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (location.state?.justPlacedId) {
      setMessage('Order placed! You can track its status below.');
    }
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await waterOrdersApi.myOrders();
      setOrders(data);
    } catch (err) {
      setError('Could not load your orders. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    try {
      await waterOrdersApi.cancel(id);
      setMessage('Order cancelled.');
      load();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Could not cancel this order.');
    }
  }

  function hasSuccessfulPayment(order) {
    return order.payments?.some((p) => p.status === 'success');
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header-row">
          <h1>My Orders</h1>
          <Link to="/order-water">
            <button>+ New order</button>
          </Link>
        </div>

        {message && <div className="status-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}
        {loading && <p>Loading...</p>}
        {!loading && orders.length === 0 && (
          <p className="empty-hint">No orders yet — place your first one above.</p>
        )}

        <div className="order-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span className={`status-badge status-${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
                <span className="order-id">Order #{order.id}</span>
              </div>

              {/* Simple visual progress tracker matching the lifecycle
                  diagram from Day 6: placed -> assigned -> en_route -> delivered */}
              <div className="order-progress">
                {['placed', 'assigned', 'en_route', 'delivered'].map((step, i) => {
                  const stepIndex = ['placed', 'assigned', 'en_route', 'delivered'].indexOf(order.status);
                  const isDone = order.status !== 'cancelled' && i <= stepIndex;
                  return (
                    <div key={step} className={`progress-step ${isDone ? 'done' : ''}`}>
                      <span className="progress-dot" />
                      <span className="progress-label">{STATUS_LABELS[step]}</span>
                    </div>
                  );
                })}
              </div>

              <p className="order-details">
                {order.quantity_liters.toLocaleString()}L ({order.water_type}) to{' '}
                {order.address_text} — {order.requested_date} at {order.requested_time_window}
              </p>
              <p className="order-price">₹{order.price_estimate}</p>

              {order.supplier && (
                <p className="order-supplier">
                  Supplier: {order.supplier.business_name} ({order.supplier.phone})
                </p>
              )}

              <div className="order-actions">
                {order.status === 'placed' && (
                  <button onClick={() => handleCancel(order.id)} className="secondary">
                    Cancel order
                  </button>
                )}

                {order.payment_method === 'online' && !hasSuccessfulPayment(order) && (
                  <PayButton order={order} onPaid={load} />
                )}

                {order.payment_method === 'online' && hasSuccessfulPayment(order) && (
                  <span className="status-badge status-completed">Paid</span>
                )}

                {order.payment_method === 'cod' && (
                  <span className="empty-hint">Cash on delivery</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
