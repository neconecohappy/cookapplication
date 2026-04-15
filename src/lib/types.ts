// 全型定義

export type Confidence = "high" | "medium" | "low";

export type FridgeItem = {
  id: string;
  name: string;
  estimatedAmount: string;
  confidence: Confidence;
  category: string;
  confirmed: boolean;
};

export type DislikedIngredient = {
  id: string;
  name: string;
  type: "dislike" | "allergy";
  addedAt: string;
};

export type RecipeIngredient = {
  name: string;
  amount: string;
  fromFridge: boolean;
};

export type Recipe = {
  servings: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  point: string | null;
};

export type MenuItem = {
  name: string;
  time: string;
  memo: string;
  bento: string | null;
  shared: string | null; // "A" | "B" | null
  recipe: Recipe;
};

export type DayPlan = {
  day: string;
  label: string;
  main: MenuItem;
  side: MenuItem;
  soup: MenuItem;
  freeze: string | null;
};

export type ShoppingItem = {
  name: string;
  qty: string;
  note: string;
  fromFridge: boolean;
};

export type ShoppingCategory = {
  category: string;
  items: ShoppingItem[];
};

export type ShoppingListResponse = {
  toBuy: ShoppingCategory[];
  alreadyHave: ShoppingCategory[];
};

export type FreezePrep = {
  name: string;
  ingredients: string;
  steps: string[];
  forDay: string;
};

export type GenerateResponse = {
  mealPlan: DayPlan[];
  shoppingList: ShoppingListResponse;
  freezePrep: FreezePrep[];
  tips: string[];
  estimatedBudget: string;
};

export type FavoriteMeal = {
  id: string;
  name: string;
  menuItem: MenuItem;
  addedAt: string;
  youtubeUrl?: string;
  youtubeThumbnail?: string;
};

export type GenerateRequest = {
  fridgeIngredients: FridgeItem[];
  dislikedIngredients: string[];
  allergyIngredients: string[];
  selectedDates: string[];
  recentMealNames: string[]; // 直近の献立名（重複回避用）
  requestedFavorites: string[]; // お気に入りから献立に含めるメニュー名
};

export type ScanFridgeResponse = {
  ingredients: FridgeItem[];
};

export type AppState = {
  currentPlan: GenerateResponse | null;
  generatedAt: string | null;
  checkedItems: Record<string, boolean>;
  fridgeItems: FridgeItem[];
  fridgeScannedAt: string | null;
  dislikedIngredients: DislikedIngredient[];
  allergyIngredients: DislikedIngredient[];
  selectedDates: string[];
  favoriteMeals: FavoriteMeal[];
  mealHistory: string[]; // 過去に生成した主菜名（最大30件保持）
  manualShoppingItems: ManualShoppingItem[];
};

export type ManualShoppingItem = {
  id: string;
  name: string;
  qty: string;
  checked: boolean;
};

export type TabKey = "meal" | "recipe" | "shopping" | "fridge" | "freeze" | "fav" | "settings";
