import { useEffect, useState } from 'react';
import { matchesApi } from '../api/matches';
import { skillsApi } from '../api/skills';
import Navbar from '../components/Navbar';
import SendSwapRequestModal from '../components/SendSwapRequestModal';
import Spinner from '../components/Spinner';

// This page finally gives the Day 5 Python matching service a real
// frontend. It was built and deployed all the way back then, but nothing
// in React ever called GET /api/matches until now.
export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modalData, setModalData] = useState(null); // { recipient, requestedSkill }
  const [resolvingFor, setResolvingFor] = useState(null); // candidate id currently looking up a skill

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await matchesApi.suggestions();
      setMatches(data);
    } catch (err) {
      setError('Could not load matches. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  // The Python service returns skill NAMES ("React", "Python"), not IDs —
  // it never needed IDs to do the scoring. But sending an actual swap
  // request needs a real skill_id. So we look it up only at the moment
  // someone actually wants to act on a match, rather than resolving every
  // name up front for matches they might never click on.
  async function handleRequestSwap(candidate) {
    const skillName = candidate.they_can_teach_you[0];
    if (!skillName) return;

    setResolvingFor(candidate.user_id);
    try {
      const results = await skillsApi.search(skillName);
      const exact = results.find((s) => s.name.toLowerCase() === skillName.toLowerCase()) || results[0];
      if (!exact) {
        setMessage(`Could not find "${skillName}" in the skills list.`);
        return;
      }
      setModalData({
        recipient: { id: candidate.user_id, name: candidate.name },
        requestedSkill: { id: exact.id, name: exact.name },
      });
    } finally {
      setResolvingFor(null);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Suggested Matches</h1>
        <p className="page-subtitle">
          Scored automatically based on what you offer and what you're seeking — a true mutual
          match (you can each teach the other something) scores highest.
        </p>

        {message && <div className="status-banner">{message}</div>}
        {error && <div className="error-banner">{error}</div>}
        {loading && <Spinner label="Loading matches..." />}

        {!loading && matches.length === 0 && (
          <p className="empty-hint">
            No matches yet — add more skills to your profile (both offering and seeking) to
            improve your chances of a match.
          </p>
        )}

        <div className="match-list">
          {matches.map((candidate) => (
            <div key={candidate.user_id} className="match-card">
              <div className="match-card-header">
                <span className="match-name">{candidate.name}</span>
                {candidate.mutual_match && <span className="badge-mutual">Mutual match</span>}
                <span className="match-score">Score: {candidate.score}</span>
              </div>

              {candidate.they_can_teach_you.length > 0 && (
                <p className="match-line">
                  <strong>They can teach you:</strong> {candidate.they_can_teach_you.join(', ')}
                </p>
              )}
              {candidate.you_can_teach_them.length > 0 && (
                <p className="match-line">
                  <strong>You can teach them:</strong> {candidate.you_can_teach_them.join(', ')}
                </p>
              )}

              {candidate.they_can_teach_you.length > 0 && (
                <button
                  onClick={() => handleRequestSwap(candidate)}
                  disabled={resolvingFor === candidate.user_id}
                >
                  {resolvingFor === candidate.user_id ? 'Loading...' : 'Send swap request'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalData && (
        <SendSwapRequestModal
          recipient={modalData.recipient}
          requestedSkill={modalData.requestedSkill}
          onClose={() => setModalData(null)}
          onSent={() => {
            setModalData(null);
            setMessage('Swap request sent! Check "Swap Requests" to track it.');
          }}
        />
      )}
    </div>
  );
}
