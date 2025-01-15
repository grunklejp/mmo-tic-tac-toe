import { useTeam } from "./team-provider";

export function TeamIndicator() {
  const team = useTeam();

  const colorClass = team === "x" ? "text-red-500" : "text-blue-500";

  return (
    <div className="flex gap-1 items-center">
      <p className="text-lg font-semibold">Team:</p>
      {team !== null ? (
        <span className={`text-2xl font-bold ${colorClass} uppercase`}>
          {team}
          <span className="lowercase">'s</span>
        </span>
      ) : (
        <span className="text-gray-500 animate-pulse">...getting team</span>
      )}
    </div>
  );
}
