/**
 * Base 52 encoding using letters (with "digits" in order by code point).
 */
export function stringifyBase52(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new Error(`Not a nonnegative integer: ${n}`);
  }

  if (n === 0) return "A";
  const codes: number[] = [];
  while (n > 0) {
    const digit = n % 52;
    codes.unshift((digit >= 26 ? 71 : 65) + digit);
    n = Math.floor(n / 52);
  }
  return String.fromCharCode(...codes);
}

export function parseBase52(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    let digit: number;
    if (97 <= code && code <= 122) {
      digit = code - 71;
    } else if (65 <= code && code <= 90) {
      digit = code - 65;
    } else {
      throw new Error(`Not a base52 string: "${s}"`);
    }
    n = 52 * n + digit;
  }
  return n;
}
