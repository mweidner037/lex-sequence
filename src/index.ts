/*
  The sequence is as follows, with examples in base 10:

  1. Starting with 0, enumerate `BASE/2` numbers. (0, 1, ..., 4.)
  2. Add 1, multiply by `BASE`, then enumerate `(BASE/2)^2` numbers.
    (50, 51, ..., 74.)
  3. Add 1, multiply by `BASE`, then enumerate `(BASE/2)^3` numbers.
    (750, 751, ..., 874.)
  4. Repeat this pattern indefinitely, enumerating
    `(BASE/2)^d` length-d numbers for each d >= 1. Imagining a decimal place
    in front of each number, each d consumes 2^(-d) of the unit interval,
    so we never "reach 1" (overflow to d+1 digits when
    we meant to use d digits).
*/

/**
 * Checks that `base` is valid.
 */
function checkBase(base: number): void {
  if (!(Number.isSafeInteger(base) && base % 2 === 0 && base >= 4)) {
    throw new Error(`lex-sequence base must be an even integer >= 4: ${base}`);
  }
}

/**
 * Returns the length in `base` digits.
 */
function len(seq: number, base: number): number {
  return seq === 0 ? 1 : Math.floor(Math.log(seq) / Math.log(base)) + 1;
}

/**
 * Returns the first number in the sequence that has the given number of digits.
 */
function first(d: number, base: number): number {
  // You can calculate that the first d-digit number is BASE^d - BASE * (BASE/2)^(d-1).
  return Math.pow(base, d) - base * Math.pow(base / 2, d - 1);
}

/**
 * Returns the last number in the sequence that has the given number of digits.
 */
function last(d: number, base: number): number {
  // You can calculate that the last d-digit number is BASE^d - (BASE/2)^d - 1.
  return Math.pow(base, d) - Math.pow(base / 2, d) - 1;
}

/**
 * Given a number in the sequence, outputs the next number in the sequence.
 *
 * To yield the sequence in order, call this function repeatedly starting at 0.
 */
export function successor(seq: number, base: number): number {
  checkBase(base);

  if (seq === last(len(seq, base), base)) {
    // New length: seq -> (seq + 1) * BASE.
    return (seq + 1) * base;
  } else {
    // seq -> seq + 1.
    return seq + 1;
  }
}

/**
 * Returns the n-th number in the sequence.
 */
export function sequence(index: number, base: number): number {
  checkBase(base);

  // Each digit-length d has (BASE/2)^d values. Subtract these
  // out until we can't anymore (reached the right length).
  let remaining = index;
  let d = 1;
  for (; ; d++) {
    const valueCount = Math.pow(base / 2, d);
    if (remaining < valueCount) break;
    remaining -= valueCount;
  }
  // The number is d-digits long, and at index `remaining` within
  // the d-digit subsequence.
  // So add `remaining` to the first d-digit number.
  return remaining + first(d, base);
}

/**
 * Inverse of {@link sequence}: returns the index of `seq` in the sequence.
 *
 * If `seq` is not a member of the sequence, returns -1, unlike {@link sequenceInv}
 * which throws an error. So you can use this function to test if
 * `seq` is a member of the sequence.
 */
export function sequenceInvSafe(seq: number, base: number): number {
  checkBase(base);

  if (!(Number.isSafeInteger(seq) && seq >= 0)) return -1;

  const d = len(seq, base);
  // Check how far we are from the first d-digit number,
  // i.e., our index in the d-digit sub-sequence.
  let ans = seq - first(d, base);
  if (ans < 0 || ans >= Math.pow(base / 2, d)) {
    // Valid indexes within the d-digit sub-sequence are [0, (BASE/2)^d).
    // We are outside of that range, therefore seq is invalid.
    return -1;
  }
  // Previous digit-lengths d2 have (BASE/2)^d2 values each.
  for (let d2 = 1; d2 < d; d2++) {
    ans += Math.pow(base / 2, d2);
  }
  return ans;
}

/**
 * Inverse of {@link sequence}: returns the index of `seq` in the sequence.
 *
 * @throws If `seq` is not a member of the sequence. (To test membership
 * without a try-catch, call {@link sequenceInvSafe} and check for output -1.)
 */
export function sequenceInv(seq: number, base: number): number {
  const ans = sequenceInvSafe(seq, base);
  if (ans === -1) {
    throw new Error(`Not a lex-sequence member: ${seq}`);
  }
  return ans;
}
