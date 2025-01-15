import { Hono } from "hono";
import { createBunWebSocket, serveStatic } from "hono/bun";
import { type ServerWebSocket } from "bun";
import {
  isMoveValid,
  beginWritingSnapshot,
  loadSnapshot,
  memoryState,
  sequences,
} from "./memory";
import {
  buildBatchUpdatesMessage,
  buildClearBoardMessage,
  buildPatchMoveMessage,
  CLIENT_MSG,
  deserializeMove,
  parseMessage,
  serializeClearBoard,
  serializeMove,
  type Move,
} from "~/protocol";
import { getRandomTeam, getTeam } from "./team";
import { setSignedCookie } from "hono/cookie";
import type { SequenceLog } from "./sequence-log";
import { isDrawLazy, checkWin, clearBoard, makeMove } from "~/game";
import type { GameState } from "~/game-state";

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.get("/api/snapshot.bin", serveStatic({ path: "/snapshot.bin" }));

app.get("/api/team", async (c) => {
  const existingTeam = await getTeam(c);
  if (existingTeam) {
    return c.json({
      team: existingTeam,
    });
  }
  const newTeam = getRandomTeam();

  await setSignedCookie(c, "team", newTeam, process.env.COOKIE_SIGNING_SECRET!);

  return c.json({
    team: newTeam,
  });
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage: async (event, ws) => {
        const socket = ws.raw as ServerWebSocket;
        if (event.data instanceof ArrayBuffer) {
          const buff = new Uint8Array(event.data);
          const { kind, payload } = parseMessage(buff);

          switch (kind) {
            case CLIENT_MSG.MAKE_MOVE: {
              const move = deserializeMove(payload);
              const userTeam = await getTeam(c);

              if (!userTeam) {
                throw new Error("Error: must have team to make move.");
              }

              const isValid = isMoveValid(move, memoryState, userTeam);

              if (isValid) {
                propagateMoveAndPublish(
                  move,
                  userTeam,
                  memoryState,
                  socket,
                  sequences
                );
                // sequences.append(payload);
                // const patchUpdate = buildPatchMessage(payload);
                // socket.publishBinary("patch-updates", patchUpdate, true);
                // ws.send(patchUpdate); // publish doesn't send to client that triggered it, so we need to send it manually
              }
            }
          }
        } else {
          console.log(typeof event.data);
        }
      },
      onOpen: (event, ws) => {
        const socket = ws.raw as ServerWebSocket;

        // set up client subscriber;
        socket.subscribe("patch-updates");

        // Send the most recent messages since the latest snapshot
        const movesSinceLastSnapshot = sequences.flatten();
        const catchUpMSG = buildBatchUpdatesMessage(
          movesSinceLastSnapshot,
          sequences.earliest
        );
        socket.sendBinary(catchUpMSG, true);
      },
      onClose: (_, ws) => {
        const socket = ws.raw as ServerWebSocket;
        socket.unsubscribe("patch-updates");
      },
    };
  })
);

if (process.env.APP_ENV === "development") {
  const snapshot = Bun.file("./snapshot.bin");

  snapshot.exists().then((exists) => {
    if (exists) {
      snapshot.arrayBuffer().then((buff) => {
        console.log("loading snapshot from disk.");
        loadSnapshot(buff);
      });
    } else {
      console.log("no existing snapshot server snapshot, creating empty board");
    }
  });
}

// beginWritingSnapshot("./snapshot.bin", 5000 * 60);
beginWritingSnapshot("./snapshot.bin", 10000);
// testing_createRandomSnapshotFile();

export default {
  fetch: app.fetch,
  websocket,
};

// TODO: test!
export function propagateMoveAndPublish(
  move: Move,
  turn: "x" | "o",
  state: GameState,
  socket: ServerWebSocket,
  sequenceLog: SequenceLog
) {
  const xBitset = state.bitset(move.level, "x");
  const oBitset = state.bitset(move.level, "o");

  makeMove(move, turn === "x" ? xBitset : oBitset);

  const patchPayload = buildPatchMoveMessage(serializeMove(move));
  sequenceLog.append(patchPayload);
  socket.publishBinary("patch-updates", patchPayload, true);
  socket.send(patchPayload); // publish doesn't send to client that triggered it, so we need to send it manually

  const winner = checkWin(move.board, xBitset, oBitset);

  // we have a winner!
  if (winner !== null) {
    // TODO: trigger endgame state
    if (move.level === 0) {
      console.log("GAME OVER");
      return;
    }

    // make a move in the lower-level board
    const newMove: Move = {
      level: move.level - 1,
      board: Math.floor(move.board / 9),
      cell: move.board % 9,
      // we must encode the sequence as a turn (0 for o, 1 for x)
      sequence: turn === "x" ? 1 : 0,
    };

    return propagateMoveAndPublish(newMove, turn, state, socket, sequenceLog);
  }

  const stalemate = isDrawLazy(move.board, xBitset, oBitset);

  if (stalemate) {
    clearBoard(state, move.board, move.level);

    const patchPayload = buildClearBoardMessage(
      serializeClearBoard(move.board, move.level)
    );
    sequenceLog.append(patchPayload);
    socket.publishBinary("patch-updates", patchPayload, true);
    socket.send(patchPayload); // publish doesn't send to client that triggered it, so we need to send it manually
  }

  return;
}
