import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BackButton from '../components/BackButton';
import apiClient from '../api/client';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [tankers, setTankers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  // Tracks which tanker is selected per request-row, since a supplier with
  // multiple tankers needs to pick one before accepting.
  const [selectedTanker, setSelectedTanker] = useState({});

  function loadAll(isInitial = false) {
    if (isInitial) setLoading(true);
    Promise.all([
      apiClient.get('/order-supplier-requests/pending'),
      apiClient.get('/tankers/my'),
    ])
      .then(([reqRes, tankerRes]) => {
        setRequests(reqRes.data.requests);
        setTankers(tankerRes.data.tankers.filter((t) => t.is_available));
      })
      .catch(() => setError('Could not load pending requests.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll(true);
    const interval = setInterval(() => loadAll(false), 8000);
    return () => clearInterval(interval);
  }, []);

  async function handleAccept(request) {
    const tankerId = selectedTanker[request.id];
    if (!tankerId) {
      setError('Select a tanker before accepting.');
      return;
    }

    setActioningId(request.id);
    setError('');
    try {
      await apiClient.post(`/order-supplier-requests/${request.id}/accept`, {
        tanker_id: tankerId,
      });
      loadAll();
    } catch (err) {
      // 409 specifically means another supplier won the race first — this
      // is a normal outcome of the dispatch model, not a bug, so it gets
      // its own clear message rather than a generic error.
      const message =
        err.response?.status === 409
          ? "This order was just accepted by another supplier."
          : err.response?.data?.error || 'Could not accept this request.';
      setError(message);
      loadAll();
    } finally {
      setActioningId(null);
    }
  }

  async function handleDecline(request) {
    setActioningId(request.id);
    setError('');
    try {
      await apiClient.post(`/order-supplier-requests/${request.id}/decline`);
      loadAll();
    } catch {
      setError('Could not decline this request.');
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Pending Requests</h1>
        <p>Orders waiting for you to accept or decline.</p>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <p>No pending requests right now.</p>
        ) : tankers.length === 0 ? (
          <p>
            You have no available tankers — add one or mark one available on the{' '}
            <a href="/water/my-tankers">My Tankers</a> page before you can accept requests.
          </p>
        ) : (
          <div className="dashboard-cards">
            {requests.map((request) => {
              const order = request.waterOrder;
              return (
                <div key={request.id} className="dashboard-card">
                  <h3>Order #{order?.id}</h3>
                  <p>
                    {order?.quantity_liters?.toLocaleString()}L ({order?.water_type}) —{' '}
                    {order?.address_text}
                  </p>
                  <p>
                    {order?.requested_date} at {order?.requested_time_window}
                  </p>
                  <p className="order-price">₹{order?.price_estimate}</p>

                  <select
                    value={selectedTanker[request.id] || ''}
                    onChange={(e) =>
                      setSelectedTanker({ ...selectedTanker, [request.id]: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Select a tanker
                    </option>
                    {tankers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.plate_number} ({t.capacity_liters.toLocaleString()}L)
                      </option>
                    ))}
                  </select>

                  <div className="order-actions">
                    <button
                      onClick={() => handleAccept(request)}
                      disabled={actioningId === request.id}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(request)}
                      disabled={actioningId === request.id}
                      className="secondary"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <BackButton />
      </div>
    </div>
  );
}
