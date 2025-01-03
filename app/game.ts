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
  console.log(xBoardValue);
  console.log(xBoardValue.toString(2));

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
