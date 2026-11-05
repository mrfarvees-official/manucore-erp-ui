"use client";

import { useRouter } from "next/navigation";

export function useSignOut() {
  const router = useRouter();

  return async function signOut() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  };
}
