# lex-sequence

A sequence of strings that are lexicographically ordered and grow slowly.

```bash
npm i --save lex-sequence
```

## About

This library provides a sequence of strings that are lexicographically ordered (in order by `<`) and grow slowly (a few 1-char strings, then some 2-char strings, then many 3-char strings, etc.).

For example, the base-10 sequence is

```js
"0", "1", "2", "3", "4", "50", "51", "52", ..., "73", "74", "750", "751", ...
```

There are 5 length-1 strings, 5^2 length-2 strings, 5^3 length-3 strings, etc. So the n-th string is only as long as the base-5 encoding of n. (For shorter strings, you can use a base larger than 10.)

Additional properties:

- No string is a prefix of another. E.g., we skip from `"4"` to `"50"` without emitting `"5"`.
- The strings are internally represented as numbers; these numbers are in numeric order, in addition to lexicographic order. (You obtain strings by encoding those numbers in the chosen base.)

### Q & A

1. Why not ordinary integers?

   - They are not lexicographically ordered: `"10" < "2"`.

2. Why not fixed-length strings? (`"000"`, `"001"`, `"002"`, ..., `"999"`)

   - That limits you to a fixed number of strings, instead of an indefinite number. Also, the first few strings (which you'll probably use most often) are more than one char long.

3. How about [lexicographic-integer](https://www.npmjs.com/package/lexicographic-integer)?

   - That package implements the same idea, but only in base 16 or 256, with strings that are generally a bit longer than ours.

4. What might I use this library for?
   - Naming file versions so that they show up in order.
   - Encoding a timestamp-plus-tiebreaker as a lexicographically-ordered string `` `${timestamp}-${tiebreaker}` ``, so that you can sort by this one field instead of two. (E.g., [Lamport timestamps](https://en.wikipedia.org/wiki/Lamport_timestamp) with a process ID tiebreaker.)
   - I use it in [position-strings](https://github.com/mweidner037/position-strings/#readme), to assign slowly-increasing strings to sequential positions.

## API

Specify your base to get the functions:

```ts
import { lexSequence } from "lex-sequence";

const BASE = 10;
const { sequence, sequenceInv, sequenceInvSafe, successor } = lexSequence(BASE);
```

`sequence(n)` returns the n-th entry in the sequence **as an integer**, which you can then `BASE` encode:

```ts
for (let n = 0; n < 100; n++) {
  console.log(sequence(n).toString(BASE));
}
// Prints "0", "1", ..., "4", "50", ..., "74", "750", ..., "819"
```

`sequenceInv(seq)` converts a sequence member back to its index:

```ts
console.log(sequenceInv(819)); // Prints 99
```

"Safe" version that will return -1 instead of throwing an error, if `seq` is not a valid sequence member:

```ts
console.log(sequenceInvSafe(5) === -1); // Prints true
```

`successor(seq)` is a fast way to go from `sequence(n)` to `sequence(n+1)`:

```ts
let seq = 0;
for (let i = 0; i < 100; i++) {
  console.log(seq.toString(BASE));
  seq = successor(seq);
}
// Prints "0", "1", ..., "4", "50", ..., "74", "750", ..., "819"
```

## Misc

- `BASE` must even and >= 4. For a base-2 (binary) sequence, binary-encode the numbers from the base-4 sequence.
- You can use any alphabet to encode numbers as strings, so long as it consists of `BASE` chars and they are in lexicographic order. E.g., you can use base64 chars in the **non-standard, lexicographic** ordering `+/0-9A-Za-z`.
- The `BASE` encoding of `sequence(n)` is always as long as the `BASE/2` encoding of `n`.
- The sequence is as follows, with examples in base 10:
  1. Starting with 0, enumerate `(BASE/2)^1` numbers. (0, 1, ..., 4.)
  2. Add 1, multiply by `BASE`, then enumerate `(BASE/2)^2` numbers.
     (50, 51, ..., 74.)
  3. Add 1, multiply by `BASE`, then enumerate `(BASE/2)^3` numbers.
     (750, 751, ..., 874.)
  4. Repeat this pattern indefinitely, enumerating
     `(BASE/2)^d` length-d numbers for each d >= 1. Imagining a decimal place
     in front of each number, each d consumes 2^(-d) of the unit interval,
     so we never "reach 1" (overflow to d+1 digits when
     we meant to use d digits).
- I have not found an existing source describing the sequence, but I believe it is related to [Elias gamma coding](https://en.wikipedia.org/wiki/Elias_gamma_coding).
