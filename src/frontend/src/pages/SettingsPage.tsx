import React, { useState, useEffect } from "react";
import { useGetCallerUserProfile, useSaveCallerUserProfile } from "../hooks/useQueries";
import { useAccessibility, type FontSize } from "../context/AccessibilityContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { User, Accessibility, Type, Eye, Zap, Loader2 } from "lucide-react";

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; size: string }[] = [
  { value: "normal", label: "Normal", size: "18px" },
  { value: "large", label: "Large", size: "20px" },
  { value: "xl", label: "Extra Large", size: "24px" },
];

export default function SettingsPage() {
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const { fontSize, setFontSize, highContrast, setHighContrast, reducedMotion, setReducedMotion } =
    useAccessibility();

  const [nameValue, setNameValue] = useState("");

  useEffect(() => {
    if (profile?.name) {
      setNameValue(profile.name);
    }
  }, [profile]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValue.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: nameValue.trim() });
      toast.success("Profile updated!");
    } catch {
      toast.error("Could not save profile. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your experience for comfort and accessibility.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="rounded-2xl shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl">Profile</CardTitle>
                <CardDescription>Update your display name.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-5" />
            {profileLoading ? (
              <Skeleton className="h-11 w-full rounded-xl" />
            ) : (
              <form onSubmit={handleSaveName} className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="settings-name" className="text-base font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="settings-name"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    placeholder="Your name"
                    className="h-11 rounded-xl text-base"
                    aria-required="true"
                    autoComplete="name"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={!nameValue.trim() || saveProfile.isPending || nameValue === profile?.name}
                    className="rounded-xl h-11"
                    aria-label={saveProfile.isPending ? "Saving name, please wait" : "Save display name"}
                  >
                    {saveProfile.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Font Size Section */}
        <Card className="rounded-2xl shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <Type className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl">Text Size</CardTitle>
                <CardDescription>Choose a comfortable reading size.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-5" />
            <fieldset>
              <legend className="sr-only">Choose text size</legend>
              <div className="grid grid-cols-3 gap-3">
                {FONT_SIZE_OPTIONS.map(({ value, label, size }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFontSize(value)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      fontSize === value
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border bg-card hover:border-primary/30 text-muted-foreground"
                    }`}
                    aria-pressed={fontSize === value}
                    aria-label={`Set text size to ${label} (${size})`}
                  >
                    <span
                      className="font-bold"
                      style={{ fontSize: size }}
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs opacity-60">{size}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          </CardContent>
        </Card>

        {/* Accessibility Toggles */}
        <Card className="rounded-2xl shadow-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <Accessibility className="w-5 h-5 text-success" />
              </div>
              <div>
                <CardTitle className="font-serif text-xl">Accessibility</CardTitle>
                <CardDescription>Adjust visual and motion settings.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Separator className="mb-5" />
            <div className="space-y-5">
              {/* High Contrast */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">High Contrast Mode</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Increases contrast for better readability.
                    </p>
                  </div>
                </div>
                <Switch
                  id="high-contrast-toggle"
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                  aria-label={`High contrast mode is ${highContrast ? "on" : "off"}. Toggle to ${highContrast ? "disable" : "enable"}.`}
                />
              </div>

              <Separator />

              {/* Reduced Motion */}
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5"
                    aria-hidden="true"
                  >
                    <Zap className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Reduce Motion</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Minimizes animations and transitions.
                    </p>
                  </div>
                </div>
                <Switch
                  id="reduced-motion-toggle"
                  checked={reducedMotion}
                  onCheckedChange={setReducedMotion}
                  aria-label={`Reduce motion is ${reducedMotion ? "on" : "off"}. Toggle to ${reducedMotion ? "disable" : "enable"}.`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Keyboard shortcuts info */}
        <Card className="rounded-2xl shadow-card border-border bg-primary/5">
          <CardContent className="p-5">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-3">
              Keyboard Navigation Tips
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <kbd className="px-2 py-0.5 bg-card border border-border rounded text-xs font-mono shrink-0">Tab</kbd>
                <span>Move to the next interactive element</span>
              </li>
              <li className="flex gap-2">
                <kbd className="px-2 py-0.5 bg-card border border-border rounded text-xs font-mono shrink-0">Shift+Tab</kbd>
                <span>Move to the previous interactive element</span>
              </li>
              <li className="flex gap-2">
                <kbd className="px-2 py-0.5 bg-card border border-border rounded text-xs font-mono shrink-0">Enter / Space</kbd>
                <span>Activate buttons and controls</span>
              </li>
              <li className="flex gap-2">
                <kbd className="px-2 py-0.5 bg-card border border-border rounded text-xs font-mono shrink-0">Esc</kbd>
                <span>Close dialogs and menus</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
