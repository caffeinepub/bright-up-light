import React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Star, Heart } from "lucide-react";

const LOGO_SRC = "/assets/uploads/bright-ideas-creativity-innovation_24877-82240-1.jpg";

export default function LoginScreen() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const err = error as Error;
        if (err.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12"
    >
      {/* Decorative background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.62 0.14 185 / 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, oklch(0.75 0.16 75 / 0.10) 0%, transparent 45%),
            radial-gradient(circle at 60% 80%, oklch(0.62 0.14 185 / 0.08) 0%, transparent 40%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-card border border-border overflow-hidden">
            <img
              src={LOGO_SRC}
              alt="Bright Up Light logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">
          Bright Up Light
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Your personal learning companion
        </p>
        <p className="text-base text-muted-foreground mb-10 max-w-sm mx-auto leading-relaxed">
          Track your goals, log study sessions, and celebrate every step forward
          — designed for everyone.
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 mb-10" aria-hidden="true">
          {[
            { icon: Star, label: "Set Goals" },
            { icon: BookOpen, label: "Log Study" },
            { icon: Heart, label: "Grow Daily" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <Button
          size="lg"
          onClick={handleAuth}
          disabled={isLoggingIn}
          className="w-full text-lg py-6 rounded-xl font-semibold shadow-card"
          aria-label={isLoggingIn ? "Signing in, please wait" : "Sign in to Bright Up Light"}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign In to Get Started"
          )}
        </Button>

        <p className="mt-6 text-sm text-muted-foreground">
          Secure, private, and accessible. Your data stays yours.
        </p>
      </div>

      <footer className="relative z-10 mt-16 text-sm text-muted-foreground">
        © 2026. Built with{" "}
        <Heart className="inline w-4 h-4 text-destructive" aria-hidden="true" />{" "}
        using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
