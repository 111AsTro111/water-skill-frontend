import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        /* Moon icon — shown when currently in light mode (tapping switches to dark) */
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ transform: 'rotate(-15deg)', transition: 'transform 0.3s ease' }}
        >
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        /* Sun icon — shown when currently in dark mode (tapping switches to light) */
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none"
          style={{ transition: 'transform 0.5s ease' }}
        >
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v2.5M12 19.5V22M4.22 4.22l1.77 1.77M18 18l1.78 1.78M2 12h2.5M19.5 12H22M4.22 19.78L6 18M18 6l1.78-1.78"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}