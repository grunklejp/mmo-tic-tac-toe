import { BOARD_COUNT } from "config";
import type { Move } from "~/protocol";
import {
  getBit,
  getNextTurnFromMoveCount,
  getOBitset,
  getXBitset,
  setBit,
  writeSnapshot,
} from "~/utils";
import { SequenceLog } from "./sequence-log";

export const sequences = new SequenceLog();

const bytesPerSide = Math.ceil((BOARD_COUNT * 9) / 8);

let buffer = new ArrayBuffer(4 + bytesPerSide * 2);
export let xBitset = new Uint8Array(buffer, 4, bytesPerSide);
export let oBitset = new Uint8Array(buffer, bytesPerSide + 4, bytesPerSide);

function beginWritingSnapshot(filename: string, rateMS: number) {
  setInterval(async () => {
    const buff = new Uint8Array(buffer);
    console.log(
      "writing snapshot with seqNum",
      sequences.current,
      "with content hash",
      Bun.hash(buff)
    );
    await writeSnapshot(buff, sequences.current, filename);
    sequences.flush();
  }, rateMS);
}

function loadSnapshot(buff: ArrayBuffer) {
  buffer = buff;
  xBitset = getXBitset(buff, bytesPerSide);
  oBitset = getOBitset(buff, bytesPerSide);
  const latestSequenceNum = new DataView(buff).getInt32(0, true);
  console.log("loaded sequencenumber:", latestSequenceNum);
  sequences.setCurrent(latestSequenceNum);
}

/**
 * Where most of the logic to the game is, this will likely be done in an embedded function in redis
 * TODO: fix bug - for some reason X's are overwriting O's over the long run.
 * @param xBitset
 * @param oBitset
 */
export function attemptMove(
  move: Move,
  xBitset: Uint8Array,
  oBitset: Uint8Array,
  userTeam: "x" | "o"
): { success: true } | { success: false; error: string } {
  const { board, cell, sequence } = move;
  // find the boards,
  const boardStartIndex = board * 9;

  // count the total moves
  let movesMade = 0;
  for (let i = 0; i < 9; i++) {
    const index = boardStartIndex + i;
    const xbit = getBit(xBitset, index);
    const obit = getBit(oBitset, index);

    if (xbit === 1 || obit === 1) {
      movesMade++;
    }
  }
  // make sure move sequence match
  // if we've made 3 moves the next move needs to have a sequence number of 3 (0-indexed, 4th move)
  if (sequence !== movesMade) {
    return {
      success: false,
      error: "Invalid move sequence",
    };
  }

  // make sure cell is empty in both bitsets
  const cellEmpty =
    getBit(xBitset, boardStartIndex + cell) === 0 &&
    getBit(oBitset, boardStartIndex + cell) === 0;

  if (!cellEmpty) {
    return {
      success: false,
      error: "Cell isn't empty",
    };
  }

  const next = getNextTurnFromMoveCount(movesMade, board);

  if (next !== userTeam) {
    return {
      success: false,
      error: "Not user's team's turn",
    };
  }

  // update board
  if (next === "o") {
    setBit(oBitset, boardStartIndex + cell);
  } else {
    setBit(xBitset, boardStartIndex + cell);
  }

  // TODO: fire async checkwin()

  return {
    success: true,
  };
}

export { beginWritingSnapshot, loadSnapshot };
