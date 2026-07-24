import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Avatar from '../components/Avatar';
import { DropletIcon, SwapIcon } from '../components/Icons';

export const SECTION_STORAGE_KEY = 'skillmesh_last_section';

export default function ChooseSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // This page sits ABOVE both sections — neither accent color should
  // "win" here, so the section attribute gets cleared while it's shown.
  useEffect(() => {
    document.body.classList.remove('section-water');
  }, []);

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

        <div className="dashboard-cards">
          <button
            className="dashboard-card dashboard-card-accented"
            style={{ '--card-accent': 'var(--skillmesh-accent)' }}
            onClick={() => choose('skillmesh')}
          >
            <SwapIcon size={28} className="dashboard-card-icon" />
            <h3>SkillMesh</h3>
            <p>Swap skills — teach what you know, learn what you don't.</p>
          </button>

          <button
            className="dashboard-card dashboard-card-accented"
            style={{ '--card-accent': 'var(--water-accent)' }}
            onClick={() => choose('water')}
          >
            <DropletIcon size={28} className="dashboard-card-icon" />
            <h3>Water Delivery</h3>
            <p>Order a tanker delivery, or manage supplier orders.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
