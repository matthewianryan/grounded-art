// Date helpers for feed items. Dates from the API are day-granularity ISO strings (YYYY-MM-DD).
// They are parsed by hand rather than with Date, so they never shift across a timezone boundary.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface DateParts {
  year: number;
  month: string;
  day: number;
}

function parts(iso: string): DateParts {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month: MONTHS[month - 1], day };
}

export function formatDate(iso: string): string {
  const { year, month, day } = parts(iso);
  return `${day} ${month} ${year}`;
}

// A human-readable range from optional start and end dates. Returns null when neither is set.
export function formatDateRange(
  starts: string | null,
  ends: string | null,
): string | null {
  if (!starts && !ends) return null;
  if (starts && !ends) return `From ${formatDate(starts)}`;
  if (!starts && ends) return `Until ${formatDate(ends)}`;
  if (starts === ends) return formatDate(starts!);

  const s = parts(starts!);
  const e = parts(ends!);
  // Drop the year on the start when both fall in the same year.
  const startStr = s.year === e.year ? `${s.day} ${s.month}` : `${s.day} ${s.month} ${s.year}`;
  return `${startStr} – ${formatDate(ends!)}`;
}
