import { it, expect } from "vitest";
import { SequenceLog } from "../sequence-log";
import { serializeMove, buildPatchMoveMessage } from "~/protocol";

it("increments when appending", () => {
  const log = new SequenceLog();
  const prev = log.current;
  const move = new Uint8Array();
  log.append(move);
  const after = log.current;
  expect(after).toBe(prev + 1);
});

it("flush then flatten returns empty array", () => {
  const log = new SequenceLog();
  const move = new Uint8Array([1, 2, 3, 4]);
  log.append(move);
  log.flush();
  const empty = new Uint8Array();
  expect(log.flatten()).toStrictEqual(empty);
});

it("flattens correctly", () => {
  const move1 = buildPatchMoveMessage(
    serializeMove({
      board: 0,
      cell: 0,
      sequence: 0,
      level: 1,
    })
  );
  const move2 = buildPatchMoveMessage(
    serializeMove({
      board: 0,
      cell: 1,
      sequence: 1,
      level: 1,
    })
  );
  const move3 = buildPatchMoveMessage(
    serializeMove({
      board: 0,
      cell: 2,
      sequence: 2,
      level: 1,
    })
  );

  const log = new SequenceLog();
  log.append(move1);
  log.append(move2);
  log.append(move3);

  const flattened = log.flatten();

  expect(flattened.byteLength).toBe(move1.byteLength * 3);
  expect(flattened.slice(0, move1.byteLength)).toStrictEqual(move1);
  expect(flattened.slice(move1.byteLength, move1.byteLength * 2)).toStrictEqual(
    move2
  );
  expect(
    flattened.slice(move1.byteLength * 2, move1.byteLength * 3)
  ).toStrictEqual(move3);
});
