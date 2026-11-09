import { Component, type ErrorInfo, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Lỗi giao diện:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <h1>Trò chơi gặp sự cố</h1>
          <p>Hãy tải lại trang. Tiến trình hợp lệ gần nhất vẫn được lưu trên thiết bị này.</p>
          <button onClick={() => window.location.reload()}>Tải lại</button>
        </main>
      );
    }
    return this.props.children;
  }
}
