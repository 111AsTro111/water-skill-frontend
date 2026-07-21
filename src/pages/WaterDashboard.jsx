import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function WaterDashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <h1>Welcome, {user?.name}</h1>
        <p>Here's what you can do today:</p>

        <div className="dashboard-cards">
          <Link to="/water/order-water" className="dashboard-card">
            <h3>Order Water</h3>
            <p>Book a tanker delivery to your address.</p>
          </Link>
          <Link to="/water/my-orders" className="dashboard-card">
            <h3>My Orders</h3>
            <p>Track deliveries and payment status.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
