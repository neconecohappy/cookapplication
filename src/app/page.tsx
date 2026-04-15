"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TabBar } from "@/components/TabBar";
import { MealPlanTab } from "@/components/MealPlanTab";
import { RecipeTab } from "@/components/RecipeTab";
import { ShoppingTab } from "@/components/ShoppingTab";
import { FridgeTab } from "@/components/FridgeTab";
import { FreezeTab } from "@/components/FreezeTab";
import { FavoritesTab } from "@/components/FavoritesTab";
import { SettingsTab } from "@/components/SettingsTab";
import { loadState, saveState, clearState } from "@/lib/storage";
import { safeParseJSON } from "@/lib/parse-json";
import { USE_MOCK } from "@/lib/config";
import { buildMockResponse, replaceOneDayMock, swapDaysMock } from "@/mock/mock-data";
import type {
  AppState,
  TabKey,
  GenerateResponse,
  FridgeItem,
  DislikedIngredient,
  MenuItem,
  ManualShoppingItem,
  FavoriteMeal,
} from "@/lib/types";

const initialState: AppState = {
  currentPlan: null,
  generatedAt: null,
  checkedItems: {},
  fridgeItems: [],
  fridgeScannedAt: null,
  dislikedIngredients: [],
  allergyIngredients: [],
  selectedDates: [],
  favoriteMeals: [],
  mealHistory: [],
  manualShoppingItems: [],
};

