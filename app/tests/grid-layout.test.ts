import { expect, test } from "vitest";
import { calculateBoardId, getGridRowColFromBoardId } from "~/grid-layout";

test("can find board ID on level 0", () => {
  const boardId = calculateBoardId(0, 0, 0);
  expect(boardId).toBe(0);
});

test("can find board ID on level 1", () => {
  expect(calculateBoardId(1, 0, 0)).toBe(0);
  expect(calculateBoardId(1, 0, 1)).toBe(1);
  expect(calculateBoardId(1, 0, 2)).toBe(2);
  expect(calculateBoardId(1, 1, 0)).toBe(3);
  expect(calculateBoardId(1, 1, 2)).toBe(5);
  expect(calculateBoardId(1, 2, 2)).toBe(8);
});

test("can find board ID on level 2", () => {
  expect(calculateBoardId(2, 0, 0)).toBe(0);
  expect(calculateBoardId(2, 0, 1)).toBe(1);
  expect(calculateBoardId(2, 3, 3)).toBe(36);
  expect(calculateBoardId(2, 6, 3)).toBe(63);
  expect(calculateBoardId(2, 4, 6)).toBe(48);
  expect(calculateBoardId(2, 8, 8)).toBe(80);
});

test("can find board ID on level 3", () => {
  expect(calculateBoardId(3, 8, 8)).toBe(80);
  expect(calculateBoardId(3, 6, 21)).toBe(225);
});

test("can find board ID on level 4", () => {
  expect(calculateBoardId(4, 8, 8)).toBe(80);
  expect(calculateBoardId(4, 0, 27)).toBe(729);
});

//////////

test("getRowColFromBoardId level 0", () => {
  const { row, col } = getGridRowColFromBoardId(0, 0);
  expect(row).toBe(0);
  expect(col).toBe(0);
});

test("getRowColFromBoardId level 1", () => {
  // (row, col) => boardId
  // (0, 0) => 0
  let result = getGridRowColFromBoardId(1, 0);
  expect(result).toEqual({ row: 0, col: 0 });

  // (0, 1) => 1
  result = getGridRowColFromBoardId(1, 1);
  expect(result).toEqual({ row: 0, col: 1 });

  // (0, 2) => 2
  result = getGridRowColFromBoardId(1, 2);
  expect(result).toEqual({ row: 0, col: 2 });

  // (1, 0) => 3
  result = getGridRowColFromBoardId(1, 3);
  expect(result).toEqual({ row: 1, col: 0 });

  // (1, 2) => 5
  result = getGridRowColFromBoardId(1, 5);
  expect(result).toEqual({ row: 1, col: 2 });

  // (2, 2) => 8
  result = getGridRowColFromBoardId(1, 8);
  expect(result).toEqual({ row: 2, col: 2 });
});

test("getRowColFromBoardId level 2", () => {
  // (0, 0) => 0
  let result = getGridRowColFromBoardId(2, 0);
  expect(result).toEqual({ row: 0, col: 0 });

  // (0, 1) => 1
  result = getGridRowColFromBoardId(2, 1);
  expect(result).toEqual({ row: 0, col: 1 });

  // (3, 3) => 36
  result = getGridRowColFromBoardId(2, 36);
  expect(result).toEqual({ row: 3, col: 3 });

  // (6, 3) => 63
  result = getGridRowColFromBoardId(2, 63);
  expect(result).toEqual({ row: 6, col: 3 });

  // (4, 6) => 48
  result = getGridRowColFromBoardId(2, 48);
  expect(result).toEqual({ row: 4, col: 6 });

  // (8, 8) => 80
  result = getGridRowColFromBoardId(2, 80);
  expect(result).toEqual({ row: 8, col: 8 });
});

test("getRowColFromBoardId level 3", () => {
  // (8, 8) => 80
  let result = getGridRowColFromBoardId(3, 80);
  expect(result).toEqual({ row: 8, col: 8 });

  // (6, 21) => 225
  result = getGridRowColFromBoardId(3, 225);
  expect(result).toEqual({ row: 6, col: 21 });
});

test("getRowColFromBoardId level 4", () => {
  // (8, 8) => 80
  let result = getGridRowColFromBoardId(4, 80);
  expect(result).toEqual({ row: 8, col: 8 });

  // (0, 27) => 729
  result = getGridRowColFromBoardId(4, 729);
  expect(result).toEqual({ row: 0, col: 27 });
});
