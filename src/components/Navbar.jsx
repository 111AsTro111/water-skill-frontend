import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import AvatarUploadModal from './AvatarUploadModal';

const SKILLMESH_LINKS = [
  { to: '/skillmesh/dashboard', label: 'Dashboard' },
  { to: '/skillmesh/skills', label: 'Browse Skills' },
  { to: '/skillmesh/matches', label: 'Suggested Matches' },
  { to: '/skillmesh/my-skills', label: 'My Skills' },
  { to: '/skillmesh/swap-requests', label: 'Swap Requests' },
];

const WATER_LINKS = [
  { to: '/water/dashboard', label: 'Dashboard' },
  { to: '/water/order-water', label: 'Order Water' },
  { to: '/water/my-orders', label: 'My Orders' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // Which set of links to show is driven entirely by the current URL, not
  // stored state — so a direct link to /water/... always shows Water links
  // even if the person's last remembered section was SkillMesh.
  const inWaterSection = location.pathname.startsWith('/water');
  const links = inWaterSection ? WATER_LINKS : SKILLMESH_LINKS;
  const brandLabel = inWaterSection ? 'Water Delivery' : 'SkillMesh';

  return (
    <nav className="navbar">
      <div className="navbar-row">
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Logo now always returns to the chooser — not the section
            dashboard — so switching sections is always one click away. */}
        <Link to="/choose" className="navbar-brand">
          {brandLabel}
        </Link>

        <div className="navbar-links navbar-links-desktop">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <ThemeToggle />
          <Avatar user={user} size={30} onClick={() => setAvatarModalOpen(true)} />
          <span className="navbar-username">{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-sm navbar-logout">
            Log out
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-links-mobile">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {avatarModalOpen && <AvatarUploadModal onClose={() => setAvatarModalOpen(false)} />}
    </nav>
  );
}
