import { assert } from "chai";
import { describe, test } from "mocha";
import { lexSequence } from "../src";

describe("lex-sequence", () => {
  for (const BASE of [4, 10, 16, 26, 36, 52, 64, 128]) {
    test("invalid base", () => {
      for (const invalidBase of [2, 3, 25, -1, 0.5, NaN]) {
        assert.throws(() => lexSequence(invalidBase));
      }
    });

    describe(`base ${BASE}`, () => {
      const { sequence, sequenceInv, sequenceInvSafe, successor } =
        lexSequence(BASE);

      // The first 10k numbers in the sequence, generated with successor().
      const first10k: number[] = [];

      before(() => {
        first10k.push(0);
        for (let i = 1; i < 10000; i++) {
          first10k.push(successor(first10k.at(-1)!));
        }
      });

      if (BASE <= 36) {
        test("in lex order, no prefixes", () => {
          for (let i = 1; i < first10k.length; i++) {
            const a = first10k[i - 1].toString(BASE);
            const b = first10k[i].toString(BASE);
            assert(a < b, `${i - 1}: ${a}    ${b}`);
            assert(!b.startsWith(a), `${i - 1}: ${a}    ${b}`);
          }
        });

        test("log length", () => {
          const last = first10k.at(-1)!.toString(BASE);
          assert.isAtMost(
            last.length,
            Math.floor(Math.log(10000) / Math.log(BASE / 2)) + 1
          );
        });
      }

      test("sequence", () => {
        for (let i = 0; i < first10k.length; i++) {
          assert.strictEqual(sequence(i), first10k[i]);
        }
      });

      test("sequenceInv", () => {
        for (let i = 0; i < first10k.length; i++) {
          assert.strictEqual(sequenceInv(first10k[i]), i);
        }
        for (const invalidSeq of [-1, 0.5, NaN, BASE / 2, BASE / 2 + 1]) {
          assert.throws(() => sequenceInv(invalidSeq));
        }
      });

      test("sequenceInvSafe", () => {
        for (let i = 0; i < first10k.length; i++) {
          assert.strictEqual(sequenceInvSafe(first10k[i]), i);
        }
        for (const invalidSeq of [-1, 0.5, NaN, BASE / 2, BASE / 2 + 1]) {
          assert.strictEqual(sequenceInvSafe(invalidSeq), -1);
        }
      });
    });
  }
});
