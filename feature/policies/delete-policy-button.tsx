"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeletePolicyButton({ id, name }: { id: string; name: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function remove() {
        if (!window.confirm(`Delete policy "${name}"? This cannot be undone.`)) {
            return;
        }

        setBusy(true);

        try {
            const response = await fetch(`/api/policies/${id}`, { method: "DELETE" });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                window.alert(result.message ?? "Unable to delete the policy.");
                return;
            }

            router.refresh();
        } finally {
            setBusy(false);
        }
    }

    return (
        <Button variant="linkDanger" onClick={remove} loading={busy}>
            Delete
        </Button>
    );
}