"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button variant="secondary" onClick={logout}>
      Sign out
    </Button>
  );
}