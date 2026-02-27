import React, { createContext, useContext } from "react";
import {
  useAccessibilitySettings,
  type FontSize,
} from "../hooks/useAccessibilitySettings";

export type { FontSize };

interface AccessibilityContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = useAccessibilitySettings();
  return (
    <AccessibilityContext.Provider value={settings}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
