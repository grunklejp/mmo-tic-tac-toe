import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const teamContext = createContext<string | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  // TODO: set team in localstorage?
  const [team, setTeam] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await fetch("/api/team");

        if (!response.ok) {
          throw new Error(`got status ${response.status} from the server.`);
        }

        const data = (await response.json()) as { team: string };
        setTeam(data.team);
      } catch (e) {
        console.error(e);
      }
    }

    fetchTeam();
  }, []);

  return <teamContext.Provider value={team}>{children}</teamContext.Provider>;
}

export function useTeam() {
  const team = useContext(teamContext);
  return team as "x" | "o" | null;
}
