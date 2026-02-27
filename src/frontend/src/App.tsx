import React from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import LoginScreen from "./components/LoginScreen";
import ProfileSetupModal from "./components/ProfileSetupModal";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import GoalsPage from "./pages/GoalsPage";
import StudyLogPage from "./pages/StudyLogPage";
import ResourcesPage from "./pages/ResourcesPage";
import SettingsPage from "./pages/SettingsPage";
import { Skeleton } from "@/components/ui/skeleton";

// Root route with auth guard
function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Show loading spinner while initializing auth
  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background"
        aria-busy="true"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <div
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        </div>
        <Skeleton className="h-5 w-40" />
      </div>
    );
  }

  // Not authenticated — show login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Authenticated but no profile — show setup modal
  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (showProfileSetup) {
    return (
      <AccessibilityProvider>
        <ProfileSetupModal open={true} />
      </AccessibilityProvider>
    );
  }

  // Authenticated with profile — show app
  return (
    <AccessibilityProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AccessibilityProvider>
  );
}

// Route definitions
const rootRoute = createRootRoute({ component: RootComponent });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/goals",
  component: GoalsPage,
});

const studyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/study",
  component: StudyLogPage,
});

const resourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/resources",
  component: ResourcesPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  goalsRoute,
  studyRoute,
  resourcesRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
