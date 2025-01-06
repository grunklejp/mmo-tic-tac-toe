import { BYTES_FOR_SEQ_NUM } from "config";
import { test, expect } from "vitest";
import { GameState } from "~/game-state";

test("byteLength is correct", () => {
  const level0Size = Math.ceil((Math.pow(9, 0) * 9) / 8) * 2;
  const level1Size = Math.ceil((Math.pow(9, 1) * 9) / 8) * 2;
  const level2Size = Math.ceil((Math.pow(9, 2) * 9) / 8) * 2;
  const level3Size = Math.ceil((Math.pow(9, 3) * 9) / 8) * 2;
  const level4Size = Math.ceil((Math.pow(9, 4) * 9) / 8) * 2;
  const level5Size = Math.ceil((Math.pow(9, 5) * 9) / 8) * 2;
  const level6Size = Math.ceil((Math.pow(9, 6) * 9) / 8) * 2;

  console.log(new GameState(6).byteLength);

  expect(new GameState(0).byteLength).toBe(BYTES_FOR_SEQ_NUM + level0Size);
  expect(new GameState(1).byteLength).toBe(
    BYTES_FOR_SEQ_NUM + level0Size + level1Size
  );
  expect(new GameState(2).byteLength).toBe(
    BYTES_FOR_SEQ_NUM + level0Size + level1Size + level2Size
  );
  expect(new GameState(3).byteLength).toBe(
    BYTES_FOR_SEQ_NUM + level0Size + level1Size + level2Size + level3Size
  );
  expect(new GameState(4).byteLength).toBe(
    BYTES_FOR_SEQ_NUM +
      level0Size +
      level1Size +
      level2Size +
      level3Size +
      level4Size
  );
  expect(new GameState(5).byteLength).toBe(
    BYTES_FOR_SEQ_NUM +
      level0Size +
      level1Size +
      level2Size +
      level3Size +
      level4Size +
      level5Size
  );
  expect(new GameState(6).byteLength).toBe(
    BYTES_FOR_SEQ_NUM +
      level0Size +
      level1Size +
      level2Size +
      level3Size +
      level4Size +
      level5Size +
      level6Size
  );
});
