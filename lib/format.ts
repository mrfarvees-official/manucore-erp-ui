/** Formats an ISO instant in the user's own time zone and locale. */
export function formatDateTime(iso: string, timeZone: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(new Date(iso));
  } catch {
    return `${iso.slice(0, 16).replace("T", " ")} UTC`;
  }
}
