import { useState, useEffect } from "react";

export type FontSize = "normal" | "large" | "xl";

const FONT_SIZES: Record<FontSize, string> = {
  normal: "18px",
  large: "20px",
  xl: "24px",
};

export function useAccessibilitySettings() {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (localStorage.getItem("fontSize") as FontSize) || "normal";
  });

  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    return localStorage.getItem("highContrast") === "true";
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    return localStorage.getItem("reducedMotion") === "true";
  });

  // Apply font size
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--base-font-size",
      FONT_SIZES[fontSize]
    );
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  // Apply high contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }
    localStorage.setItem("highContrast", String(highContrast));
  }, [highContrast]);

  // Apply reduced motion
  useEffect(() => {
    if (reducedMotion) {
      document.body.classList.add("motion-reduce");
    } else {
      document.body.classList.remove("motion-reduce");
    }
    localStorage.setItem("reducedMotion", String(reducedMotion));
  }, [reducedMotion]);

  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const setHighContrast = (val: boolean) => setHighContrastState(val);
  const setReducedMotion = (val: boolean) => setReducedMotionState(val);

  return {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  };
}
