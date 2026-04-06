import { Component, ReactNode } from "react";
import { clearPersistedProject } from "../features/projects/persistence";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("App crashed during render", error);
  }

  private resetApp = () => {
    clearPersistedProject();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-crash-screen">
          <div className="app-crash-screen__card">
            <h1>Приложение столкнулось с ошибкой</h1>
            <p>
              Локальные данные или один из UI-компонентов сломали старт. Сбросьте
              последнее сохранение и перезагрузите приложение.
            </p>
            <button type="button" onClick={this.resetApp}>
              Сбросить локальные данные
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
