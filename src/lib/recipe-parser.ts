/**
 * URLからレシピを取り込む（無料版）
 * 1. ページのHTML取得
 * 2. JSON-LD（Schema.org Recipe）を抽出
 * 3. アプリのRecipe型に変換
 * 4. 分量を4人分に自動調整
 * 5. タグを自動付与
 *
 * JSON-LDが見つからない場合はnullを返す → 呼び出し側でAIフォールバック判断
 */

import type { Recipe } from "@/lib/types";

// ─── 1. JSON-LD抽出 ───
export function extractJsonLd(html: string): Record<string, unknown> | null {
  // <script type="application/ld+json"> タグの中身をすべて取得
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [...html.matchAll(jsonLdRegex)];

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);

      // 直接Recipeの場合
      if (data["@type"] === "Recipe") return data;

      // @graph内にRecipeがある場合
      if (Array.isArray(data["@graph"])) {
        const recipe = data["@graph"].find(
          (item: Record<string, unknown>) => item["@type"] === "Recipe"
        );
        if (recipe) return recipe;
      }

      // 配列の場合
      if (Array.isArray(data)) {
        const recipe = data.find(
          (item: Record<string, unknown>) => item["@type"] === "Recipe"
        );
        if (recipe) return recipe;
      }
    } catch {
      continue; // パース失敗は無視して次のタグを試す
    }
  }
  return null;
}

// ─── 2. 分量調整 ───
export function adjustServings(
  ingredientText: string,
  originalServings: number,
  targetServings: number = 4
): { name: string; amount: string } {
  const ratio = targetServings / originalServings;

  // "豚バラ 300g" → name: "豚バラ", amount: "300g"
  // 数値部分を抽出して倍率をかける
  const numMatch = ingredientText.match(/(\d+\.?\d*)\s*(g|kg|ml|l|cc|本|個|枚|切れ|片|束|袋|パック|大さじ|小さじ|カップ|合)?/);

  if (numMatch) {
    const originalAmount = parseFloat(numMatch[1]);
    const unit = numMatch[2] || "";
    const adjustedAmount = Math.round(originalAmount * ratio);

    // 食材名（数値より前の部分 or 数値を除いた部分）
    const name = ingredientText.replace(/\d+\.?\d*\s*(g|kg|ml|l|cc|本|個|枚|切れ|片|束|袋|パック|大さじ|小さじ|カップ|合)?/, "").trim();

    return { name: name || ingredientText, amount: `${adjustedAmount}${unit}` };
  }

  // 数値が見つからない場合（"適量"、"少々" 等）
  const name = ingredientText.replace(/[\s\u3000]+適量|[\s\u3000]+少々/g, "").trim();
  return { name: name || ingredientText, amount: "適量" };
}

// ─── 3. 元の人数を解析 ───
export function parseServings(yieldText: string | undefined): number {
  if (!yieldText) return 2; // デフォルト2人分と仮定
  const match = yieldText.match(/(\d+)/);
  return match ? parseInt(match[1]) : 2;
}

// ─── 4. タグ自動付与 ───
export function autoAssignTags(
  name: string,
  ingredients: string[],
  cookTimeMinutes: number | null,
  type: "main" | "side" | "soup"
): string[] {
  const tags: string[] = [];
  const allText = [name, ...ingredients].join(" ").toLowerCase();

  // 肉の種類
  if (/豚|ポーク/.test(allText)) tags.push("pork");
  if (/鶏|チキン|とり/.test(allText)) tags.push("chicken");
  if (/牛|ビーフ/.test(allText)) tags.push("beef");
  if (/ひき肉|挽肉|ミンチ|合い?びき/.test(allText)) tags.push("ground_meat");
  if (/鮭|さば|ぶり|鯖|鰤|マグロ|えび|海老|イカ|たら|鱈|アジ|鯵/.test(allText)) tags.push("fish_main");

  // 調理法
  if (/丼|どんぶり|ドンブリ/.test(name)) tags.push("donburi");
  if (/炒め|チャーハン|回鍋/.test(allText)) tags.push("stir_fry");
  if (/焼き|グリル|ソテー/.test(allText)) tags.push("grilled");
  if (/揚げ|フライ|唐揚|天ぷら|カツ/.test(allText)) tags.push("deep_fried");
  if (/煮|シチュー|カレー|肉じゃが/.test(allText)) tags.push("simmered");
  if (/麺|うどん|そば|パスタ|焼きそば|ラーメン|ナポリタン/.test(allText)) tags.push("noodle");
  if (/冷凍/.test(allText)) tags.push("frozen_food");

  // 時間タグ
  if (cookTimeMinutes !== null) {
    if (cookTimeMinutes <= 5) tags.push("under_5min");
    if (cookTimeMinutes <= 10) tags.push("under_10min");
    if (cookTimeMinutes <= 15) tags.push("under_15min");
  }

  // 副菜タグ
  if (type === "side") {
    tags.push("make_ahead");
    if (/サラダ|マリネ|酢/.test(allText)) tags.push("cold_dish", "salad");
    if (/ナムル|和え/.test(allText)) tags.push("cold_dish", "namul");
    if (/煮|きんぴら/.test(allText)) tags.push("hot_dish");
  }

  // 汁物タグ
  if (type === "soup") {
    if (/インスタント|即席|カップ/.test(allText)) tags.push("instant");
    else tags.push("homemade_soup");
    if (/味噌|みそ/.test(allText)) tags.push("miso_soup");
  }

  // ボリューム・節約
  if (/もやし|豆腐|鶏むね|ささみ/.test(allText)) tags.push("budget");
  tags.push("volume"); // 4人家族で量多めなので基本的に付ける

  return [...new Set(tags)]; // 重複除去
}

