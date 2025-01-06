import { BOARD_COUNT } from "config";
import { buildMoveMessage, serializeMove } from "~/protocol";

const ws = new WebSocket("ws://localhost:3000/ws");
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
    level: 6,
    // board: Math.floor(Math.random() * BOARD_COUNT),
    board: Math.floor(Math.random() * 40000),
    cell: Math.floor(Math.random() * 9),
    sequence: Math.floor(Math.random() * 9),
  });

  const msg = buildMoveMessage(payload);
  ws.send(msg);
}
