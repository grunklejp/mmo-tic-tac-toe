import type { Context } from "hono";
import { getSignedCookie } from "hono/cookie";

export async function getTeam(c: Context): Promise<"x" | "o" | null> {
  const teamCookie = await getSignedCookie(
    c,
    process.env.COOKIE_SIGNING_SECRET!,
    "team"
  );

  if (teamCookie) {
    return teamCookie as "x" | "o";
  }
  return null;
}

export function getRandomTeam() {
  const team = Math.floor(Math.random() * 2);

  if (team === 0) {
    return "o";
  }
  return "x";
}
