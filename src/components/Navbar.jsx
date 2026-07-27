import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import AvatarUploadModal from './AvatarUploadModal';
import { DropletIcon, SwapIcon } from './Icons';

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
  { to: '/water/browse-suppliers', label: 'Browse Suppliers' },
  { to: '/water/my-orders', label: 'My Orders' },
];

// The "Switch section" control only makes sense as a top-level action —
// showing it on every sub-page turned it into visual noise and made people
// think it was the way back from ANY page, when sub-pages should use
// BackButton (browser history) instead.
const MAIN_DASHBOARD_PATHS = ['/skillmesh/dashboard', '/water/dashboard'];

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

  const inWaterSection = location.pathname.startsWith('/water');
  const links = inWaterSection ? WATER_LINKS : SKILLMESH_LINKS;
  const brandLabel = 'SkillMesh &amp; Water Delivery';
  const showSwitch = MAIN_DASHBOARD_PATHS.includes(location.pathname);

  // Drives the section-specific accent color entirely from CSS — see
  // [data-section='water'] overrides in App.css. Set on <html> rather than
  // this component's own DOM node so it cascades to EVERYTHING on the
  // page, not just inside the navbar.
  useEffect(() => {
    document.body.classList.toggle('section-water', inWaterSection);
  }, [inWaterSection]);

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

        <Link to={inWaterSection ? '/water/dashboard' : '/skillmesh/dashboard'} className="navbar-brand">
          {inWaterSection ? <DropletIcon size={20} /> : <SwapIcon size={20} />}
          {brandLabel}
        </Link>

        {showSwitch && (
          <Link to="/choose" className="btn btn-sm navbar-switch-section">
            &larr; Switch
          </Link>
        )}

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
          {showSwitch && (
            <Link to="/choose" className="nav-link" onClick={() => setMenuOpen(false)}>
              &larr; Switch section
            </Link>
          )}
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
