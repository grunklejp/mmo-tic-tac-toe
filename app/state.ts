import { BOARD_COUNT } from "config";
import { getOBitset, getXBitset } from "./utils";

export function bytesNeededForState(totalCells: number) {
  // we ceil here incase we have a fraction and need an extra byte
  return Math.ceil(totalCells / 8);
}

const cellsCount = BOARD_COUNT * 9;
const boardsSizeInBytes = bytesNeededForState(cellsCount);

const initialSnapshot = new ArrayBuffer(boardsSizeInBytes * 2 + 4);
export let xBitset = getXBitset(initialSnapshot, boardsSizeInBytes);
export let oBitset = getOBitset(initialSnapshot, boardsSizeInBytes);
let sequenceNumber = 0;

export function parseSnapshot(buff: ArrayBuffer) {
  const expectedTotalByteLength = 4 + bytesNeededForState(BOARD_COUNT * 9) * 2;

  // TODO: 🐞 fix the bug that is tripping here on the client
  if (buff.byteLength !== expectedTotalByteLength) {
    throw new Error(
      `Invariant failed, expected buff length (${buff.byteLength}) to be ${expectedTotalByteLength} bytes`
    );
  }
  const view = new DataView(buff);
  sequenceNumber = view.getInt32(0);

  xBitset = getXBitset(buff, boardsSizeInBytes);
  oBitset = getOBitset(buff, boardsSizeInBytes);
}
