import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import { Loader2, Sparkles } from "lucide-react";

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await saveProfile.mutateAsync({ name: name.trim() });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        aria-describedby="profile-setup-desc"
      >
        <DialogHeader>
          <div
            className="flex justify-center mb-2"
            aria-hidden="true"
          >
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="font-serif text-2xl text-center">
            Welcome to AbilityLearn!
          </DialogTitle>
          <DialogDescription id="profile-setup-desc" className="text-center text-base">
            What should we call you? Your name helps us personalize your
            experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-base font-medium">
              Your Name
            </Label>
            <Input
              id="display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Maria, Jordan…"
              className="text-base h-12 rounded-xl"
              autoFocus
              autoComplete="name"
              aria-required="true"
              aria-describedby="name-hint"
            />
            <p id="name-hint" className="text-sm text-muted-foreground">
              You can change this later in Settings.
            </p>
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base rounded-xl font-semibold"
            disabled={!name.trim() || saveProfile.isPending}
            aria-label={
              saveProfile.isPending ? "Saving your name, please wait" : "Continue to AbilityLearn"
            }
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Let's Get Started →"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
