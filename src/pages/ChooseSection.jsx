import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Avatar from '../components/Avatar';

export const SECTION_STORAGE_KEY = 'skillmesh_last_section';

export default function ChooseSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function choose(section) {
    localStorage.setItem(SECTION_STORAGE_KEY, section);
    navigate(section === 'skillmesh' ? '/skillmesh/dashboard' : '/water/dashboard');
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="page">
      {/* Reuses the same navbar classes as the real Navbar component, just
          with no section links — this page sits ABOVE both sections, so it
          shouldn't show either section's nav links. */}
      <nav className="navbar">
        <div className="navbar-row">
          <span className="navbar-brand">SkillMesh</span>
          <div className="navbar-user">
            <ThemeToggle />
            <Avatar user={user} size={30} />
            <span className="navbar-username">{user?.name}</span>
            <button onClick={handleLogout} className="btn btn-sm navbar-logout">
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <h1>Welcome, {user?.name}</h1>
        <p>What would you like to do today?</p>

        {/* Reusing the exact same classes as Dashboard.jsx's cards, so
            these render identically styled instead of as plain buttons. */}
        <div className="dashboard-cards">
          <button className="dashboard-card" onClick={() => choose('skillmesh')}>
            <h3>SkillMesh</h3>
            <p>Swap skills — teach what you know, learn what you don't.</p>
          </button>

          <button className="dashboard-card" onClick={() => choose('water')}>
            <h3>Water Delivery</h3>
            <p>Order a tanker delivery, or manage supplier orders.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
