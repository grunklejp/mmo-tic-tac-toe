import { Hono } from "hono";
import { createBunWebSocket, serveStatic } from "hono/bun";
import { type ServerWebSocket } from "bun";
import {
  attemptMove,
  beginWritingSnapshot,
  loadSnapshot,
  oBitset,
  xBitset,
  sequences,
} from "./memory";
import { testing_createRandomSnapshotFile } from "~/utils";
import {
  buildBatchPatchMessage,
  buildPatchMessage,
  CLIENT_MSG,
  deserializeMove,
  parseMessage,
} from "~/protocol";

const app = new Hono();

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

app.get("/api/snapshot.bin", serveStatic({ path: "/snapshot.bin" }));

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage: (event, ws) => {
        const socket = ws.raw as ServerWebSocket;
        if (event.data instanceof ArrayBuffer) {
          const buff = new Uint8Array(event.data);
          const { kind, payload } = parseMessage(buff);

          switch (kind) {
            case CLIENT_MSG.MAKE_MOVE: {
              const move = deserializeMove(payload);
              const result = attemptMove(move, xBitset, oBitset);
              if (result.success) {
                sequences.append(payload);
                const patchUpdate = buildPatchMessage(payload);
                socket.publishBinary("patch-updates", patchUpdate, true);
                ws.send(patchUpdate);
              }
            }
          }
        } else {
          console.log(typeof event.data);
        }
      },
      onOpen: (event, ws) => {
        const socket = ws.raw as ServerWebSocket;

        // Send the most recent messages since the latest snapshot
        const movesSinceLastSnapshot = sequences.flatten();
        const catchUpMSG = buildBatchPatchMessage(
          movesSinceLastSnapshot,
          sequences.earliest
        );
        socket.sendBinary(catchUpMSG, true);

        // set up client subscriber;
        socket.subscribe("patch-updates");
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

beginWritingSnapshot("./snapshot.bin", 5000 * 60);
// testing_createRandomSnapshotFile();

export default {
  fetch: app.fetch,
  websocket,
};
