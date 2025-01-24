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

  const renderDesktopLevels = new Array(levels).fill(0).map((_, thisLevel) => {
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

  const renderMobileLevels = (
    <div className="mt-2 grid grid-cols-1 min-w-56">
      <select
        id="location"
        name="location"
        value={level}
        onChange={(e) => {
          const selectedLevel = Number.parseInt(e.target.value);

          if (isNaN(selectedLevel)) {
            throw new Error("invalid target value set on <option value>");
          }
          setLevelAndKeepScroll(selectedLevel);
        }}
        className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-gray-300 text-gray-700 py-1.5 pl-3 pr-8 text-lg font-medium outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
      >
        {new Array(levels).fill(0).map((_, thisLevel) => {
          return (
            <option key={thisLevel} value={thisLevel}>
              Level {convertToUserLevel(thisLevel, LEVELS)}
            </option>
          );
        })}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
      />
    </div>
  );

  return (
    <div>
      <div className="hidden md:flex flex-row-reverse items-center gap-2 md:gap-4 overflow-x-scroll self-center">
        {renderDesktopLevels}
      </div>
      <div className="md:hidden flex flex-row-reverse items-center gap-2 md:gap-4 overflow-x-scroll self-center">
        {renderMobileLevels}
      </div>
    </div>
  );
}

export function useLevels() {
  return useContext(levelContext);
}

function convertToUserLevel(systemLevel: number, levelCount: number) {
  return levelCount - systemLevel;
}

function ChevronDownIcon({ className = "" }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={"size-6 " + className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
