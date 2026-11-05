export const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400";

/** Same look as fieldClass but sized to its content, for toolbars and filter rows. */
export const inlineFieldClass = `h-10 ${fieldClass.replace("w-full ", "")}`;

export const cardClass = "rounded-lg border border-gray-200 bg-white p-5";

export const labelClass = "mb-1 block text-sm font-medium";