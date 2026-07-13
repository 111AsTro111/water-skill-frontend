import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { skillsApi } from '../api/skills';
import Navbar from '../components/Navbar';

export default function MySkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await skillsApi.myList();
      setSkills(data);
    } catch (err) {
      setError('Could not load your skills. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(skillId) {
    try {
      await skillsApi.remove(skillId);
      // Update local state instead of re-fetching everything — feels
      // instant to the user instead of waiting on a second network call.
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    } catch (err) {
      setError('Could not remove that skill. Try again.');
    }
  }

  const offering = skills.filter((s) => s.pivot.type === 'offering');
  const seeking = skills.filter((s) => s.pivot.type === 'seeking');

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="page-header-row">
          <h1>My Skills</h1>
          <Link to="/skills">
            <button>+ Add a skill</button>
          </Link>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {loading && <p>Loading...</p>}

        {!loading && (
          <>
            <section>
              <h2>I can teach</h2>
              {offering.length === 0 && <p className="empty-hint">You haven't listed anything you can teach yet.</p>}
              <div className="skill-list">
                {offering.map((skill) => (
                  <div key={skill.id} className="skill-row">
                    <div className="skill-row-main">
                      <span className="skill-name">{skill.name}</span>
                      <span className="proficiency-tag">{skill.pivot.proficiency_level || 'unspecified'}</span>
                    </div>
                    <button onClick={() => handleRemove(skill.id)} className="secondary">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2>I want to learn</h2>
              {seeking.length === 0 && <p className="empty-hint">You haven't listed anything you want to learn yet.</p>}
              <div className="skill-list">
                {seeking.map((skill) => (
                  <div key={skill.id} className="skill-row">
                    <div className="skill-row-main">
                      <span className="skill-name">{skill.name}</span>
                      <span className="proficiency-tag">{skill.pivot.proficiency_level || 'unspecified'}</span>
                    </div>
                    <button onClick={() => handleRemove(skill.id)} className="secondary">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
