"use client";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/feature/auth/use-sign-out";

export function LogoutButton() {
  const signOut = useSignOut();

  return (
    <Button variant="secondary" onClick={signOut}>
      Sign out
    </Button>
  );
}