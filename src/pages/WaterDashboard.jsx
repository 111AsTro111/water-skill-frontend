import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import apiClient from '../api/client';

export default function WaterDashboard() {
  const { user } = useAuth();

  // null = still checking, false = confirmed not a supplier,
  // object = supplier profile (may or may not be verified yet)
  const [supplier, setSupplier] = useState(null);
  const [checked, setChecked] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get('/water-suppliers/me')
      .then((res) => {
        if (!cancelled) setSupplier(res.data.supplier);
      })
      .catch((err) => {
        // 404 here just means "not registered as a supplier yet" — a
        // completely normal state for a buyer-only account, not an error.
        if (!cancelled && err.response?.status === 404) setSupplier(false);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Only fetch the pending count once we know this is a verified supplier
  // — no point checking for a buyer-only account. Also refreshes every 15s
  // so the number stays roughly current even if they just sit on this
  // page instead of clicking into Pending Requests directly.
  useEffect(() => {
    if (!supplier || !supplier.is_verified) return;
    let cancelled = false;

    function fetchCount() {
      apiClient
        .get('/order-supplier-requests/pending')
        .then((res) => {
          if (!cancelled) setPendingCount(res.data.requests.length);
        })
        .catch(() => {});
    }

    fetchCount();
    const interval = setInterval(fetchCount, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [supplier]);

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Welcome, {user?.name}</h1>
        <p>Here's what you can do today:</p>

        <div className="dashboard-cards">
          <Link to="/water/order-water" className="dashboard-card">
            <h3>Order Water</h3>
            <p>Book a tanker delivery to your address.</p>
          </Link>
          <Link to="/water/my-orders" className="dashboard-card">
            <h3>My Orders</h3>
            <p>Track deliveries and payment status.</p>
          </Link>

          {/* Only shown once we've actually checked — avoids a flash of
              the wrong card while the request is still in flight. */}
          {checked && supplier === false && (
            <Link to="/water/become-supplier" className="dashboard-card">
              <h3>Become a Supplier</h3>
              <p>Register your tanker business and start receiving orders.</p>
            </Link>
          )}

          {checked && supplier && !supplier.is_verified && (
            <div className="dashboard-card dashboard-card-pending">
              <h3>Supplier Application Pending</h3>
              <p>Your supplier registration is awaiting admin verification.</p>
            </div>
          )}

          {checked && supplier && supplier.is_verified && (
            <>
              <Link to="/water/pending-requests" className="dashboard-card">
                <h3>
                  Pending Requests
                  {pendingCount > 0 && <span className="badge-count"> ({pendingCount})</span>}
                </h3>
                <p>Orders waiting for you to accept or decline.</p>
              </Link>
              <Link to="/water/assigned-orders" className="dashboard-card">
                <h3>My Assigned Orders</h3>
                <p>Deliveries you've accepted and are fulfilling.</p>
              </Link>
              <Link to="/water/my-tankers" className="dashboard-card">
                <h3>My Tankers</h3>
                <p>Manage your fleet's availability.</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
