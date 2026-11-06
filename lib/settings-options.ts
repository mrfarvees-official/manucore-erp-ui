export const LOCALES = [
  "en-US",
  "en-GB",
  "en-IN",
  "de-DE",
  "fr-FR",
  "es-ES",
  "it-IT",
  "pt-BR",
  "ja-JP",
  "zh-CN",
  "ar-AE",
];

export function timezones(): string[] {
  try {
    const zones = Intl.supportedValuesOf("timeZone");

    return zones.includes("UTC") ? zones : ["UTC", ...zones];
  } catch {
    return ["UTC"];
  }
}

export function currencies(): string[] {
  try {
    return Intl.supportedValuesOf("currency");
  } catch {
    return ["USD", "EUR", "GBP", "INR", "JPY"];
  }
}
