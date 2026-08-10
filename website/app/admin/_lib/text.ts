/**
 * Capitalizes the first letter of each word, leaving the rest of each word
 * untouched (so intentional casing like "BBQ" stays as typed). Preserves
 * whitespace structure exactly, so it's safe to run on every keystroke in
 * a controlled input without disturbing cursor position.
 *
 *   capitalizeWords("chicken curry") -> "Chicken Curry"
 *   capitalizeWords("chicken BBQ")   -> "Chicken BBQ"
 */
export function capitalizeWords(input: string): string {
  return input
    .split(" ")
    .map((word) =>
      word.length === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}
