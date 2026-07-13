import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { skillsApi } from '../api/skills';
import Navbar from '../components/Navbar';
import SendSwapRequestModal from '../components/SendSwapRequestModal';

export default function SkillDetail() {
  const { skillId } = useParams();
  const [offering, setOffering] = useState(null);
  const [seeking, setSeeking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalTarget, setModalTarget] = useState(null); // the user we're requesting a swap with
  const [sentMessage, setSentMessage] = useState('');

  useEffect(() => {
    load();
  }, [skillId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [offeringData, seekingData] = await Promise.all([
        skillsApi.usersOffering(skillId),
        skillsApi.usersSeeking(skillId),
      ]);
      setOffering(offeringData);
      setSeeking(seekingData);
    } catch (err) {
      setError('Could not load this skill. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSent() {
    setModalTarget(null);
    setSentMessage('Swap request sent! Check "Swap Requests" to track it.');
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <Link to="/skills">&larr; Back to all skills</Link>

        {loading && <p>Loading...</p>}
        {error && <div className="error-banner">{error}</div>}
        {sentMessage && <div className="status-banner">{sentMessage}</div>}

        {!loading && offering && (
          <>
            <h1>{offering.skill_name}</h1>

            <section>
              <h2>People offering to teach this ({offering.count})</h2>
              {offering.users.length === 0 && <p className="empty-hint">Nobody's teaching this yet.</p>}
              <div className="skill-list">
                {offering.users.map((person) => (
                  <div key={person.id} className="skill-row">
                    <div className="skill-row-main">
                      <span className="skill-name">{person.name}</span>
                      {person.bio && <span className="person-bio">{person.bio}</span>}
                    </div>
                    <button onClick={() => setModalTarget(person)}>Request swap</button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>People wanting to learn this ({seeking.count})</h2>
              {seeking.users.length === 0 && <p className="empty-hint">Nobody's seeking this yet.</p>}
              <div className="skill-list">
                {seeking.users.map((person) => (
                  <div key={person.id} className="skill-row">
                    <span className="skill-name">{person.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {modalTarget && (
        <SendSwapRequestModal
          recipient={modalTarget}
          requestedSkill={{ id: skillId, name: offering.skill_name }}
          onClose={() => setModalTarget(null)}
          onSent={handleSent}
        />
      )}
    </div>
  );
}
