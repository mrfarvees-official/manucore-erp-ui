import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  totalElements,
  noun,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  noun: string;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const link = buttonClasses({ variant: "link" });

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between text-sm"
    >
      <span className="text-gray-500">
        Page {page + 1} of {totalPages} ({totalElements} {noun})
      </span>
      <div className="flex gap-4">
        {page > 0 && (
          <Link href={hrefFor(0)} className={link}>
            First
          </Link>
        )}
        {page > 0 && (
          <Link href={hrefFor(page - 1)} className={link}>
            Previous
          </Link>
        )}
        {page + 1 < totalPages && (
          <Link href={hrefFor(page + 1)} className={link}>
            Next
          </Link>
        )}
        {page + 1 < totalPages && (
          <Link href={hrefFor(totalPages - 1)} className={link}>
            Last
          </Link>
        )}
      </div>
    </nav>
  );
}
