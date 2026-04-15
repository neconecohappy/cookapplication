import type { FridgeItem, ShoppingItem } from "./types";

/**
 * レシピ全材料を冷蔵庫在庫と突き合わせて「買う」「家にある」に振り分ける。
 * 食材名の完全一致でマッチング（プロンプトで名前統一を担保）。
 */
export function splitShoppingList(
  allIngredients: { name: string; totalAmount: string; note: string }[],
  fridgeItems: FridgeItem[]
): { toBuy: ShoppingItem[]; alreadyHave: ShoppingItem[] } {
  const fridge = new Map<string, string>();
  fridgeItems.forEach((f) => fridge.set(f.name, f.estimatedAmount));

  const toBuy: ShoppingItem[] = [];
  const alreadyHave: ShoppingItem[] = [];

  for (const item of allIngredients) {
    if (fridge.has(item.name)) {
      alreadyHave.push({
        name: item.name,
        qty: fridge.get(item.name)!,
        note: item.note + "（冷蔵庫から）",
        fromFridge: true,
      });
    } else {
      toBuy.push({
        name: item.name,
        qty: item.totalAmount,
        note: item.note,
        fromFridge: false,
      });
    }
  }

  return { toBuy, alreadyHave };
}
