import type { AppState } from "./types";

const STORAGE_KEY = "meal-planner-state-v1";

const defaultState: AppState = {
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

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
