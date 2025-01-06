import { GameState } from "~/game-state";

const state = new GameState(6);

const buffer = state.getBuffer();

console.log(buffer.byteLength, state.byteLength);
