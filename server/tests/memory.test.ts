import { test, expect } from "vitest";
import { attemptMove } from "../memory";
import type { Move } from "~/protocol";

test("attemptMove", () => {
  const boards = 9;
  const bytesInBoards = Math.ceil((boards * 9) / 8);

  const xBitset = new Uint8Array(bytesInBoards);
  const oBitset = new Uint8Array(bytesInBoards);

  const move: Move = {
    board: 0,
    cell: 0,
    sequence: 0,
  };

  const result = attemptMove(move, xBitset, oBitset);

  expect(result.success).toBe(true);

  expect(oBitset[0]).toBe(128);
  expect(xBitset[0]).toBe(0);

  const retried = attemptMove(move, xBitset, oBitset);

  expect(retried.success).toBe(false);

  const retriedSameCell = attemptMove(
    { ...move, sequence: move.sequence + 1 },
    xBitset,
    oBitset
  );
  expect(retriedSameCell.success).toBe(false);

  const retriedSameSequence = attemptMove(
    { ...move, cell: move.cell + 1 },
    xBitset,
    oBitset
  );
  expect(retriedSameSequence.success).toBe(false);
});

test("X's don't overwrite O's", () => {
  const xBitset = new Uint8Array(2);
  const oBitset = new Uint8Array(2);

  // o's start since we are playing on the 0th board.
  const validMove = attemptMove(
    { board: 0, cell: 0, sequence: 0 },
    xBitset,
    oBitset
  );
  expect(validMove.success).toBe(true);
  expect(oBitset[0]).toBe(0b1000_0000);
  expect(xBitset[0]).toBe(0b0000_0000);

  const invalidMove = attemptMove(
    { board: 0, cell: 0, sequence: 1 },
    xBitset,
    oBitset
  );
  expect(invalidMove.success).toBe(false);
  expect(oBitset[0]).toBe(0b1000_0000);
  expect(xBitset[0]).toBe(0b0000_0000);
});
