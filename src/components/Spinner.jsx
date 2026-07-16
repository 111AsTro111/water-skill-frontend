// A small wrapper around Bootstrap's built-in spinner-border, so every
// loading state in the app looks consistent instead of plain text.
export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-body-secondary py-2">
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span>{label}</span>
    </div>
  );
}
