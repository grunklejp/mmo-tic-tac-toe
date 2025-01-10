import { BOARD_COUNT, MAX_LEVEL } from "config";
import { buildMoveMessage, serializeMove } from "~/protocol";

const ws = new WebSocket("ws://localhost:3000/ws", {
  //@ts-ignore because bun says this is ok...
  headers: {
    Cookie:
      Math.random() > 0.5
        ? "team=x.0ln5dcDm2VHXX69vSVFCbH46GNuDh3t4Rfwwwct3ojE="
        : "team=o.QO4fGQOpOVvp4juVQ9MTMVI9ulmb1s6YixqeHokJiHo=",
  },
});
ws.binaryType = "arraybuffer";

ws.onopen = (event) => {
  // ws.send("hello");
  setInterval(() => {
    makeRandomMove(ws);
  }, 10);
};

ws.onmessage = (event) => {
  console.log(event);
};

function makeRandomMove(ws: WebSocket) {
  const payload = serializeMove({
    level: MAX_LEVEL,
    // board: Math.floor(Math.random() * BOARD_COUNT),
    board: Math.floor(Math.random() * 1000),
    cell: Math.floor(Math.random() * 9),
    sequence: Math.floor(Math.random() * 9),
  });

  const msg = buildMoveMessage(payload);
  ws.send(msg);
}
