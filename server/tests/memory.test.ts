import { test, expect } from "vitest";
import { isMoveValid } from "../memory";
import type { Move } from "~/protocol";

test("isMoveValid", () => {
  const boards = 9;
  const bytesInBoards = Math.ceil((boards * 9) / 8);

  const xBitset = new Uint8Array(bytesInBoards);
  const oBitset = new Uint8Array(bytesInBoards);

  const move: Move = {
    board: 0,
    cell: 0,
    sequence: 0,
    level: 1,
  };

  const result = isMoveValid(move, xBitset, oBitset, "o");

  expect(result).toBe(true);
});

// test("X's don't overwrite O's", () => {
//   const xBitset = new Uint8Array(2);
//   const oBitset = new Uint8Array(2);

//   // o's start since we are playing on the 0th board.
//   const validMove = isMoveValid(
//     { board: 0, cell: 0, sequence: 0, level: 1 },
//     xBitset,
//     oBitset,
//     "o"
//   );
//   expect(validMove.success).toBe(true);
//   expect(oBitset[0]).toBe(0b1000_0000);
//   expect(xBitset[0]).toBe(0b0000_0000);

//   const invalidMove = isMoveValid(
//     { board: 0, cell: 0, sequence: 1, level: 1 },
//     xBitset,
//     oBitset,
//     "x"
//   );
//   expect(invalidMove.success).toBe(false);
//   expect(oBitset[0]).toBe(0b1000_0000);
//   expect(xBitset[0]).toBe(0b0000_0000);
// });
