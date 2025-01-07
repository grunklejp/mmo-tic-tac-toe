import { LEVELS } from "config";
import { GameState } from "./game-state";

export const gameState = new GameState(LEVELS);

export function parseSnapshot(buff: ArrayBuffer) {
  gameState.setBuffer(buff);
}
