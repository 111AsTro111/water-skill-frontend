import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // Added this
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import Matches from './pages/Matches';
import SkillDetail from './pages/SkillDetail';
import MySkills from './pages/MySkills';
import SwapRequests from './pages/SwapRequests';
import PlaceOrder from './pages/PlaceOrder';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
import './App.css';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    // Wrapping the whole app once here means every page is covered — no
    // need to add error handling per-page. If a single component crashes,
    // this catches it instead of the entire tab going blank.
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider> {/* Now all routes have access to theme state */}
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
              <Route path="/skills" element={<Protected><Skills /></Protected>} />
              <Route path="/matches" element={<Protected><Matches /></Protected>} />
              <Route path="/skills/:skillId" element={<Protected><SkillDetail /></Protected>} />
              <Route path="/my-skills" element={<Protected><MySkills /></Protected>} />
              <Route path="/swap-requests" element={<Protected><SwapRequests /></Protected>} />
              <Route path="/order-water" element={<Protected><PlaceOrder /></Protected>} />
              <Route path="/my-orders" element={<Protected><MyOrders /></Protected>} />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Catch-all — must stay LAST. Any URL that didn't match a
                  route above (typo, old bookmark, etc.) lands here instead
                  of a blank React Router error page. */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}