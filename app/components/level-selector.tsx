import { createContext, useContext, useState, type ReactNode } from "react";

const levelContext = createContext<{
  levels: number;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
} | null>(null);

export function LevelProvider({
  levels,
  children,
}: {
  levels: number;
  children: ReactNode;
}) {
  const [level, setLevel] = useState(0);

  return (
    <levelContext.Provider
      value={{
        levels,
        level,
        setLevel,
      }}
    >
      {children}
    </levelContext.Provider>
  );
}

export function LevelSelector() {
  const context = useLevels();

  if (!context) {
    return null;
  }

  const { level, levels, setLevel } = context;

  const renderLevels = new Array(levels).fill(0).map((_, thisLevel) => {
    const statefulClasses =
      thisLevel === level
        ? "bg-gray-700 text-white"
        : "bg-gray-300 text-gray-700";

    return (
      <button
        onClick={() => {
          setLevel(thisLevel);
        }}
        className={`rounded px-2 p-1 font-medium text-sm md:text-lg shrink-0 ${statefulClasses}`}
        key={`level-${thisLevel}`}
      >
        Level {thisLevel}
      </button>
    );
  });

  return (
    <div className="flex items-center gap-2 md:gap-4 overflow-x-scroll self-center">
      {renderLevels}
    </div>
  );
}

export function useLevels() {
  return useContext(levelContext);
}
