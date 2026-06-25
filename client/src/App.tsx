import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import RequestForm from "./pages/RequestForm";
import RequestDetail from "./pages/RequestDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Notifications from "./pages/Notifications";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({
  component: Component,
  requiredRole,
}: {
  component: React.ComponentType;
  requiredRole?: "admin" | "user";
}) {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;

  // 미로그인 → 로그인 페이지
  if (!user) return <Redirect to="/login" />;

  // 권한 불일치
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Redirect to={user.role === "admin" ? "/admin/requests" : "/dashboard"} />
    );
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route
        path="/dashboard"
        component={() => <ProtectedRoute component={Dashboard} />}
      />
      <Route
        path="/request/new"
        component={() => <ProtectedRoute component={RequestForm} />}
      />
      <Route
        path="/request/:id"
        component={() => <ProtectedRoute component={RequestDetail} />}
      />
      <Route
        path="/admin/requests"
        component={() => (
          <ProtectedRoute component={AdminDashboard} requiredRole="admin" />
        )}
      />
      <Route
        path="/notifications"
        component={() => <ProtectedRoute component={Notifications} />}
      />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
