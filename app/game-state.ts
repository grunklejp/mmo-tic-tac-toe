import { BYTES_FOR_SEQ_NUM } from "config";

export class GameState {
  private buffer: ArrayBuffer;
  levels: number;
  sequenceNumber: number = 0;
  levelByteOffsets: number[] = [];

  constructor(levels: number) {
    this.levels = levels;
    const bufferSize = this.calcBufferSize(levels);
    this.buffer = new ArrayBuffer(bufferSize);
  }

  get byteLength() {
    return this.buffer.byteLength;
  }

  bitset(level: number, side: "x" | "o"): Uint8Array {
    const bytesInLevelBitset = this.calcSizeByLevel(level) / 2;

    if (level >= this.levels) {
      throw new Error("No such level, remeber levels are 0 indexed");
    }

    if (side === "x") {
      return new Uint8Array(
        this.buffer,
        this.levelByteOffsets[level],
        bytesInLevelBitset
      );
    }

    return new Uint8Array(
      this.buffer,
      this.levelByteOffsets[level] + bytesInLevelBitset,
      bytesInLevelBitset
    );
  }

  getBuffer() {
    return this.buffer;
  }

  setBuffer(buffer: ArrayBuffer) {
    if (buffer.byteLength != this.byteLength) {
      throw new Error(
        `Invalid buffer length: expected ${this.byteLength} bytes, received ${buffer.byteLength}`
      );
    }

    if (BYTES_FOR_SEQ_NUM !== 4) {
      throw new Error(
        "Invariant failed, the code below this is expecting BYTES_FOR_SEQ_NUM to be an Uint32"
      );
    }

    const view = new DataView(buffer);
    this.sequenceNumber = view.getUint32(0, true);

    this.buffer = buffer;
  }

  private calcBufferSize(levels: number): number {
    let result = BYTES_FOR_SEQ_NUM;
    this.levelByteOffsets = [BYTES_FOR_SEQ_NUM]; // 0th level starts after sequence num
    for (let i = 0; i < levels; i++) {
      const bytesPerLevel = this.calcSizeByLevel(i);
      result += bytesPerLevel;
      if (i !== levels) {
        // don't need to set the offset for the level above our last one.
        this.levelByteOffsets[i + 1] = this.levelByteOffsets[i] + bytesPerLevel;
      }
    }

    return result;
  }

  private calcSizeByLevel(level: number): number {
    const boardsPerLevel = Math.pow(9, level);
    const cellsPerLevel = boardsPerLevel * 9;
    const bytesNeedForCells = bytesNeededForNBits(cellsPerLevel);
    return 2 * bytesNeedForCells; // we multiply by 2 here cause we need 2 bits for each X or O state
  }
}

export function bytesNeededForNBits(N: number) {
  // we ceil here incase we have a fraction and need an extra byte
  return Math.ceil(N / 8);
}
