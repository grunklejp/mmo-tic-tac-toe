export class SequenceLog {
  private max: number;
  private min: number;
  private log: Map<number, Uint8Array>;

  constructor(startingSequenceNumber: number = 0) {
    this.min = startingSequenceNumber;
    this.max = startingSequenceNumber;
    this.log = new Map();
  }

  append(update: Uint8Array) {
    this.max++;
    this.log.set(this.max, update);
    console.log("appending sequence", this.max, update);
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
   * flattens all updates into a single uint8array
   */
  flatten(): Uint8Array {
    const updates = this.log.values();
    const first = updates.next();

    if (!first.value) {
      return new Uint8Array();
    }

    const updateByteLength = first.value.byteLength;

    let offset = 0;
    const buffer = new Uint8Array(updateByteLength * this.log.size);
    buffer.set(first.value, offset);
    offset += updateByteLength;

    for (const update of updates) {
      buffer.set(update, offset);
      offset += updateByteLength;
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
