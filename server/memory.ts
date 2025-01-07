import { LEVELS, MAX_LEVEL } from "config";
import { type Move } from "~/protocol";
import { getBit, getNextTurnFromMoveCount, writeSnapshot } from "~/utils";
import { SequenceLog } from "./sequence-log";
import { GameState } from "~/game-state";
import { checkWin } from "~/game";

export const sequences = new SequenceLog();
export const memoryState = new GameState(LEVELS);

function beginWritingSnapshot(filename: string, rateMS: number) {
  setInterval(async () => {
    const buff = new Uint8Array(memoryState.getBuffer());
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
  memoryState.setBuffer(buff);
  sequences.setCurrent(memoryState.sequenceNumber);
}

/**
 * Where most of the logic to the game is, this will likely be done in an embedded function in redis
 * @param xBitset
 * @param oBitset
 */
export function isMoveValid(
  move: Move,
  xBitset: Uint8Array,
  oBitset: Uint8Array,
  userTeam: "x" | "o"
): boolean {
  const { board, cell, sequence } = move;
  // find the boards,
  const boardStartIndex = board * 9;

  // check that the level is playable
  if (move.level !== MAX_LEVEL) {
    console.error("Invalid move level");
    return false;
  }

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
    console.error("Invalid move sequence");
    return false;
  }

  // make sure cell is empty in both bitsets
  const cellEmpty =
    getBit(xBitset, boardStartIndex + cell) === 0 &&
    getBit(oBitset, boardStartIndex + cell) === 0;

  if (!cellEmpty) {
    console.error("Cell isn't empty");
    return false;
  }

  // make sure this board hasn't already been won
  if (checkWin(board, xBitset, oBitset) !== null) {
    console.error("Board has already been finished");
    return false;
  }

  const next = getNextTurnFromMoveCount(movesMade, board);

  if (next !== userTeam) {
    console.error("Not user's team's turn");
    return false;
  }

  return true;
}

export { beginWritingSnapshot, loadSnapshot };
