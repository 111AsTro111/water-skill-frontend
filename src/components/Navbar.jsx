import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Avatar from './Avatar';
import AvatarUploadModal from './AvatarUploadModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/skills', label: 'Browse Skills' },
    { to: '/matches', label: 'Suggested Matches' },
    { to: '/my-skills', label: 'My Skills' },
    { to: '/swap-requests', label: 'Swap Requests' },
    { to: '/order-water', label: 'Order Water' },
    { to: '/my-orders', label: 'My Orders' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-row">
        {/* 1. Hamburger Menu Button (Now placed on the left) */}
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

        {/* 2. Logo / Brand Name */}
        <Link to="/dashboard" className="navbar-brand">
          SkillMesh
        </Link>

        {/* 3. Desktop Navigation Links */}
        <div className="navbar-links navbar-links-desktop">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* 4. User Profile & Controls */}
        <div className="navbar-user">
          <ThemeToggle />
          <Avatar user={user} size={30} onClick={() => setAvatarModalOpen(true)} />
          <span className="navbar-username">{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-sm navbar-logout">
            Log out
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
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