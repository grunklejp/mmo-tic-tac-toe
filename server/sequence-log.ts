export class SequenceLog {
  private max: number;
  private min: number;
  private log: Map<number, Uint8Array>;

  constructor(startingSequenceNumber: number = 0) {
    this.min = startingSequenceNumber;
    this.max = startingSequenceNumber;
    this.log = new Map();
  }

  append(move: Uint8Array) {
    this.max++;
    this.log.set(this.max, move);
    console.log("appending sequence", this.max, move);
    console.log("current log size", this.log.size);
  }

  /**
   * sets the min value equal to the max value then flushes the log
   */
  flush() {
    this.min = this.max;
    this.log.clear();
  }

  /**
   * flattens all moves into a single uint8array
   */
  flatten(): Uint8Array {
    const moves = this.log.values();
    const first = moves.next();

    if (!first.value) {
      return new Uint8Array();
    }

    const moveByteLength = first.value.byteLength;

    let offset = 0;
    const buffer = new Uint8Array(moveByteLength * this.log.size);
    buffer.set(first.value, offset);
    offset += moveByteLength;

    for (const move of moves) {
      buffer.set(move, offset);
      offset += moveByteLength;
    }

    return buffer;
  }

  get current() {
    return this.max;
  }

  get earliest() {
    return this.min;
  }

  setCurrent(newNumber: number) {
    this.min = newNumber;
    this.max = newNumber;
  }
}
