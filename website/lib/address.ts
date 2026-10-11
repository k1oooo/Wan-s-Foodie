// Keeps delivery addresses looking the same everywhere (what's saved in
// Supabase, the WhatsApp message, receipts and the admin panel), no matter
// whether the customer typed in ALL CAPS, all lowercase, or across several
// lines.

// Short forms that should stay fully uppercase rather than becoming "Kl".
const UPPERCASE_WORDS = new Set([
  "KL",
  "PJ",
  "USJ",
  "SS",
  "TTDI",
  "KLCC",
  "LRT",
  "MRT",
  "PPR",
  "PPV",
  "PKNS",
  "JKR",
  "IOI",
  "UKM",
  "UM",
  "UPM",
  "UTM",
  "UiTM",
  "KLIA",
  "SD",
  "SMK",
  "SK",
  "BU",
]);

function formatWord(word: string): string {
  // Anything with a digit is a lot / unit / section number (7A, SS2, U8,
  // 1/2A) — keep it uppercase.
  if (/\d/.test(word)) return word.toUpperCase();

  const bare = word.replace(/[^A-Za-z]/g, "").toUpperCase();
  if (UPPERCASE_WORDS.has(bare)) return word.toUpperCase();

  // Capitalise the first letter of the word and after "-", "/", "(" so
  // "BANDAR-BARU" and "(OFF" come out as "Bandar-Baru" and "(Off".
  return word
    .toLowerCase()
    .replace(
      /(^|[-/(])([a-z])/g,
      (_, sep: string, ch: string) => sep + ch.toUpperCase(),
    );
}

/**
 * Normalises free text: collapses whitespace and line breaks, tidies
 * commas, and Title-Cases words (keeping numbers and common acronyms
 * uppercase). Safe to run repeatedly on already-formatted text.
 */
export function normalizeAddressText(raw: string | null | undefined): string {
  if (!raw) return "";

  return raw
    .replace(/[\r\n]+/g, ", ") // multi-line input -> one line
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ") // "a ,b" -> "a, b"
    .replace(/(,\s*){2,}/g, ", ") // ", ," -> ","
    .replace(/^[,\s]+|[,\s]+$/g, "") // leading/trailing commas
    .split(" ")
    .map(formatWord)
    .join(" ");
}

/**
 * Builds the single-line address saved on the order:
 *   "No 7, Jalan Wangsa Perkasa 1, 53300 Kuala Lumpur"
 */
export function formatDeliveryAddress(
  line: string,
  postcode: string,
  state: string,
): string {
  const street = normalizeAddressText(line);
  const locality = [postcode.trim(), state.trim()].filter(Boolean).join(" ");
  return [street, locality].filter(Boolean).join(", ");
}
