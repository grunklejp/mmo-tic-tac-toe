import { LEVELS } from "config";
import { expect, test } from "vitest";
import {
  isDrawLazy,
  checkWin,
  checkWinCon,
  clearBoard,
  clearBoardsFromBuffer,
  getBoardValue,
  makeMove,
} from "~/game";
import { GameState } from "~/game-state";
import type { Move } from "~/protocol";

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

test("clears boards from offset", () => {
  const buff = new Uint8Array([
    0b0110_0111, 0b0110_0111, 0b0110_0111, 0b0110_0111, 0b0110_0111,
  ]);

  // console.log(asBitString(buff));

  clearBoardsFromBuffer(1, 1, buff);
  clearBoardsFromBuffer(19, 2, buff);

  // console.log(asBitString(buff));

  expect(buff[0]).toBe(0b0000_0000);
  expect(buff[1]).toBe(0b0010_0111);
  expect(buff[2]).toBe(0b0110_0000);
  expect(buff[3]).toBe(0b0000_0000);
  expect(buff[4]).toBe(0b0000_0111);
});

test("clears board from GameState", () => {
  const state = new GameState(1);
  const bitset = state.bitset(1, "o");
  bitset[0] = 0b1110_0111;
  clearBoardsFromBuffer(0, 1, bitset);

  expect(bitset[0]).toBe(0);
});

test("clears layer 6 board", () => {
  const state = new GameState(LEVELS);
  const move: Move = {
    level: 6,
    board: 0,
    cell: 7,
    sequence: 0,
  };
  makeMove(move, state.bitset(6, "o"));
  clearBoard(state, 0, 6);

  expect(state.bitset(6, "o")[0]).toBe(0);
});

test("clears layer 5 & 6 boards", () => {
  const state = new GameState(LEVELS);

  const move: Move = {
    level: 5,
    board: 0,
    cell: 7,
    sequence: 0,
  };

  makeMove(
    {
      level: 6,
      board: 0,
      cell: 7,
      sequence: 0,
    },
    state.bitset(6, "o")
  );

  makeMove(
    {
      level: 6,
      board: 2,
      cell: 4,
      sequence: 0,
    },
    state.bitset(6, "o")
  );

  // this one shouldn't be cleared
  makeMove(
    {
      level: 6,
      board: 9,
      cell: 4,
      sequence: 0,
    },
    state.bitset(6, "o")
  );
  makeMove(
    {
      level: 5,
      board: 0,
      cell: 7,
      sequence: 0,
    },
    state.bitset(5, "o")
  );

  // console.log(asBitString(state.bitset(6, "o")));

  clearBoard(state, 0, 5);

  expect(state.bitset(5, "o")[0]).toBe(0);
  expect(state.bitset(6, "o")[0]).toBe(0);
  expect(state.bitset(6, "o")[10]).not.toBe(0);
});

test("check stalemate works", () => {
  const xBitset = new Uint8Array([0b1010_1010, 0b1010_1010]);
  const oBitset = new Uint8Array([0b0101_0101, 0b0101_0101]);
  const draw = isDrawLazy(0, xBitset, oBitset);

  expect(draw).toBe(true);
});
