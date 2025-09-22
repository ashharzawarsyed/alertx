import React from "react";

class PatientCarouselErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error("PatientCarousel Error:", {
      error,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorInfo,
      componentStack: errorInfo?.componentStack,
    });
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Patient Display Error
          </h3>
          <p className="text-red-600 mb-4">
            There was an error loading the patient navigation system.
          </p>
          <button
            onClick={() =>
              this.setState({ hasError: false, error: null, errorInfo: null })
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-700 font-medium">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded text-sm">
                <div className="mb-2">
                  <strong>Error:</strong>{" "}
                  {this.state.error && this.state.error.toString()}
                </div>
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo &&
                      this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default PatientCarouselErrorBoundary;
