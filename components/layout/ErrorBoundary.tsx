'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '20px', background: '#FDFCF7', border: '1px solid #D81E13', borderRadius: '8px', color: '#1A1A1A' }}>
          <h2>Algo salió mal.</h2>
          <p>La aplicación ha encontrado un error inesperado. Por favor recarga la página.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
