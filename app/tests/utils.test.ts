import { expect, test } from "vitest";
import { bytesNeededForState } from "~/state";
import { getBit, getLastTurn, setBit, setBitAs, unsetBit } from "~/utils";

test("getBit works", () => {
  const xBitset = new Uint8Array([0b10001001, 0b10010000]);

  expect(getBit(xBitset, 0)).toBe(1);
  expect(getBit(xBitset, 1)).toBe(0);
  expect(getBit(xBitset, 7)).toBe(1);
  expect(getBit(xBitset, 8)).toBe(1);
  expect(getBit(xBitset, 10)).toBe(0);
  expect(getBit(xBitset, 11)).toBe(1);
  expect(getBit(xBitset, 12)).toBe(0);
});

test("setBit works", () => {
  const bitset = new Uint8Array([0b00001001, 0b10010000]);
  let expectedBitset = new Uint8Array([0b10001001, 0b10010000]);
  setBit(bitset, 0);

  expect(bitset).toStrictEqual(expectedBitset);
});

test("unsetBit works", () => {
  const bitset = new Uint8Array([0b10001001, 0b10010000]);
  let expectedBitset = new Uint8Array([0b00001001, 0b10010000]);
  unsetBit(bitset, 0);

  expect(bitset).toStrictEqual(expectedBitset);
});

test("setBitAs works", () => {
  const bitset = new Uint8Array([0b00001001, 0b10010000]);
  let expectedBitset = new Uint8Array([0b10011001, 0b00010000]);
  setBitAs(bitset, 0, 1);
  setBitAs(bitset, 3, 1);
  setBitAs(bitset, 8, 0);

  expect(bitset).toStrictEqual(expectedBitset);
});

test("bytesNeededForState", () => {
  expect(bytesNeededForState(4_782_969)).toBe(597_872);
});

test("getLastTurn", () => {
  expect(getLastTurn(0, 1)).toBe("o");
  expect(getLastTurn(0, 2)).toBe("x");
  expect(getLastTurn(1, 1)).toBe("x");
  expect(getLastTurn(1, 2)).toBe("o");
  expect(getLastTurn(45000, 2)).toBe("x");
  expect(getLastTurn(45000, 5)).toBe("o");
  expect(getLastTurn(45001, 3)).toBe("x");
  expect(getLastTurn(45001, 6)).toBe("o");
});
