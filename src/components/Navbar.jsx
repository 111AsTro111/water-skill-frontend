import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">SkillMesh</div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/skills">Browse Skills</Link>
        <Link to="/matches">Suggested Matches</Link>
        <Link to="/my-skills">My Skills</Link>
        <Link to="/swap-requests">Swap Requests</Link>
        <Link to="/order-water">Order Water</Link>
        <Link to="/my-orders">My Orders</Link>
      </div>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </nav>
  );
}
