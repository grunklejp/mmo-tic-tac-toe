import { expect, test } from "vitest";
import { calculateBoardId } from "~/grid-layout";

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
