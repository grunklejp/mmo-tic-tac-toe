import { LEVELS, MAX_LEVEL } from "config";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Position = {
  top: number;
  left: number;
};

const levelContext = createContext<{
  levels: number;
  level: number;
  setLevel: React.Dispatch<React.SetStateAction<number>>;
  setLevelAndKeepScroll: (level: number) => void;
  scrollRef: React.RefObject<Position>;
} | null>(null);

export function LevelProvider({
  levels,
  children,
}: {
  levels: number;
  children: ReactNode;
}) {
  const [level, setLevel] = useState(MAX_LEVEL);
  const scrollRef = useRef<Position>({
    top: 0,
    left: 0,
  });

  const setLevelAndKeepScroll = (newLevel: number) => {
    const scaleFactor = Math.pow(3, newLevel - level);
    scrollRef.current.top *= scaleFactor;
    scrollRef.current.left *= scaleFactor;

    setLevel(newLevel);
  };

  return (
    <levelContext.Provider
      value={{
        levels,
        level,
        setLevel,
        setLevelAndKeepScroll,
        scrollRef,
      }}
    >
      {children}
    </levelContext.Provider>
  );
}

/**
 * level selector shows user friendly levels, starts at 1, goes to 7. (level 1 === system level 6)
 */
export function LevelSelector() {
  const context = useLevels();

  if (!context) {
    return null;
  }

  const { level, levels, setLevelAndKeepScroll } = context;

  const renderLevels = new Array(levels).fill(0).map((_, thisLevel) => {
    const statefulClasses =
      thisLevel === level
        ? "bg-gray-700 text-white"
        : "bg-gray-300 text-gray-700";

    return (
      <button
        onClick={() => {
          setLevelAndKeepScroll(thisLevel);
        }}
        className={`rounded px-2 p-1 font-medium text-sm md:text-lg shrink-0 ${statefulClasses}`}
        key={`level-${thisLevel}`}
      >
        Level {convertToUserLevel(thisLevel, LEVELS)}
      </button>
    );
  });

  return (
    <div className="flex flex-row-reverse items-center gap-2 md:gap-4 overflow-x-scroll self-center">
      {renderLevels}
    </div>
  );
}

export function useLevels() {
  return useContext(levelContext);
}

function convertToUserLevel(systemLevel: number, levelCount: number) {
  return levelCount - systemLevel;
}
