import { Component } from 'react';

// A "class component" is used here on purpose — React's error boundary
// feature only works with class components as of today's React, there's
// no hook equivalent (like useErrorBoundary) yet. This is the one place
// in the whole project where a class component is the right tool.
//
// Without this, any unexpected runtime error anywhere in the app (a typo
// in a property access, an API response shaped differently than expected,
// etc.) would crash the ENTIRE page to a blank white screen with no
// explanation — a bad experience anywhere, and especially unhelpful if
// someone's on a shaky connection and can't easily tell if it's their
// network or a real bug.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to a logging service. For now,
    // logging to the console is enough to debug during development.
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <h1>Something went wrong</h1>
          <p>
            This page hit an unexpected error. Try refreshing — if it keeps
            happening, the team's been notified.
          </p>
          <button onClick={() => window.location.reload()}>Refresh page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
