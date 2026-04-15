import type { TabKey } from "@/lib/types";

const TABS: { key: TabKey; icon: string; label: string }[] = [
  { key: "meal", icon: "📅", label: "献立" },
  { key: "recipe", icon: "📖", label: "レシピ" },
  { key: "shopping", icon: "🛒", label: "買い物" },
  { key: "fridge", icon: "📷", label: "冷蔵庫" },
  { key: "freeze", icon: "❄️", label: "冷凍" },
  { key: "fav", icon: "❤️", label: "お気に入り" },
  { key: "settings", icon: "⚙️", label: "設定" },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <nav className="sticky top-[60px] z-10 bg-white border-b border-gray-200 flex overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-1 min-w-[52px] flex flex-col items-center py-2 text-[11px] font-medium transition-colors ${
              isActive
                ? "text-[#e8725a] border-b-[3px] border-[#e8725a]"
                : "text-gray-500 border-b-[3px] border-transparent"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
