// A small set of colors to pick from for the initials fallback — picked
// deterministically from the person's name, so the same user always gets
// the same color instead of a random one on every page load.
const FALLBACK_COLORS = ['#0e7c7b', '#d9a441', '#5c7570', '#a9760f', '#2bb6b3'];

function colorForName(name) {
  if (!name) return FALLBACK_COLORS[0];
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[charSum % FALLBACK_COLORS.length];
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function Avatar({ user, size = 32, onClick }) {
  const dimension = `${size}px`;

  if (user?.avatar_path) {
    return (
      <img
        src={user.avatar_path}
        alt={`${user.name}'s profile picture`}
        className="avatar-image"
        style={{ width: dimension, height: dimension }}
        onClick={onClick}
      />
    );
  }

  // No picture uploaded yet — show initials on a color derived from their
  // name, rather than a generic gray circle. Small detail, but it means
  // every user's "default avatar" still looks intentional, not like a
  // missing-image placeholder.
  return (
    <div
      className="avatar-initials"
      style={{
        width: dimension,
        height: dimension,
        background: colorForName(user?.name),
        fontSize: `${size * 0.4}px`,
      }}
      onClick={onClick}
    >
      {initials(user?.name)}
    </div>
  );
}
