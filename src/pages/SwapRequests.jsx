import { useEffect, useState } from 'react';
import { swapRequestsApi } from '../api/swapRequests';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import RatingModal from '../components/RatingModal';

export default function SwapRequests() {
  const { user } = useAuth();
  const [tab, setTab] = useState('received'); // 'received' or 'sent'
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [ratingTarget, setRatingTarget] = useState(null); // swap request being rated

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [receivedData, sentData] = await Promise.all([
        swapRequestsApi.received(),
        swapRequestsApi.sent(),
      ]);
      setReceived(receivedData);
      setSent(sentData);
    } catch (err) {
      setError('Could not load swap requests. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action, id) {
    setActionMessage('');
    try {
      await action(id);
      await load(); // refresh both lists so status changes reflect everywhere
      setActionMessage('Updated.');
    } catch (err) {
      setActionMessage(err.response?.data?.error || 'Action failed. Try again.');
    }
  }

  function statusBadgeClass(status) {
    return `status-badge status-${status}`;
  }

  const list = tab === 'received' ? received : sent;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Swap Requests</h1>

        <div className="tabs">
          <button
            className={tab === 'received' ? 'tab active' : 'tab'}
            onClick={() => setTab('received')}
          >
            Received ({received.length})
          </button>
          <button className={tab === 'sent' ? 'tab active' : 'tab'} onClick={() => setTab('sent')}>
            Sent ({sent.length})
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {actionMessage && <div className="status-banner">{actionMessage}</div>}
        {loading && <p>Loading...</p>}

        {!loading && list.length === 0 && (
          <p className="empty-hint">
            {tab === 'received' ? "No one's sent you a request yet." : "You haven't sent any requests yet."}
          </p>
        )}

        <div className="swap-request-list">
          {list.map((swap) => {
            const otherPerson = tab === 'received' ? swap.requester : swap.recipient;
            return (
              <div key={swap.id} className="swap-request-card">
                <div className="swap-request-header">
                  <span className={statusBadgeClass(swap.status)}>{swap.status}</span>
                  <span className="swap-request-person">{otherPerson.name}</span>
                </div>

                <p>
                  {tab === 'received' ? (
                    <>
                      They offer <strong>{swap.offered_skill.name}</strong> in exchange for your{' '}
                      <strong>{swap.requested_skill.name}</strong>
                    </>
                  ) : (
                    <>
                      You offered <strong>{swap.offered_skill.name}</strong> for their{' '}
                      <strong>{swap.requested_skill.name}</strong>
                    </>
                  )}
                </p>

                <div className="swap-request-actions">
                  {(swap.status === 'accepted' || swap.status === 'completed') && (
                    <div className="contact-info">
                      <span className="contact-label">Contact {otherPerson.name}:</span>
                      <a href={`tel:${otherPerson.phone}`} className="contact-link">
                        📞 {otherPerson.phone || 'No phone on file'}
                      </a>
                      <a href={`mailto:${otherPerson.email}`} className="contact-link">
                        ✉️ {otherPerson.email}
                      </a>
                    </div>
                  )}

                  {tab === 'received' && swap.status === 'pending' && (
                    <>
                      <button onClick={() => handleAction(swapRequestsApi.accept, swap.id)}>
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(swapRequestsApi.decline, swap.id)}
                        className="secondary"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {tab === 'sent' && swap.status === 'pending' && (
                    <button
                      onClick={() => handleAction(swapRequestsApi.cancel, swap.id)}
                      className="secondary"
                    >
                      Cancel
                    </button>
                  )}

                  {swap.status === 'accepted' && (
                    <button onClick={() => handleAction(swapRequestsApi.complete, swap.id)}>
                      Mark as completed
                    </button>
                  )}

                  {swap.status === 'completed' && (
                    <button onClick={() => setRatingTarget({ swap, otherPerson })}>
                      Leave a rating
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ratingTarget && (
        <RatingModal
          swapRequest={ratingTarget.swap}
          otherPersonName={ratingTarget.otherPerson.name}
          onClose={() => setRatingTarget(null)}
          onSubmitted={() => {
            setRatingTarget(null);
            setActionMessage('Rating submitted — thank you!');
          }}
        />
      )}
    </div>
  );
}
