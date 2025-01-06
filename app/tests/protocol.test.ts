import { BOARD_COUNT } from "config";
import { SequenceLog } from "server/sequence-log";
import { expect, test } from "vitest";
import {
  buildBatchUpdatesMessage,
  buildMoveMessage,
  CLIENT_MSG,
  deserializeBatchUpdate,
  deserializeMove,
  parseMessage,
  serializeMove,
  SERVER_MSG,
  type Move,
} from "~/protocol";

test("serializeMove to work", () => {
  const empty = serializeMove({ board: 0, cell: 0, sequence: 0, level: 1 });
  console.log("YO", empty);
  expect(empty.byteLength).toBe(4);
  expect(empty).toStrictEqual(new Uint8Array([0b0001_0000, 0, 0, 0]));
  expect(
    serializeMove({ board: 1, cell: 1, sequence: 1, level: 1 })
  ).toStrictEqual(new Uint8Array([0b0001_0000, 0, 1, 0b00010001]));
  expect(
    serializeMove({ board: 8, cell: 8, sequence: 8, level: 1 })
  ).toStrictEqual(new Uint8Array([0b0001_0000, 0, 8, 0b10001000]));
});

test("deserializeRawMove works", () => {
  const emptyBuffer = new Uint8Array([0b00010000, 0, 0, 0]);
  let output = deserializeMove(emptyBuffer);

  expect(output.level).toBe(1);
  expect(output.board).toBe(0);
  expect(output.cell).toBe(0);
  expect(output.sequence).toBe(0);

  const allOnes = new Uint8Array([1, 1, 1, 1]);
  output = deserializeMove(allOnes);

  expect(output.board).toBe(65_793);
  expect(output.sequence).toBe(0);
  expect(output.cell).toBe(1);
});

test("buildMoveMessage", () => {
  const payload = serializeMove({ board: 1, cell: 1, sequence: 1, level: 1 });
  const msg = buildMoveMessage(payload);

  expect(msg[0]).toBe(CLIENT_MSG.MAKE_MOVE);
  expect(msg.subarray(1)).toStrictEqual(payload);
});

test("parseMessage", () => {
  const payload = serializeMove({
    board: BOARD_COUNT - 1,
    cell: 1,
    sequence: 1,
    level: 1,
  });
  const msg = new Uint8Array([CLIENT_MSG.MAKE_MOVE, ...payload]);

  const parsedMsg = parseMessage(msg);

  expect(parsedMsg.kind).toBe(CLIENT_MSG.MAKE_MOVE);
  expect(parsedMsg.payload).toStrictEqual(payload);
});

test("batch patch sets correct sequence number", () => {
  const emptyPayload = new Uint8Array();
  const message = buildBatchUpdatesMessage(emptyPayload, 0);
  const view = new DataView(message.buffer);

  const moves = message.slice(5);
  expect(view.getUint8(0)).toBe(SERVER_MSG.BATCH_UPDATE);
  expect(message.byteLength).toBe(5);
  expect(moves.byteLength).toBe(0);
  expect(view.getUint32(1)).toBe(0);
});

test("batch patch sets move", () => {
  const payload = new Uint8Array([SERVER_MSG.PATCH_MOVE, 1, 2, 3, 4]);
  const message = buildBatchUpdatesMessage(payload, 0);
  const move = message.slice(5);
  expect(move).toStrictEqual(payload);
});

test("integration with batch updating", () => {
  // create messages on the client
  const clientMoves: Move[] = new Array(5).fill(0).map((_, i) => {
    return {
      board: Math.floor(Math.random() * BOARD_COUNT),
      cell: Math.floor(Math.random() * 9),
      sequence: Math.floor(Math.random() * 9),
      level: 1,
    };
  });

  const serializedMoves = clientMoves.map(serializeMove);
  const moveMessages = serializedMoves.map(buildMoveMessage);
  // send messages to server
  const parsedMessages = moveMessages.map((m) => parseMessage(m).payload);

  // stick messages into log
  const log = new SequenceLog(0);
  parsedMessages.map(buildMoveMessage).forEach(log.append.bind(log));

  // send batch update to client
  const flattened = log.flatten();
  const batchMessage = buildBatchUpdatesMessage(flattened, log.earliest);

  // // decode moves on the client
  const payload = parseMessage(batchMessage).payload;
  const batchMoves = deserializeBatchUpdate(payload);

  expect(batchMoves.sequenceStart).toBe(log.earliest);
  batchMoves.updates.forEach((update, i) => {
    const mv = deserializeMove(update.payload);
    expect(mv).toStrictEqual(clientMoves[i]);
  });
});
