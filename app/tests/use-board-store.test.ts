import { expect, test } from "vitest";
import { buildBoard } from "~/hooks/use-board-store.js";

test("builds board by combinding 2 bitset at byte offset 0", () => {
  const expectedBoard = ["x", "o", null, "o", "x", null, "o", "x", null];

  const xBitset = new Uint8Array([0b10001001, 0b00000000]);
  const oBitset = new Uint8Array([0b01010010, 0b00000000]);

  const board = buildBoard(0, xBitset, oBitset);

  expect(board).toStrictEqual(expectedBoard);
});
