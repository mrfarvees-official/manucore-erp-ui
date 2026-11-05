"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteRoleButton({
  id,
  name,
  blockedReason,
}: {
  id: string;
  name: string;
  blockedReason?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (
      !window.confirm(
        `Delete role "${name}"? Policies that mention it will stop matching anyone.`,
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`/api/roles/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        window.alert(result.message ?? "Unable to delete the role.");
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="linkDanger"
      onClick={remove}
      loading={busy}
      disabled={!!blockedReason}
      title={blockedReason}
    >
      Delete
    </Button>
  );
}
