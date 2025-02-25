// Everything having to do with our binary websocket protocol

import { BYTES_FOR_SEQ_NUM, MAX_LEVEL } from "config";

const totalBoardCount = Math.pow(9, MAX_LEVEL);

const PATCH_PAYLOAD_LENGTH = 4; // bytes

/**
 * Message types sent from the client
 */
export enum CLIENT_MSG {
  MAKE_MOVE = 0,
  REQUEST_SYNC = 1,
}

/**
 * Message types sent from the server
 */
export enum SERVER_MSG {
  PATCH_MOVE = 0,
  CLEAR_BOARD = 1,
  BATCH_UPDATE = 2,
}

export type Move = {
  level: number;
  board: number;
  cell: number;
  sequence: number;
};

export type Clear = {
  level: number;
  board: number;
};

export type Message = {
  kind: SERVER_MSG | CLIENT_MSG;
  payload: Uint8Array;
};

export function deserializeMove(move: Uint8Array): Move {
  const level = (move[0] & 0b11110000) >> 4;
  move[0] = move[0] & 0b00001111;
  const board = (move[0] << 16) | (move[1] << 8) | move[2];
  const sequence = (move[3] >> 4) & 0xf;
  const cell = move[3] & 0xf;

  if (board >= totalBoardCount) {
    throw new Error(`Invalid board index, ${board} outside of board range`);
  }

  if (cell > 8 || cell < 0) {
    throw new Error(`Invalid cell, ${cell} outside of cell range`);
  }

  if (sequence > 8 || sequence < 0) {
    throw new Error(`Invalid sequence, ${sequence} outside of sequence range`);
  }

  return {
    level,
    board,
    cell,
    sequence,
  };
}

/**
 * Accepts a move object and returns its binary representation as a uint8array
 * [level 4bites][boardId - 2 1/2 bytes][sequence - 4 bits][cell - 4bits]
 * @param move
 */
export function serializeMove(move: Move) {
  const { board, cell, sequence, level } = move;

  if (level > MAX_LEVEL || level < 0) {
    throw new Error("invariant failed, invalid level range");
  }

  if (cell > 8 || cell < 0) {
    throw new Error(`invariant failed passing invalid cell value: ${cell}`);
  }

  if (sequence > 8 || sequence < 0) {
    throw new Error(`invariant failed passing invalid sequence value: ${cell}`);
  }

  const shiftedLevel = (level << 4) & 0xf0;
  const shiftedSequence = (sequence << 4) & 0xf0;
  const maskedCell = cell & 0xf;

  const buff = new Uint8Array(PATCH_PAYLOAD_LENGTH);

  buff[0] = (board >> 16) & 0xff;
  buff[1] = (board >> 8) & 0xff;
  buff[2] = board & 0xff;
  buff[3] = shiftedSequence | maskedCell;

  // set level
  buff[0] = (buff[0] & 0b00001111) | shiftedLevel;
  return buff;
}

export function deserializeClearBoard(move: Uint8Array): {
  board: number;
  level: number;
} {
  const level = (move[0] & 0b11110000) >> 4;
  move[0] = move[0] & 0b00001111;
  const board = (move[0] << 16) | (move[1] << 8) | move[2];

  if (board >= totalBoardCount) {
    throw new Error(`Invalid board index, ${board} outside of board range`);
  }

  return {
    level,
    board,
  };
}

export function serializeClearBoard(board: number, level: number) {
  const buff = new Uint8Array(PATCH_PAYLOAD_LENGTH);

  buff[0] = (board >> 16) & 0xff;
  buff[1] = (board >> 8) & 0xff;
  buff[2] = board & 0xff;

  const shiftedLevel = (level << 4) & 0xf0;
  buff[0] = buff[0] | shiftedLevel;
  return buff;
}

/**
 * Builds a Move message buffer that is ready to be sent to the server
 * @param payload
 * @returns Message<Move>
 */
export function buildMoveMessage(payload: Uint8Array) {
  const message = new Uint8Array(payload.byteLength + 1);

  message[0] = CLIENT_MSG.MAKE_MOVE; // SET first byte to 2 to signal that this is a move message
  message.set(payload, 1);

  return message;
}

export function parseMessage(msg: Uint8Array) {
  const kind = msg[0];
  const payload = msg.subarray(1);

  return {
    kind,
    payload,
  };
}

/**
 * Builds a Patch message buffer that is ready to be broadcasts to clients
 * @param payload
 * @returns Message<Patch>
 */
export function buildPatchMoveMessage(payload: Uint8Array) {
  const message = new Uint8Array(payload.byteLength + 1);

  message[0] = SERVER_MSG.PATCH_MOVE;
  message.set(payload, 1);

  return message;
}

/**
 * Builds a Patch message buffer that is ready to be broadcasts to clients
 * @param payload
 * @returns Message<Patch>
 */
export function buildClearBoardMessage(payload: Uint8Array) {
  const message = new Uint8Array(payload.byteLength + 1);

  message[0] = SERVER_MSG.CLEAR_BOARD;
  message.set(payload, 1);

  return message;
}

/**
 * naively send entire sequence log in memory as one payload
 * (can client stream this in using RLE?)
 * @param payload
 * @param startSeqNum
 */
export function buildBatchUpdatesMessage(
  payload: Uint8Array,
  startSeqNum: number
) {
  if (payload.byteLength % (PATCH_PAYLOAD_LENGTH + 1) !== 0) {
    throw new Error(
      `Invariant failed, payload length (${
        payload.byteLength
      }b) is not divisible by MovePayload length (${
        PATCH_PAYLOAD_LENGTH + 1
      }b) `
    );
  }

  // 1byte for message kind, sequence number of last move, N * move_length for N moves
  const message = new Uint8Array(1 + 4 + payload.byteLength);
  const view = new DataView(
    message.buffer,
    message.byteOffset,
    message.byteLength
  );
  view.setUint8(0, SERVER_MSG.BATCH_UPDATE);
  view.setUint32(1, startSeqNum, true);
  message.set(payload, 5);

  return message;
}

export function deserializeBatchUpdate(payload: Uint8Array): {
  updates: Array<Message>;
  sequenceStart: number;
} {
  const view = new DataView(
    payload.buffer,
    payload.byteOffset,
    payload.byteLength
  );
  const sequenceNumber = view.getUint32(0, true);
  const updateMessageLength = PATCH_PAYLOAD_LENGTH + 1;

  const updates: Message[] = [];
  for (
    let i = BYTES_FOR_SEQ_NUM;
    i < payload.byteLength;
    i += updateMessageLength
  ) {
    updates.push(parseMessage(payload.subarray(i, i + updateMessageLength)));
  }

  return {
    updates,
    sequenceStart: sequenceNumber,
  };
}
