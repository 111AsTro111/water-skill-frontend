import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Welcome, {user?.name}</h1>
        <p>Here's what you can do today:</p>

        <div className="dashboard-cards">
          <Link to="/skillmesh/skills" className="dashboard-card">
            <h3>Browse Skills</h3>
            <p>Find people teaching what you want to learn.</p>
          </Link>
          <Link to="/skillmesh/my-skills" className="dashboard-card">
            <h3>My Skills</h3>
            <p>Manage what you're offering and seeking.</p>
          </Link>
          <Link to="/skillmesh/swap-requests" className="dashboard-card">
            <h3>Swap Requests</h3>
            <p>Track requests you've sent and received.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
