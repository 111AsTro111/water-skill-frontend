import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import ChooseSection, { SECTION_STORAGE_KEY } from './pages/ChooseSection';
import Dashboard from './pages/Dashboard';
import WaterDashboard from './pages/WaterDashboard';
import BecomeSupplier from './pages/BecomeSupplier';
import MyTankers from './pages/MyTankers';
import PendingRequests from './pages/PendingRequests';
import MyAssignedOrders from './pages/MyAssignedOrders';
import BrowseSuppliers from './pages/BrowseSuppliers';
import Skills from './pages/Skills';
import Matches from './pages/Matches';
import SkillDetail from './pages/SkillDetail';
import MySkills from './pages/MySkills';
import SwapRequests from './pages/SwapRequests';
import PlaceOrder from './pages/PlaceOrder';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
import './App.css';
import BrowseSuppliers from './pages/BrowseSuppliers';
import EditSupplierProfile from './pages/EditSupplierProfile';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

// Landing gate: if the user has a remembered section, skip straight there.
// Otherwise show the chooser. Used for "/" so a bookmark or fresh login
// always lands somewhere sensible without forcing the chooser every time.
function SectionGate() {
  const remembered = localStorage.getItem(SECTION_STORAGE_KEY);
  if (remembered === 'skillmesh') return <Navigate to="/skillmesh/dashboard" replace />;
  if (remembered === 'water') return <Navigate to="/water/dashboard" replace />;
  return <Navigate to="/choose" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/choose" element={<Protected><ChooseSection /></Protected>} />

              {/* SkillMesh section */}
              <Route path="/skillmesh/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/skillmesh/skills" element={<Protected><Skills /></Protected>} />
              <Route path="/skillmesh/matches" element={<Protected><Matches /></Protected>} />
              <Route path="/skillmesh/skills/:skillId" element={<Protected><SkillDetail /></Protected>} />
              <Route path="/skillmesh/my-skills" element={<Protected><MySkills /></Protected>} />
              <Route path="/skillmesh/swap-requests" element={<Protected><SwapRequests /></Protected>} />

              {/* Water Delivery section */}
              <Route path="/water/dashboard" element={<Protected><WaterDashboard /></Protected>} />
              <Route path="/water/order-water" element={<Protected><PlaceOrder /></Protected>} />
              <Route path="/water/my-orders" element={<Protected><MyOrders /></Protected>} />
              <Route path="/water/become-supplier" element={<Protected><BecomeSupplier /></Protected>} />
              <Route path="/water/my-tankers" element={<Protected><MyTankers /></Protected>} />
              <Route path="/water/pending-requests" element={<Protected><PendingRequests /></Protected>} />
              <Route path="/water/assigned-orders" element={<Protected><MyAssignedOrders /></Protected>} />
              <Route path="/water/browse-suppliers" element={<Protected><BrowseSuppliers /></Protected>} />
              <Route path="/water/browse-suppliers" element={<Protected><BrowseSuppliers /></Protected>} />
              <Route path="/water/edit-supplier-profile" element={<Protected><EditSupplierProfile /></Protected>} />

              <Route path="/" element={<SectionGate />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
