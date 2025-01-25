import { BOARD_COUNT } from "config";

export function getBit(bitset: Uint8Array, index: number) {
  const byteIndex = Math.floor(index / 8);
  const bitIndex = index % 8;

  if (byteIndex > bitset.length - 1) {
    console.log("byteIndex:", byteIndex, "bitset.length", bitset.length);
    throw new Error("invalid index, bitset too small for index range");
  }

  return (bitset[byteIndex] >> (7 - bitIndex)) & 1;
}

export function setBit(bitset: Uint8Array, index: number) {
  const byteIndex = Math.floor(index / 8);
  const bitIndex = index % 8;

  const mask = 1 << (7 - bitIndex);

  bitset[byteIndex] = bitset[byteIndex] | mask;
}

export function unsetBit(bitset: Uint8Array, index: number) {
  const byteIndex = Math.floor(index / 8);
  const bitIndex = index % 8;

  const mask = 1 << (7 - bitIndex);

  bitset[byteIndex] = bitset[byteIndex] & ~mask;
}

export function setBitAs(bitset: Uint8Array, index: number, value: number) {
  if (value !== 0 && value !== 1) {
    throw new Error("Invariant failed, must pass value as 0 or 1");
  }

  if (value) {
    setBit(bitset, index);
  } else {
    unsetBit(bitset, index);
  }
}

export function generateRandomState(bitset: Uint8Array) {
  const chunkSize = 65_536;
  for (let i = 0; i < bitset.length; i += chunkSize) {
    // Create a view for the current chunk
    const chunk = bitset.subarray(i, i + chunkSize);
    crypto.getRandomValues(chunk);
  }
}

export async function writeSnapshot(
  bitset: Uint8Array,
  sequenceNumber: number,
  filename: string
) {
  const view = new DataView(
    bitset.buffer,
    bitset.byteOffset,
    bitset.byteLength
  );
  view.setUint32(0, sequenceNumber, true);
  await Bun.write(filename, bitset);
}

export async function testing_createRandomSnapshotFile() {
  const bitsNeeded = BOARD_COUNT * 9;
  const bytesNeeded = Math.ceil(bitsNeeded / 8);

  const bitset = new Uint8Array(4 + bytesNeeded * 2);

  generateRandomState(bitset);
  writeSnapshot(bitset, 1, "snapshot.bin");
}

/**
 * Determines whose turn it is for this current board.
 * If the board index is even that means O's started so we simply count
 * the the number of turns already made to determine who has the next turn
 *
 * We could likely do this faster by using the underlying bitset directly, need to profile both cases if rendering is laggy
 *
 * @param board
 * @param boardIdx
 */
export function getNextTurn(
  board: ("x" | "o" | null)[],
  boardIdx: number
): "x" | "o" {
  let movesMade = 0;
  for (let i = 0; i < 9; i++) {
    if (board[i] !== null) {
      movesMade++;
    }
  }

  return getLastTurn(boardIdx, movesMade) === "x" ? "o" : "x";
}

export function getNextTurnFromMoveCount(
  movesMade: number,
  boardIdx: number
): "x" | "o" {
  if (boardIdx % 2 === 0) {
    // O's started

    if (movesMade % 2 === 0) {
      return "o";
    } else {
      return "x";
    }
  } else if (boardIdx % 2 === 1) {
    // X's started
    if (movesMade % 2 === 0) {
      return "x";
    } else {
      return "o";
    }
  }

  throw new Error("Invariant failed");
}

export function getLastTurn(boardNumber: number, movesMade: number) {
  if (boardNumber % 2 === 0) {
    // O's started

    if (movesMade % 2 === 0) {
      return "x";
    } else {
      return "o";
    }
  } else if (boardNumber % 2 === 1) {
    // X's started
    if (movesMade % 2 === 0) {
      return "o";
    } else {
      return "x";
    }
  }

  throw new Error("Invariant failed");
}

export function asBitString(val: number | Uint8Array) {
  if (typeof val === "number") {
    return val.toString(2).padStart(8, "0");
  }

  return Array.from(val).map((v) => v.toString(2).padStart(8, "0"));
}

export type Position = {
  level: number;
  board: number;
  cell: number;
};
