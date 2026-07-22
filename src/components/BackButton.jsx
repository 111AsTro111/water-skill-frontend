import { useNavigate } from 'react-router-dom';

// Sits at the bottom of sub-pages (not the two main dashboards). Uses
// browser history, not a hardcoded route — so it genuinely goes back one
// step, whatever that step was, rather than always landing on the same
// fixed page regardless of how the person actually got here.
export default function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="back-button-row">
      <button onClick={() => navigate(-1)} className="secondary">
        &larr; Back
      </button>
    </div>
  );
}
