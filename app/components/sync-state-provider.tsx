import { useEffect, useRef, useState, type ReactNode } from "react";
import { parseSnapshot, snapshotSequenceNum } from "~/state";
import {
  deserializeBatchPatch,
  deserializeMove,
  parseMessage,
  SERVER_MSG,
  type Move,
} from "~/protocol";
import {
  makeTurn,
  makeTurnAndRender,
  toClientMove,
} from "~/hooks/use-board-store";

type Props = {
  children: (renderKey: React.Key) => ReactNode;
};

export function SyncStateProvider({ children }: Props) {
  const [key, setKey] = useState(Math.random());
  const rerender = () => setKey(Math.random());
  const [fetchedSnapshot, setFetchedSnapshot] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const socketRef = useRef<WebSocket>(null);

  // fetch snapshot on page load
  useEffect(() => {
    async function fetchSnapshot() {
      try {
        const response = await fetch(import.meta.env.VITE_SNAPSHOT_FILE_URL);

        if (!response.ok) {
          throw new Error(`got status ${response.status} from the server.`);
        }

        const data = await response.arrayBuffer();
        parseSnapshot(data);
        rerender();
        setFetchedSnapshot(true);
      } catch (e) {
        console.error(e);
      }
    }

    fetchSnapshot();
  }, []);

  useEffect(() => {
    if (!fetchedSnapshot) return;
    const ws = new WebSocket("/ws");
    socketRef.current = ws;
    ws.binaryType = "arraybuffer";
    ws.onopen = (event) => {};
    ws.onmessage = (event) => {
      const msg = parseMessage(new Uint8Array(event.data));

      switch (msg.kind) {
        case SERVER_MSG.PATCH: {
          const orderedMove = deserializeMove(msg.payload);
          const clientMove = toClientMove(orderedMove);
          makeTurnAndRender(clientMove);
          break;
        }
        case SERVER_MSG.BATCH_PATCH: {
          const { sequenceStart, moves } = deserializeBatchPatch(msg.payload);

          // check if our snapshot is out of date
          if (sequenceStart > snapshotSequenceNum) {
            console.log(
              `snapshot sequence ${snapshotSequenceNum} is to far behind start of latest batch sync payload ${sequenceStart}`
            );
            setNeedRefresh(true);
          } else {
            startSync(moves, () => {
              setSyncing(false);
            });
          }
        }
      }
    };
    return () => ws.close();
  }, [fetchedSnapshot]);

  return children(key);
}

function startSync(moves: Move[], onFinish: () => void) {
  console.log("syncing", moves.length, "moves since snapshot");

  for (let move of moves) {
    makeTurn(toClientMove(move));
  }

  onFinish();
}

// function attemptClientMove(move: ClientMove, ws: WebSocket) {

//   ws.send()

// }
