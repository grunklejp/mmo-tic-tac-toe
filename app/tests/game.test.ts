import { expect, test } from "vitest";
import { checkWin, checkWinCon, getBoardValue } from "~/game";

test("getBoardValue gets 0th board", () => {
  const bitset = new Uint8Array([0b0001_0000, 0b1100_1000, 0b1100_1000]);
  const value = getBoardValue(0, bitset);

  expect(value).toBe(0b000_100_001);
});

test("getBoardValue gets 1st board", () => {
  const bitset = new Uint8Array([0b0001_0000, 0b1100_1000, 0b1100_1000]);
  const value = getBoardValue(1, bitset);

  expect(value).toBe(0b100_100_011);
});

test("getBoardValue gets 2nd board", () => {
  const bitset = new Uint8Array([
    0b000_100_00, 0b1_100_100_0, 0b11_001_000, 0b111_111_11,
  ]);
  const value = getBoardValue(2, bitset);

  expect(value).toBe(0b001_000_111);
});

test("checkWinCon works", () => {
  const boardX = 0b111_001_010;
  const boardX2 = 0b100_001_010;
  const boardX3 = 0b100_011_001;

  expect(checkWinCon(boardX, 0b111_000_000)).toBe(true);
  expect(checkWinCon(boardX, 0b000_111_000)).toBe(false);
  expect(checkWinCon(boardX2, 0b000_111_000)).toBe(false);
  expect(checkWinCon(boardX3, 0b100_010_001)).toBe(true);
  expect(checkWinCon(483, 0b111_000_000)).toBe(true);
});

// TODO: test all win conditions
test("checkWin to work", () => {
  const xbitset = new Uint8Array([0b0001_0000, 0b0111_1000, 0b1100_1000]);
  const obitset = new Uint8Array([0b0001_0000, 0b1000_0010, 0b0010_1000]);

  const result = checkWin(1, xbitset, obitset);

  expect(result).toBe("x");
});
