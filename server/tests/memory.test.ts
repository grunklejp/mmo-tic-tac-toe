import { test, expect } from "vitest";
import { attemptMove } from "../memory";
import type { OrderedMove } from "~/protocol";

test("attemptMove", () => {
  const boards = 9;
  const bytesInBoards = Math.ceil((boards * 9) / 8);

  const xBitset = new Uint8Array(bytesInBoards);
  const oBitset = new Uint8Array(bytesInBoards);

  const move: OrderedMove = {
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
