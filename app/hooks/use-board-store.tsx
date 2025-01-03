import { BOARD_COUNT } from "config";
import { useEffect, useState } from "react";
import type { Move } from "~/protocol";
import { oBitset, xBitset } from "~/state";
import { getBit, getLastTurn, setBitAs } from "~/utils";

console.log("x length", xBitset.length);
console.log("o lenth", oBitset.length);

export type ClientMove = {
  board: number;
  cell: number;
  value: "x" | "o";
};

// const chunkSize = 65_536;
// for (let i = 0; i < bitset.length; i += chunkSize) {
//   // Create a view for the current chunk
//   const chunk = bitset.subarray(i, i + chunkSize);
//   crypto.getRandomValues(chunk);
// }

const listeners = new Map<number, Function>();

function batchUpdateNBits(n: number) {
  for (let i = 0; i < n; i++) {
    const randomBoard = Math.floor((Math.random() * BOARD_COUNT) / 3);
    const randomCell = Math.floor(Math.random() * 9);
    const randomTurn = Math.floor(Math.random() * 2) == 1 ? "x" : "o";
    makeTurnAndRender({
      board: randomBoard,
      cell: randomCell,
      value: randomTurn,
    });
  }
}

// setInterval(() => {
//   batchUpdateNBits(40000 / 30);
// }, 34); // 30fps

/**
 * Places a piece on the specified board, does no validation on whether the move is allowed.
 * @param board
 * @param cell
 * @param value
 */
export function makeTurnAndRender(move: ClientMove) {
  makeTurn(move);
  const cb = listeners.get(move.board);
  if (typeof cb === "function") {
    cb();
  }
}

export function makeTurn(move: ClientMove) {
  const { board, cell, value } = move;
  const bitIndex = board * 9 + cell;
  if (value === "x") {
    setBitAs(xBitset, bitIndex, 1);
  } else {
    setBitAs(oBitset, bitIndex, 1);
  }
}

export function useBoardStore(boardIdx: number) {
  const [_, setState] = useState(0);
  const board = buildBoard(boardIdx, xBitset, oBitset);

  useEffect(() => {
    listeners.set(boardIdx, () => setState((s) => (s === 1 ? 0 : 1)));

    return () => {
      const deleted = listeners.delete(boardIdx);
      if (!deleted) {
        console.error(
          "oops we couldn't delete that boardIdx",
          "boardIdx: ",
          boardIdx
        );
      }
    };
  }, []);

  return { board };
}

// TODO: test this...
export function buildBoard(
  boardIdx: number,
  xBitset: Uint8Array,
  oBitset: Uint8Array
): Array<"x" | "o" | null> {
  const result: Array<"x" | "o" | null> = [];

  for (let i = 0; i < 9; i++) {
    const index = boardIdx * 9 + i;
    const xBit = getBit(xBitset, index);
    const oBit = getBit(oBitset, index);

    if (xBit) {
      result.push("x");
    } else if (oBit) {
      result.push("o");
    } else {
      result.push(null);
    }
  }

  return result;
}

export function toClientMove(move: Move): ClientMove {
  const movesMade = move.sequence + 1;
  const turn = getLastTurn(move.board, movesMade);
  return {
    board: move.board,
    cell: move.cell,
    value: turn,
  };
}

export function fromClientMove(
  move: ClientMove,
  xBitset: Uint8Array,
  oBitset: Uint8Array
): Move {
  const sequence = countMoves(move.board, xBitset, oBitset);

  return {
    board: move.board,
    cell: move.cell,
    sequence: sequence,
  };
}

export function countMoves(
  boardIdx: number,
  xBitset: Uint8Array,
  oBitset: Uint8Array
) {
  let count = 0;

  for (let i = 0; i < 9; i++) {
    const index = boardIdx * 9 + i;
    const xBit = getBit(xBitset, index);
    const oBit = getBit(oBitset, index);

    if (xBit || oBit) {
      count++;
    }
  }
  return count;
}
