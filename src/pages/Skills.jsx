import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { skillsApi } from '../api/skills';
import Navbar from '../components/Navbar';

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingSkillId, setAddingSkillId] = useState(null); // which row has the add-form open
  const [type, setType] = useState('offering');
  const [proficiency, setProficiency] = useState('beginner');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  async function loadSkills() {
    setLoading(true);
    setError('');
    try {
      const data = await skillsApi.list();
      setSkills(data);
    } catch (err) {
      setError('Could not load skills. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) {
      loadSkills();
      return;
    }
    setLoading(true);
    try {
      const data = await skillsApi.search(query.trim());
      setSkills(data);
    } catch (err) {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSkill(skillId) {
    setStatusMessage('');
    try {
      await skillsApi.add(skillId, type, proficiency);
      setStatusMessage('Added to your profile!');
      setAddingSkillId(null);
    } catch (err) {
      const message = err.response?.data?.error || 'Could not add this skill.';
      setStatusMessage(message);
    }
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Browse Skills</h1>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search skills (e.g. React)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {statusMessage && <div className="status-banner">{statusMessage}</div>}
        {error && <div className="error-banner">{error}</div>}
        {loading && <p>Loading skills...</p>}

        <div className="skill-list">
          {!loading &&
            skills.map((skill) => (
              <div key={skill.id} className="skill-row">
                <div className="skill-row-main">
                  <Link to={`/skills/${skill.id}`} className="skill-name">
                    {skill.name}
                  </Link>
                  {skill.category && <span className="skill-category">{skill.category}</span>}
                </div>

                {addingSkillId === skill.id ? (
                  <div className="skill-add-form">
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="offering">I can teach this</option>
                      <option value="seeking">I want to learn this</option>
                    </select>
                    <select value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <button onClick={() => handleAddSkill(skill.id)}>Confirm</button>
                    <button onClick={() => setAddingSkillId(null)} className="secondary">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSkillId(skill.id)}>Add to my profile</button>
                )}
              </div>
            ))}

          {!loading && skills.length === 0 && <p>No skills found.</p>}
        </div>
      </div>
    </div>
  );
}
