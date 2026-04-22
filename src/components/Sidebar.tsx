const SYSTEMS = [
  "All",
  "NES",
  "SNES",
  "Game Boy",
  "Game Boy Color",
  "Game Boy Advance",
  "Nintendo 64",
  "Sega Genesis",
  "Game Gear",
  "Master System",
  "PlayStation",
  "TurboGrafx-16",
];

interface Props {
  selected: string;
  onSelect: (system: string) => void;
  counts: Record<string, number>;
}

export function Sidebar({ selected, onSelect, counts }: Props) {
  return (
    <div className="w-48 shrink-0 flex flex-col gap-1 pr-4">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Systems</p>
      {SYSTEMS.map((system) => {
        const count = system === "All"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[system] ?? 0;

        if (system !== "All" && count === 0) return null;

        return (
          <button
            key={system}
            onClick={() => onSelect(system)}
            className={`flex justify-between items-center px-3 py-1.5 rounded-md text-sm text-left transition-colors ${
              selected === system
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>{system}</span>
            <span className={`text-xs ${selected === system ? "text-gray-300" : "text-gray-400"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}