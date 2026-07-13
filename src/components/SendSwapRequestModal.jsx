import { useEffect, useState } from 'react';
import { skillsApi } from '../api/skills';
import { swapRequestsApi } from '../api/swapRequests';

// A simple modal (no library needed — just a fixed-position overlay div)
// for sending a swap request to a specific person. It needs to know which
// of YOUR skills you're offering in exchange, so it loads your own skill
// list the moment it opens.
export default function SendSwapRequestModal({ recipient, requestedSkill, onClose, onSent }) {
  const [myOfferingSkills, setMyOfferingSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    skillsApi.myList().then((skills) => {
      const offering = skills.filter((s) => s.pivot.type === 'offering');
      setMyOfferingSkills(offering);
      if (offering.length > 0) setSelectedSkillId(offering[0].id);
    });
  }, []);

  async function handleSend() {
    setError('');
    if (!selectedSkillId) {
      setError('Add a skill you can teach to your profile first.');
      return;
    }
    setSubmitting(true);
    try {
      await swapRequestsApi.send(recipient.id, selectedSkillId, requestedSkill.id);
      onSent();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send the request. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Send swap request to {recipient.name}</h2>
        <p>
          You're asking to learn <strong>{requestedSkill.name}</strong> from them. What will you
          teach in exchange?
        </p>

        {error && <div className="error-banner">{error}</div>}

        {myOfferingSkills.length === 0 ? (
          <p className="empty-hint">
            You haven't listed anything you can teach yet — add one from "My Skills" first.
          </p>
        ) : (
          <select value={selectedSkillId} onChange={(e) => setSelectedSkillId(e.target.value)}>
            {myOfferingSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        )}

        <div className="modal-actions">
          <button onClick={onClose} className="secondary">
            Cancel
          </button>
          <button onClick={handleSend} disabled={submitting || myOfferingSkills.length === 0}>
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
