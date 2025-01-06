import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { parseSnapshot, gameState } from "~/state";
import {
  buildMoveMessage,
  deserializeBatchUpdate,
  deserializeClearBoard,
  deserializeMove,
  parseMessage,
  serializeMove,
  SERVER_MSG,
  type Message,
} from "~/protocol";
import {
  fromClientMove,
  makeTurnAndRender,
  toClientMove,
  type ClientMove,
} from "~/hooks/use-board-store";
import { ReconnectWidget } from "./reconnect-widget";
import { MAX_LEVEL } from "config";
import { clearBoard } from "~/game";

type Props = {
  children: (renderKey: React.Key) => ReactNode;
};

type Context = {
  move: (move: ClientMove) => void;
} | null;

const protocolContext = createContext<Context>(null);

export function SyncStateProvider({ children }: Props) {
  const [key, setKey] = useState(Math.random());
  const rerender = () => setKey(Math.random());
  const [fetchedSnapshot, setFetchedSnapshot] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const socketRef = useRef<WebSocket>(null);

  const move = useCallback((move: ClientMove) => {
    if (socketRef.current === null) {
      throw new Error("socket not initialized");
    }

    if (socketRef.current.readyState !== WebSocket.OPEN) {
      throw new Error("Socket not open");
    }

    attemptClientMove(move, socketRef.current);
  }, []);

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
    // let heartbeatInterval: Timer;
    socketRef.current = ws;
    ws.binaryType = "arraybuffer";
    ws.onopen = (event) => {
      console.log("Socket opened");

      // heartbeatInterval = setInterval(() => {
      //   if (ws.readyState === WebSocket.OPEN) {
      //     console.log("pinging server");
      //     ws.send("ping");
      //   }
      // }, 5000);
    };
    ws.onclose = (event) => {
      console.log("Socket closed");
      setNeedRefresh(true);
    };
    ws.onmessage = (event) => {
      const msg = parseMessage(new Uint8Array(event.data));

      switch (msg.kind) {
        case SERVER_MSG.PATCH_MOVE: {
          patchMoveAction(msg.payload);
          break;
        }
        case SERVER_MSG.CLEAR_BOARD: {
          clearBoardPayload(msg.payload);
          break;
        }
        case SERVER_MSG.BATCH_UPDATE: {
          const { sequenceStart, updates } = deserializeBatchUpdate(
            msg.payload
          );

          // check if our snapshot is out of date
          if (sequenceStart > gameState.sequenceNumber) {
            console.log(
              `snapshot sequence ${gameState.sequenceNumber} is to far behind start of latest batch sync payload ${sequenceStart}`
            );
            setNeedRefresh(true);
          } else {
            setSyncing(true);
            startSync(updates, () => {
              setSyncing(false);
            });
          }
        }
      }
    };
    return () => {
      // clearInterval(heartbeatInterval);
      ws.close();
    };
  }, [fetchedSnapshot]);

  return (
    <protocolContext.Provider value={{ move }}>
      <div className="relative">
        {needRefresh && <ReconnectWidget />}
        {children(key)}
      </div>
    </protocolContext.Provider>
  );
}

export function useProtocol() {
  return useContext(protocolContext);
}

function startSync(updates: Message[], onFinish: () => void) {
  console.log("syncing", updates.length, "updates since snapshot");

  for (let update of updates) {
    switch (update.kind) {
      case SERVER_MSG.PATCH_MOVE: {
        patchMoveAction(update.payload);
        break;
      }
      case SERVER_MSG.CLEAR_BOARD: {
        clearBoardPayload(update.payload);
        break;
      }
    }
  }

  onFinish();
}

function attemptClientMove(move: ClientMove, ws: WebSocket) {
  const serliazed = serializeMove(
    fromClientMove(move, gameState.bitset(6, "x"), gameState.bitset(6, "o"))
  );
  const message = buildMoveMessage(serliazed);
  ws.send(message);
}

function patchMoveAction(payload: Uint8Array) {
  const orderedMove = deserializeMove(payload);
  const clientMove = toClientMove(orderedMove);

  // if this move is at a lowerver level than the player level
  // we should infer the turn from move.sequence being 1(x) or 0(o) instead.
  if (clientMove.level < MAX_LEVEL) {
    const turn = orderedMove.sequence;

    if (turn !== 1 && turn !== 0) {
      throw new Error(
        "Invriant failed, server did not properly encode turn sequence for non player level"
      );
    }

    makeTurnAndRender({
      ...clientMove,
      value: turn === 1 ? "x" : "o",
    });
  } else {
    makeTurnAndRender(clientMove);
  }
}

function clearBoardPayload(payload: Uint8Array<ArrayBufferLike>) {
  const { board, level } = deserializeClearBoard(payload);

  console.log("clearing board:", board, "level:", level);

  clearBoard(gameState, board, level);
}
