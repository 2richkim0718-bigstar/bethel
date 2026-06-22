import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-background" style={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "2rem"}}>
          <div className="max-w-2xl" style={{display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: "2rem"}}>
            <AlertTriangle
              size={48}
              className="text-destructive flex-shrink-0" style={{marginBottom: "1.5rem"}}
            />

            <h2 style={{fontSize: "1.25rem", marginBottom: "1rem"}}>An unexpected error occurred.</h2>

            <div className="bg-muted overflow-auto" style={{padding: "1rem", width: "100%", borderRadius: "0.25rem", marginBottom: "1.5rem"}}>
              <pre className="text-muted-foreground whitespace-break-spaces" style={{fontSize: "0.875rem"}}>
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
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
