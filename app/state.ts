import { LEVELS } from "config";
import { checkWin } from "./game";
import { GameState } from "./game-state";

export const gameState = new GameState(LEVELS);

export function parseSnapshot(buff: ArrayBuffer) {
  gameState.setBuffer(buff);
}

export function hasWinner(board: number) {
  return (
    checkWin(board, gameState.bitset(6, "x"), gameState.bitset(6, "o")) !== null
  );
}
