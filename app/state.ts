import { BOARD_COUNT } from "config";
import { getOBitset, getXBitset } from "./utils";
import { checkWin } from "./game";

export function bytesNeededForState(totalCells: number) {
  // we ceil here incase we have a fraction and need an extra byte
  return Math.ceil(totalCells / 8);
}

const cellsCount = BOARD_COUNT * 9;
const boardsSizeInBytes = bytesNeededForState(cellsCount);

const initialSnapshot = new ArrayBuffer(boardsSizeInBytes * 2 + 4);
export let xBitset = getXBitset(initialSnapshot, boardsSizeInBytes);
export let oBitset = getOBitset(initialSnapshot, boardsSizeInBytes);
export let snapshotSequenceNum = 0;

export function parseSnapshot(buff: ArrayBuffer) {
  const expectedTotalByteLength = 4 + bytesNeededForState(BOARD_COUNT * 9) * 2;

  if (buff.byteLength !== expectedTotalByteLength) {
    throw new Error(
      `Invariant failed, expected buff length (${buff.byteLength}) to be ${expectedTotalByteLength} bytes`
    );
  }
  const view = new DataView(buff);
  snapshotSequenceNum = view.getInt32(0, true);

  xBitset = getXBitset(buff, boardsSizeInBytes);
  oBitset = getOBitset(buff, boardsSizeInBytes);
}

export function hasWinner(board: number) {
  return checkWin(board, xBitset, oBitset) !== null;
}