// ─── 5. 食材カテゴリ自動判定 ───
export function autoAssignCategory(ingredientName: string): string {
  if (/豚|鶏|牛|肉|ベーコン|ハム|ソーセージ|ウインナー/.test(ingredientName)) return "meat";
  if (/鮭|さば|ぶり|えび|イカ|マグロ|ツナ|しらす|たら|アジ|魚/.test(ingredientName)) return "fish";
  if (/卵|牛乳|チーズ|ヨーグルト|バター|生クリーム/.test(ingredientName)) return "egg_dairy";
  if (/冷凍/.test(ingredientName)) return "frozen";
  if (/醤油|みりん|酒|塩|砂糖|酢|味噌|ソース|ケチャップ|マヨネーズ|油|オイル|だし|コンソメ|鶏ガラ|こしょう|胡椒|にんにく|しょうが|チューブ/.test(ingredientName)) return "seasoning";
  if (/ご飯|米|パスタ|麺|うどん|そば|パン|小麦粉|片栗粉/.test(ingredientName)) return "grain";
  if (/スープ|味噌汁|インスタント/.test(ingredientName)) return "soup_base";
  // 上記に該当しなければ野菜とみなす
  return "vegetable";
}

// ─── 6. ISO 8601 duration → 分 ───
export function parseDuration(isoDuration: string | undefined): number | null {
  if (!isoDuration) return null;
  // "PT15M" → 15, "PT1H30M" → 90
  const hourMatch = isoDuration.match(/(\d+)H/);
  const minMatch = isoDuration.match(/(\d+)M/);
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;
  return hours * 60 + minutes || null;
}

// ─── メイン: JSON-LDからRecipeオブジェクトに変換 ───
// 注意: アプリの既存Recipe型に合わせて変換する
export function convertJsonLdToRecipe(
  jsonLd: Record<string, unknown>,
  _type: "main" | "side" | "soup"
): Recipe | null {
  try {
    const name = jsonLd.name as string;
    if (!name) return null;

    const originalServings = parseServings(jsonLd.recipeYield as string);
    const cookTime = parseDuration(jsonLd.cookTime as string);

    // 材料の変換（4人分に調整）
    const rawIngredients = (jsonLd.recipeIngredient as string[]) || [];
    const ingredients = rawIngredients.map((text) => {
      const adjusted = adjustServings(text, originalServings, 4);
      return {
        name: adjusted.name,
        amount: adjusted.amount,
        fromFridge: false,
      };
    });

    // 手順の変換
    let steps: string[] = [];
    const rawInstructions = jsonLd.recipeInstructions;
    if (Array.isArray(rawInstructions)) {
      steps = rawInstructions.map((step, i) => {
        const text = typeof step === "string" ? step : (step as Record<string, string>).text || "";
        return `${"①②③④⑤⑥⑦⑧⑨⑩"[i] || `${i + 1}.`} ${text}`;
      });
    }

    return {
      servings: "4人分",
      ingredients,
      steps: steps.slice(0, 8),
      point: cookTime ? `調理時間: 約${cookTime}分` : null,
    };
  } catch {
    return null;
  }
}
