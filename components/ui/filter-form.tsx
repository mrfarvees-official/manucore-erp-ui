"use client";

import {
  useEffect,
  useRef,
  useTransition,
  type ComponentProps,
  type FormEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { buttonClasses } from "./button";

const TEXT_DEBOUNCE_MS = 400;

type FilterFormProps = Omit<
  ComponentProps<"form">,
  "action" | "method" | "onChange" | "onSubmit"
> & {
  /** Show a "Clear" button that resets every field to its default. */
  showClear?: boolean;
};

/**
 * The one way to build list filters in this app.
 *
 * - Text inputs apply after the user pauses typing (debounced).
 * - Selects, checkboxes and radios apply immediately.
 * - Enter applies immediately; there is no submit button.
 * - The URL is the source of truth, so filters are shareable and survive reload.
 * - Empty values and values equal to the field's `data-default` are left out of the URL.
 * - `page` is dropped on every change so results start at page 1.
 *
 * Fields are uncontrolled: give them `name` and `defaultValue` from the parsed
 * search params, and `data-default` when a non-empty default should not appear
 * in the URL (e.g. `data-default="ACTIVE"`).
 */
export function FilterForm({
  showClear = false,
  className,
  children,
  ...rest
}: FilterFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const form = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [pending, startTransition] = useTransition();

  useEffect(() => () => clearTimeout(timer.current), []);

  function apply() {
    clearTimeout(timer.current);

    if (!form.current) return;

    const params = new URLSearchParams();

    for (const el of Array.from(form.current.elements)) {
      if (
        !(
          el instanceof HTMLInputElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement
        ) ||
        !el.name ||
        el.disabled
      ) {
        continue;
      }

      if (
        el instanceof HTMLInputElement &&
        (el.type === "checkbox" || el.type === "radio") &&
        !el.checked
      ) {
        continue;
      }

      const value = el.value.trim();

      if (value === "" || value === el.dataset.default) continue;

      params.set(el.name, value);
    }

    const query = params.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function onChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target;

    if (
      target instanceof HTMLInputElement &&
      ["text", "search", "email", "tel", "url", "number"].includes(target.type)
    ) {
      clearTimeout(timer.current);
      timer.current = setTimeout(apply, TEXT_DEBOUNCE_MS);
      return;
    }

    if (target instanceof HTMLTextAreaElement) {
      clearTimeout(timer.current);
      timer.current = setTimeout(apply, TEXT_DEBOUNCE_MS);
      return;
    }

    apply();
  }

  function clear() {
    if (!form.current) return;

    for (const el of Array.from(form.current.elements)) {
      if (el instanceof HTMLSelectElement) {
        el.value = el.dataset.default ?? el.options[0]?.value ?? "";
      } else if (el instanceof HTMLInputElement) {
        if (el.type === "hidden") continue;
        if (el.type === "checkbox" || el.type === "radio") {
          el.checked = false;
        } else {
          el.value = "";
        }
      }
    }

    apply();
  }

  return (
    <form
      {...rest}
      ref={form}
      role="search"
      aria-busy={pending || undefined}
      onChange={onChange}
      onSubmit={(event) => {
        event.preventDefault();
        apply();
      }}
      className={className}
    >
      {children}
      {showClear && (
        <button
          type="button"
          onClick={clear}
          className={buttonClasses({ variant: "link" })}
        >
          Clear
        </button>
      )}
    </form>
  );
}
