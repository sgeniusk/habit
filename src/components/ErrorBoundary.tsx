// React 런타임 예외를 잡아 화이트 스크린 대신 복구 UI를 보여주는 최상위 경계
import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      window.console.error("Persona Habit error boundary caught", error);
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="error-boundary" role="alert">
        <div>
          <h1>잠깐 문제가 생겼어요.</h1>
          <p>스냅 기록은 안전하게 저장되어 있어요. 새로고침하면 이어서 쓸 수 있어요.</p>
          <p className="error-boundary-en">
            Something went wrong. Your snaps are safe — reload to continue.
          </p>
          <button type="button" onClick={this.handleReload}>
            새로고침 / Reload
          </button>
        </div>
      </div>
    );
  }
}
