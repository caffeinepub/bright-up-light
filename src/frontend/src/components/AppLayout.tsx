import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCallerUserProfile } from "../hooks/useQueries";
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Library,
  Settings,
  LogOut,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";

const LOGO_SRC = "/assets/uploads/bright-ideas-creativity-innovation_24877-82240-1.jpg";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/study", label: "Study Log", icon: BookOpen },
  { to: "/resources", label: "Resources", icon: Library },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: profile } = useGetCallerUserProfile();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar border-r border-sidebar-border"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring rounded-lg"
            aria-label="Bright Up Light - Go to Dashboard"
          >
            <div
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-sidebar-border"
              aria-hidden="true"
            >
              <img
                src={LOGO_SRC}
                alt="Bright Up Light logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif text-xl font-bold text-sidebar-foreground">
              Bright Up Light
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-6 space-y-1" aria-label="App pages">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const isActive = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className="w-5 h-5 shrink-0"
                  aria-hidden="true"
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent">
            <Avatar className="w-9 h-9 shrink-0" aria-hidden="true">
              <AvatarFallback className="text-sm font-semibold bg-sidebar-primary text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {profile?.name || "Learner"}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                My Account
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-xl"
            aria-label="Sign out of Bright Up Light"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-40 bg-background border-b border-border px-4 py-4 flex items-center justify-between"
        >
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
            aria-label="Bright Up Light - Go to Dashboard"
          >
            <div
              className="w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm border border-border"
              aria-hidden="true"
            >
              <img
                src={LOGO_SRC}
                alt="Bright Up Light logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-serif text-lg font-bold text-foreground">
              Bright Up Light
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8" aria-label={`Logged in as ${profile?.name || "Learner"}`}>
              <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 px-4 py-6 md:px-6 md:py-8 pb-24 lg:pb-8"
        >
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border safe-area-pb"
          aria-label="Mobile navigation"
        >
          <div className="flex items-stretch">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = currentPath === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={label}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-primary" : ""}`}
                    aria-hidden="true"
                  />
                  <span className="sr-only sm:not-sr-only">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <Toaster position="top-center" richColors expand closeButton />

      {/* Footer (desktop only) */}
      <div className="hidden lg:block fixed bottom-0 left-0 w-64 px-6 py-3 text-xs text-sidebar-foreground/50 border-t border-sidebar-border bg-sidebar">
        © 2026. Built with{" "}
        <Heart
          className="inline w-3 h-3 text-destructive"
          aria-hidden="true"
        />{" "}
        using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-sidebar-foreground"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
