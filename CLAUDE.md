# Project conventions

@AGENTS.md

## List filters and search: always use `FilterForm`

Every list page with a search box or filters MUST use
[components/ui/filter-form.tsx](components/ui/filter-form.tsx). Do not build a
`<form action=...>` with an Apply/Search submit button, and do not write a new
debounce or auto-submit implementation.

Behavior (already implemented, do not reimplement):
- Text inputs apply after the user pauses typing (400 ms debounce).
- Selects, checkboxes and radios apply immediately.
- Enter applies immediately. There is no Apply or Search button.
- The URL is the source of truth (`router.replace`, no scroll jump).
- `page` is dropped on every change so results restart at page 1.
- Empty values and values equal to the field's `data-default` are omitted from the URL.
- `showClear` renders a Clear button that resets every field.

How to use it:
- Wrap the fields in `<FilterForm showClear={hasFilters} className="...">`.
- Fields are uncontrolled: set `name` and `defaultValue` from the parsed search params.
- Add `data-default="<value>"` to any field whose default should not appear in the URL
  (for example `status` defaulting to `ACTIVE`, or a hidden `view` field).
- Use `inlineFieldClass` from [components/ui/styles.ts](components/ui/styles.ts) for
  filter-row controls. Do not combine `fieldClass` with `w-auto`: `fieldClass` has
  `w-full`, and the two conflict.
- Parse and validate search params on the server and keep link builders
  (such as `catalogHref`) in sync with the same defaults.

Reference implementations: [catalog page](app/(protected)/inventory/catalog/page.tsx)
and [items page](app/(protected)/inventory/items/page.tsx).

If filtering needs behavior `FilterForm` lacks, extend `FilterForm` itself so every
list page gets it. Do not fork it per page.
