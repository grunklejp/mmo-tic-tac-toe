import { MAX_LEVEL } from "config";
import type { GameState } from "./game-state";
import type { Move } from "./protocol";
import { setBit } from "./utils";

// prettier-ignore
const winConditionMasks = [
  0b111_000_000,
  0b000_111_000,
  0b000_000_111,
  0b100_100_100,
  0b010_010_010,
  0b001_001_001,
  0b100_010_001,
  0b001_010_100,
];

export function checkWin(
  board: number,
  xBitset: Uint8Array,
  oBitset: Uint8Array
): "x" | "o" | null {
  const xBoardValue = getBoardValue(board, xBitset);
  const oBoardValue = getBoardValue(board, oBitset);

  for (let mask of winConditionMasks) {
    if (checkWinCon(xBoardValue, mask)) {
      return "x";
    }

    if (checkWinCon(oBoardValue, mask)) {
      return "o";
    }
  }

  return null;
}

export function checkWinCon(value: number, mask: number) {
  return (value & mask) === mask;
}

/**
 * Returns a 9bit value of a given board number
 */
export function getBoardValue(board: number, bitset: Uint8Array): number {
  const startBitIndex = board * 9;
  const startByteIndex = Math.floor(startBitIndex / 8);
  const endByteIndex = startByteIndex + 1;
  const startOffset = startBitIndex % 8;
  const endOffset = startOffset + 1;

  const mostSignificant = (bitset[startByteIndex] << startOffset) & 0b1111_1111; // we & against 8 bit mask here to clop off overflow

  // shifting by the extra 1 makes this a 9 bit value
  const mostSignificant9bit = mostSignificant << 1;

  //  convert to 9 bits first
  const amountToShiftRight = 9 - endOffset;
  const leastSignificant9Bits =
    (bitset[endByteIndex] << 1) >> amountToShiftRight;

  const result = mostSignificant9bit ^ leastSignificant9Bits;
  return result;
}

/**
 * Checks if a board is stalemate, assumes board has not been won.
 */
export function isDrawLazy(
  board: number,
  xBitset: Uint8Array,
  oBitset: Uint8Array
) {
  const xVal = getBoardValue(board, xBitset);
  const oVal = getBoardValue(board, oBitset);
  const total = xVal | oVal;
  return total === Math.pow(2, 9) - 1;
}

/**
 * places a peice on the give half of a board
 * DOES NO VALIDATION
 * @param move
 * @param turnBitset
 */
export function makeMove(move: Move, turnBitset: Uint8Array) {
  const boardStartIndex = move.board * 9;
  setBit(turnBitset, boardStartIndex + move.cell);
}

/**
 * Clears a board at a specific level and all boards above it in the board tree
 */
export function clearBoard(state: GameState, board: number, level: number) {
  let startBit = board;

  for (let i = level; i <= MAX_LEVEL; i++) {
    const xBitset = state.bitset(i, "x");
    const oBitset = state.bitset(i, "o");
    startBit = startBit * 9;
    const boardsToClearThisLevel = Math.pow(9, i - level);

    clearBoardsFromBuffer(startBit, boardsToClearThisLevel, xBitset);
    clearBoardsFromBuffer(startBit, boardsToClearThisLevel, oBitset);
  }
}

export function clearBoardsFromBuffer(
  startBit: number,
  count: number,
  bitset: Uint8Array
) {
  const endBit = count * 9 + startBit;
  const startByte = Math.floor(startBit / 8);
  const endByte = Math.floor(endBit / 8);
  const startBitOffset = startBit % 8;
  const endBitOffset = endBit - endByte * 8;

  const startMask = ~((255 >> startBitOffset) & 0xff); // Bits to keep
  bitset[startByte] = bitset[startByte] & startMask;

  const endMask = (255 >> endBitOffset) & 0xff; // Bits to keep
  bitset[endByte] = bitset[endByte] & endMask;

  if (startByte + 1 <= endByte - 1) {
    bitset.fill(0, startByte + 1, endByte);
  }
}
