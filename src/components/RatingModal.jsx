import { useState } from 'react';
import { ratingsApi } from '../api/swapRequests';

export default function RatingModal({ swapRequest, otherPersonName, onClose, onSubmitted }) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      await ratingsApi.submit(swapRequest.id, score, comment);
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit rating.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Rate your swap with {otherPersonName}</h2>

        {error && <div className="error-banner">{error}</div>}

        <label>Score</label>
        <select value={score} onChange={(e) => setScore(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'star' : 'stars'}
            </option>
          ))}
        </select>

        <label>Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did it go?"
          rows={3}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="secondary">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
}