export default function Home() {
  const [state, setState] = useState<AppState>(initialState);
  const [activeTab, setActiveTab] = useState<TabKey>("meal");
  const [selectedDay, setSelectedDay] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedFavorites, setSelectedFavorites] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState();
    // selectedDates がなければ空配列にフォールバック
    setState({ ...initialState, ...loaded, selectedDates: loaded.selectedDates || [] });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const updateState = (patch: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleGenerate = async () => {
    if (state.selectedDates.length === 0) return;

    setError(null);
    setIsLoading(true);
    setStreamText("");

    try {
      if (USE_MOCK) {
        const mockResp = buildMockResponse(state.selectedDates, state.mealHistory || [], selectedFavorites, state.favoriteMeals || []);
        await new Promise((r) => setTimeout(r, 800));
        const newHistory = [
          ...(state.mealHistory || []),
          ...mockResp.mealPlan.map((d) => d.main.name),
        ].slice(-30);
        updateState({
          currentPlan: mockResp,
          generatedAt: new Date().toISOString(),
          checkedItems: {},
          mealHistory: newHistory,
        });
        setIsLoading(false);
        return;
      }

      const params = {
        fridgeIngredients: state.fridgeItems,
        dislikedIngredients: state.dislikedIngredients.map((d) => d.name),
        allergyIngredients: state.allergyIngredients.map((a) => a.name),
        selectedDates: state.selectedDates,
        recentMealNames: state.mealHistory || [],
        requestedFavorites: selectedFavorites,
      };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "生成に失敗しました");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data = line.replace("data: ", "");
          if (data === "[DONE]") break;
          try {
            const p = JSON.parse(data) as { text?: string; error?: string };
            if (p.error) streamError = p.error;
            if (p.text) {
              fullText += p.text;
              setStreamText(fullText);
            }
          } catch {
            /* ignore */
          }
        }
      }

      if (streamError) throw new Error(streamError);

      let parsed = safeParseJSON<GenerateResponse>(fullText);

      if (!parsed || !parsed.mealPlan) {
        console.warn("streaming parse failed, falling back to non-streaming");
        const res2 = await fetch("/api/generate?stream=false", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        if (!res2.ok) {
          const data = await res2.json().catch(() => ({}));
          throw new Error(data.error || "生成に失敗しました");
        }
        parsed = (await res2.json()) as GenerateResponse;
      }

      if (!parsed || !parsed.mealPlan) {
        throw new Error("献立の解析に失敗しました");
      }

      const newHistory = [
        ...(state.mealHistory || []),
        ...parsed.mealPlan.map((d) => d.main.name),
      ].slice(-30);
      updateState({
        currentPlan: parsed,
        generatedAt: new Date().toISOString(),
        checkedItems: {},
        mealHistory: newHistory,
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceDay = (dayIndex: number) => {
    if (!state.currentPlan) return;
    const newPlan = replaceOneDayMock(state.currentPlan, dayIndex);
    updateState({ currentPlan: newPlan });
  };

  const handleSwapDays = (dayIndexA: number, dayIndexB: number) => {
    if (!state.currentPlan) return;
    const newPlan = swapDaysMock(state.currentPlan, dayIndexA, dayIndexB);
    updateState({ currentPlan: newPlan });
  };

  const handleOpenRecipe = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    setActiveTab("recipe");
  };

  const handleToggleCheck = (key: string) => {
    setState((prev) => ({
      ...prev,
      checkedItems: { ...prev.checkedItems, [key]: !prev.checkedItems[key] },
    }));
  };

  const handleToggleFavorite = (name: string, menuItem: MenuItem) => {
    setState((prev) => {
      const favs = prev.favoriteMeals || [];
      const exists = favs.find((f) => f.name === name);
      if (exists) {
        return { ...prev, favoriteMeals: favs.filter((f) => f.name !== name) };
      }
      return {
        ...prev,
        favoriteMeals: [
          ...favs,
          {
            id: `fav-${Date.now()}`,
            name,
            menuItem,
            addedAt: new Date().toISOString(),
          },
        ],
      };
    });
  };

  const handleToggleSelectedFavorite = (name: string) => {
    setSelectedFavorites((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAddFromYoutube = (fav: FavoriteMeal) => {
    setState((prev) => ({
      ...prev,
      favoriteMeals: [...(prev.favoriteMeals || []), fav],
    }));
  };

  const handleRemoveFavorite = (name: string) => {
    setState((prev) => ({
      ...prev,
      favoriteMeals: (prev.favoriteMeals || []).filter((f) => f.name !== name),
    }));
    setSelectedFavorites((prev) => prev.filter((n) => n !== name));
  };

  const handleAddManualItem = (name: string, qty: string) => {
    setState((prev) => ({
      ...prev,
      manualShoppingItems: [
        ...(prev.manualShoppingItems || []),
        { id: `manual-${Date.now()}`, name, qty, checked: false },
      ],
    }));
  };

  const handleToggleManualItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      manualShoppingItems: (prev.manualShoppingItems || []).map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleRemoveManualItem = (id: string) => {
    setState((prev) => ({
      ...prev,
      manualShoppingItems: (prev.manualShoppingItems || []).filter(
        (item) => item.id !== id
      ),
    }));
  };

  const handleResetAll = () => {
    clearState();
    setState(initialState);
  };

  if (!hydrated) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-[13px]">
        読み込み中...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#faf8f5] min-h-screen">
      <Header />
      <TabBar active={activeTab} onChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "meal" && (
          <MealPlanTab
            state={state}
            isLoading={isLoading}
            streamText={streamText}
            selectedDates={state.selectedDates || []}
            onDatesChange={(dates) => updateState({ selectedDates: dates })}
            onGenerate={handleGenerate}
            onOpenRecipe={handleOpenRecipe}
            onReplaceDay={handleReplaceDay}
            onSwapDays={handleSwapDays}
            onToggleFavorite={handleToggleFavorite}
            selectedFavorites={selectedFavorites}
            error={error}
          />
        )}
        {activeTab === "recipe" && (
          <RecipeTab
            state={state}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === "shopping" && (
          <ShoppingTab
            state={state}
            onToggle={handleToggleCheck}
            manualItems={state.manualShoppingItems || []}
            onAddManualItem={handleAddManualItem}
            onToggleManualItem={handleToggleManualItem}
            onRemoveManualItem={handleRemoveManualItem}
          />
        )}
        {activeTab === "fridge" && (
          <FridgeTab
            items={state.fridgeItems}
            onUpdate={(items: FridgeItem[]) =>
              updateState({
                fridgeItems: items,
                fridgeScannedAt: new Date().toISOString(),
              })
            }
          />
        )}
        {activeTab === "freeze" && <FreezeTab state={state} />}
        {activeTab === "fav" && (
          <FavoritesTab
            favorites={state.favoriteMeals || []}
            onRemove={handleRemoveFavorite}
            onViewRecipe={() => {}}
            onAddFromYoutube={handleAddFromYoutube}
            selectedFavorites={selectedFavorites}
            onToggleSelectedFavorite={handleToggleSelectedFavorite}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            disliked={state.dislikedIngredients}
            allergy={state.allergyIngredients}
            onUpdateDisliked={(list: DislikedIngredient[]) =>
              updateState({ dislikedIngredients: list })
            }
            onUpdateAllergy={(list: DislikedIngredient[]) =>
              updateState({ allergyIngredients: list })
            }
            onResetAll={handleResetAll}
          />
        )}
      </main>

      {USE_MOCK && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 bg-yellow-200 text-yellow-900 text-[10px] px-2 py-0.5 rounded-full shadow-sm z-20">
          🧪 モックモード
        </div>
      )}
    </div>
  );
}
