import { useState } from "react";
import { auth, useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lock, Unlock } from "lucide-react";

export function AdminBar() {
  const unlocked = useAuth();
  const [open, setOpen] = useState(false);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const isFirstTime = typeof window !== "undefined" && !auth.hasPasscode();

  const handleSubmit = () => {
    setError("");
    if (isFirstTime) {
      if (pass.length < 4) return setError("Use at least 4 characters.");
      if (pass !== confirm) return setError("Passcodes don't match.");
      auth.setPasscode(pass);
    } else {
      if (!auth.unlock(pass)) return setError("Wrong passcode.");
    }
    setPass("");
    setConfirm("");
    setOpen(false);
  };

  if (unlocked) {
    return (
      <Button variant="outline" size="sm" onClick={() => auth.lock()}>
        <Unlock className="mr-2 h-4 w-4" /> Admin mode
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Lock className="mr-2 h-4 w-4" /> Admin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isFirstTime ? "Set your passcode" : "Enter passcode"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Passcode"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isFirstTime && handleSubmit()}
            autoFocus
          />
          {isFirstTime && (
            <Input
              type="password"
              placeholder="Confirm passcode"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isFirstTime && (
            <p className="text-xs text-muted-foreground">
              This passcode is stored on this device. Remember it — there's no
              recovery.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>
            {isFirstTime ? "Set passcode" : "Unlock"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
