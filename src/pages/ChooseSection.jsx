import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Remembers the choice so returning users skip straight to their section
// next time — but the navbar logo always links back here, so switching
// is never more than one click away.
export const SECTION_STORAGE_KEY = 'skillmesh_last_section';

export default function ChooseSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  function choose(section) {
    localStorage.setItem(SECTION_STORAGE_KEY, section);
    navigate(section === 'skillmesh' ? '/skillmesh/dashboard' : '/water/dashboard');
  }

  return (
    <div className="choose-section-page">
      <h1>Welcome, {user?.name}</h1>
      <p>What would you like to do today?</p>

      <div className="choose-section-cards">
        <button className="choose-card" onClick={() => choose('skillmesh')}>
          <h2>SkillMesh</h2>
          <p>Swap skills — teach what you know, learn what you don't.</p>
        </button>

        <button className="choose-card" onClick={() => choose('water')}>
          <h2>Water Delivery</h2>
          <p>Order a tanker delivery, or manage supplier orders.</p>
        </button>
      </div>
    </div>
  );
}
