import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#090909] text-white p-6 relative z-[99999]">
          <div className="max-w-md text-center">
            <span className="material-symbols-outlined text-[64px] text-red-500 mb-6 block">error</span>
            <h1 className="font-display-xl text-[2rem] uppercase mb-4">Something went wrong</h1>
            <p className="text-white/60 font-mono text-[14px] mb-8">
              We've encountered an unexpected error. Try refreshing the page to fix this issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-black font-label-caps uppercase tracking-wider text-[12px] px-8 py-3 rounded-full hover:bg-white transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
