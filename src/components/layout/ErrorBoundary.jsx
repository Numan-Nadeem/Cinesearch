import { Component } from 'react';
import ErrorState from '../ui/ErrorState.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-6 py-12">
          <ErrorState
            error={this.state.error}
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
