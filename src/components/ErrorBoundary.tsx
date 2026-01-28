'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    override render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex items-center justify-center min-h-screen bg-deep-void p-4">
                    <div className="bg-gray-900 border border-red-500/50 rounded-lg p-8 max-w-md text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
                        <p className="text-gray-400 mb-6">
                            An unexpected error occurred. Please refresh the page to continue.
                        </p>
                        {this.state.error && (
                            <details className="text-left text-xs text-gray-500 bg-black/50 p-3 rounded mb-4">
                                <summary className="cursor-pointer hover:text-gray-300">Error details</summary>
                                <pre className="mt-2 overflow-auto">{this.state.error.message}</pre>
                            </details>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-red-500 text-white font-bold rounded uppercase tracking-wider hover:bg-red-600 transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
