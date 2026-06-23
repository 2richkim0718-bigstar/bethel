import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
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

  // 프로필 미완성 → 온보딩
  if (!user.profileCompleted) return <Redirect to="/onboarding" />;

  // 권한 불일치
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Redirect to={user.role === "admin" ? "/admin/requests" : "/dashboard"} />
    );
  }

  return <Component />;
}

/** 로그인했지만 온보딩 전이면 온보딩으로, 완료했으면 역할별 홈으로 보낸다. */
function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Redirect to="/login" />;
  if (user.profileCompleted) {
    return (
      <Redirect to={user.role === "admin" ? "/admin/requests" : "/dashboard"} />
    );
  }
  return <Onboarding />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/onboarding" component={OnboardingRoute} />
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
