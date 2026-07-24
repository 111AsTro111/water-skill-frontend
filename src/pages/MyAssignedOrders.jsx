import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

const STATUS_LABELS = {
  assigned: 'Assigned',
  en_route: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const NEXT_STATUS = {
  assigned: 'en_route',
  en_route: 'delivered',
};

export default function MyAssignedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState('');

  // Keep a ref to the previous orders to detect changes
  const previousOrdersRef = useRef([]);

  function loadOrders() {
    setLoading(true);
    apiClient
      .get('/water-orders/assigned')
      .then((res) => {
        const newOrders = res.data.orders;
        // Compare with previous orders to detect cancellations
        const prevOrders = previousOrdersRef.current;

        // Find orders that existed before but are now cancelled or missing
        // We assume if an order is cancelled, it will still appear with status 'cancelled'
        // If the backend filters out cancelled orders, we need to detect missing ones.
        // Both cases are handled:
        // 1. If order is in the new list and status changed to cancelled -> notify
        // 2. If an order that was present before is now missing -> assume cancelled

        // Case 1: status changed to cancelled
        newOrders.forEach((newOrder) => {
          const prevOrder = prevOrders.find(o => o.id === newOrder.id);
          if (prevOrder && prevOrder.status !== 'cancelled' && newOrder.status === 'cancelled') {
            setNotification(`⚠️ Order #${newOrder.id} was cancelled by the customer.`);
          }
        });

        // Case 2: order missing from new list (if backend hides cancelled orders)
        prevOrders.forEach((prevOrder) => {
          if (prevOrder.status !== 'cancelled' && prevOrder.status !== 'delivered') {
            const stillExists = newOrders.some(o => o.id === prevOrder.id);
            if (!stillExists) {
              setNotification(`⚠️ Order #${prevOrder.id} was cancelled by the customer.`);
            }
          }
        });

        // Update the ref
        previousOrdersRef.current = newOrders;
        setOrders(newOrders);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load your assigned orders.');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadOrders();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  async function advanceStatus(order) {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    setUpdatingId(order.id);
    setError('');
    setNotification('');
    try {
      await apiClient.post(`/water-orders/${order.id}/status`, { status: nextStatus });
      loadOrders(); // immediate refresh after update
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update this order.');
    } finally {
      setUpdatingId(null);
    }
  }

  // Filter out cancelled orders for display (you can keep them if you want)
  const activeOrders = orders.filter(o => o.status !== 'cancelled');

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>My Assigned Orders</h1>
        <p>Deliveries you've accepted and are fulfilling.</p>

        {notification && <div className="info-banner" style={{ backgroundColor: '#fff3cd', color: '#856404', borderLeftColor: '#ffc107' }}>{notification}</div>}
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : activeOrders.length === 0 ? (
          <p>No assigned orders yet. Check Pending Requests for new ones to accept.</p>
        ) : (
          <div className="dashboard-cards">
            {activeOrders.map((order) => (
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