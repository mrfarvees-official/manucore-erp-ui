"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteItemButton({ id, label }: { id: string; label: string }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function remove() {
        if (!window.confirm(`Delete item "${label}"? This cannot be undone.`)) {
            return;
        }

        setBusy(true);

        try {
            const response = await fetch(`/api/v1/items/${id}`, { method: "DELETE" });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                window.alert(result.message ?? "Unable to delete the item.");
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