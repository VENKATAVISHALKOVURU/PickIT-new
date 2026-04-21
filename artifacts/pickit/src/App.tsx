import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/lib/auth";
import { PrivateRoute, AppLayout } from "@/components/layout";

// Public pages
import Landing from "@/pages/landing";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import JoinShop from "@/pages/join";
import Policy from "@/pages/policy";

// Owner pages
import OwnerOverview from "@/pages/owner/overview";
import OwnerOrders from "@/pages/owner/orders";
import OwnerQR from "@/pages/owner/qr";
import OwnerPricing from "@/pages/owner/pricing";
import OwnerAnalytics from "@/pages/owner/analytics";
import OwnerSettings from "@/pages/owner/settings";

// Student pages
import StudentUpload from "@/pages/student/upload";
import StudentOrders from "@/pages/student/orders";
import StudentHistory from "@/pages/student/history";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/join/:shopCode" component={JoinShop} />
      <Route path="/legal/:key" component={Policy} />

      {/* Owner Routes */}
      <Route path="/owner/overview">
        <PrivateRoute role="owner">
          <AppLayout>
            <OwnerOverview />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/owner/orders">
        <PrivateRoute role="owner">
          <AppLayout>
            <OwnerOrders />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/owner/qr">
        <PrivateRoute role="owner">
          <AppLayout>
            <OwnerQR />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/owner/pricing">
        <PrivateRoute role="owner">
          <AppLayout>
            <OwnerPricing />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/owner/analytics">
        <PrivateRoute role="owner">
          <AppLayout>
            <OwnerAnalytics />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/owner/settings">
        <PrivateRoute role="owner">
          <AppLayout>
            <OwnerSettings />
          </AppLayout>
        </PrivateRoute>
      </Route>

      {/* Student Routes */}
      <Route path="/student/upload">
        <PrivateRoute role="student">
          <AppLayout>
            <StudentUpload />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/student/orders">
        <PrivateRoute role="student">
          <AppLayout>
            <StudentOrders />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/student/history">
        <PrivateRoute role="student">
          <AppLayout>
            <StudentHistory />
          </AppLayout>
        </PrivateRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
