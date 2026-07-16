import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Order matters: Bootstrap's base CSS loads first, then our theme
// override (which redefines Bootstrap's own variables), then our
// remaining custom component styles, then animations last so they
// can safely apply on top of everything else.
import 'bootstrap/dist/css/bootstrap.min.css';
import './bootstrap-theme.css';
import './App.css';
import './animations.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
