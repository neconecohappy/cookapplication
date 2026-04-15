import type { FridgeItem } from "@/lib/types";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateForPrompt(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = WEEKDAYS[date.getDay()];
  return `${m}/${d}（${dow}）`;
}

export function buildGeneratePrompt(
  fridgeIngredients: FridgeItem[],
  dislikedIngredients: string[],
  allergyIngredients: string[],
  selectedDates: string[],
  recentMealNames: string[] = [],
  requestedFavorites: string[] = []
): string {
  const fridgeList =
    fridgeIngredients.length > 0
      ? fridgeIngredients
          .map((f) => `・${f.name}（${f.estimatedAmount}）`)
          .join("\n")
      : "（なし）";

  const allergyList =
    allergyIngredients.length > 0
      ? allergyIngredients.map((a) => `・${a}`).join("\n")
      : "（なし）";

  const dislikedList =
    dislikedIngredients.length > 0
      ? dislikedIngredients.map((d) => `・${d}`).join("\n")
      : "（なし）";

  const numDays = selectedDates.length;

  // 日付リストを生成（例: "Day1: 4/13（月）, Day2: 4/14（火）, ..."）
  const dateList = selectedDates
    .map((d, i) => `Day${i + 1}: ${formatDateForPrompt(d)}`)
    .join("\n");

  // 弁当対象日を判定（月〜金 = 平日のみ）
  const bentoDays = selectedDates
    .map((d, i) => {
      const [y, m, day] = d.split("-").map(Number);
      const dow = new Date(y, m - 1, day).getDay();
      return dow >= 1 && dow <= 5 ? `Day${i + 1}` : null;
    })
    .filter(Boolean);

  // 作り置き副菜のグループ分け（3日ずつ、もしくは日数に応じて）
  let sideRules: string;
  if (numDays <= 3) {
    sideRules = `- 副菜は1種類を${numDays}日間使い回す（作り置きA）
  - 初回作成日に${numDays}日分まとめて作る分量で記載
  - 保存方法「清潔な容器で冷蔵保存」の注記を付ける
  - 最終日にアレンジ案があれば記載`;
  } else {
    const halfA = Math.ceil(numDays / 2);
    const halfB = numDays - halfA;
    sideRules = `- 副菜は2種類を使い回す
  - 作り置きA: Day1〜Day${halfA}（${halfA}日間）
  - 作り置きB: Day${halfA + 1}〜Day${numDays}（${halfB}日間）
  - 作り置きレシピは初回作成日にまとめて作る分量で記載
  - 保存方法「清潔な容器で冷蔵保存」の注記を付ける
  - 3日目以降にアレンジ案があれば記載（例：ごま油を足す等）`;
  }

  // 楽Day・どんぶり・下味冷凍（3日以上なら含める）
  const specialRules =
    numDays >= 3
      ? `- 週1回は冷凍食品メインの「楽Day」を含む（業務スーパーの冷凍食品推奨）
- どんぶりメニューを最低1回含む（楽Dayと同日でも可）
- 下味冷凍メニューを最低1回含む（前日仕込み前提、楽Day以外の日に配置を推奨）`
      : numDays >= 2
        ? `- どんぶりメニューを最低1回含む`
        : "";

  const recentList =
    recentMealNames.length > 0
      ? recentMealNames.map((n) => `・${n}`).join("\n")
      : "（なし）";

  const favoritesList =
    requestedFavorites.length > 0
      ? requestedFavorites.map((n) => `・${n}`).join("\n")
      : "";

  return `あなたは家庭料理の献立プランナーです。
以下の条件に従って、${numDays}日分の献立＋レシピ＋買い物リストをJSON形式で出力してください。
インターネット上の人気レシピや旬の食材を参考に、季節感のあるバリエーション豊かな献立を提案してください。
主菜だけでなく副菜もネットで人気のレシピ（クックパッド・白ごはん.com・Nadiaなどで人気のもの）を参考にしてバリエーション豊かに提案してください。

【対象日程】
${dateList}

【★直近で提案済みのメニュー（重複禁止）】
以下のメニューは直近で提案済みです。同じメニュー名は絶対に使わず、別の料理を提案してください。
${recentList}
${favoritesList ? `
【★お気に入りメニュー（必ず含める）】
以下のメニューはユーザーのお気に入りです。必ず献立に含めてください（重複禁止リストより優先）。
${favoritesList}
` : ""}
【家族構成】
- 4人家族（大人2人＋中学生男子1人＋高校生男子1人）
- 食べ盛りの男子がいるので量は多め
- 1人あたりご飯300g以上を想定

【献立ルール】
- ${numDays}日分の献立を作成
- 1日の構成: 主菜＋副菜＋汁物＋ご飯
- 全品の調理時間合計が20分以内
${sideRules}
${specialRules}
- 汁物はインスタントスープでもOK
- 肉メインを多め
- 毎回異なるメニューをバリエーション豊かに提案する

【★アレルギー食材（絶対に使用禁止）】
以下は命に関わるため、食材そのものはもちろん、派生調味料・加工品も含め絶対に使用しないでください。
${allergyList}

【★嫌いな食材（できるだけ避ける）】
以下の食材はできるだけ避け、代替食材で対応してください。
どうしても使う場合は、味が目立たない調理法にしてください。
${dislikedList}

【★冷蔵庫にある食材】
以下の食材は冷蔵庫にあります。できるだけ優先的に使ってください。
使い切れない場合は無理に全部使わなくてOKです。
${fridgeList}

【冷蔵庫食材の参照ルール（重要）】
冷蔵庫にある食材をレシピで使う場合、レシピのingredients内のnameは
冷蔵庫の食材名と完全に同じ表記にしてください。
例：冷蔵庫に「豚バラ肉（約300g）」がある場合、
レシピでは「豚バラ肉」と記載し「豚バラ薄切り」等にしない。
冷蔵庫にない食材は自由な名前でOK。

【レシピルール】
- 4人分の分量で記載
- 手順は3〜5ステップ、簡潔に
- 下味冷凍の仕込み手順も記載
- 各材料にfromFridgeフラグを付ける（冷蔵庫から使う場合true、そうでなければfalse）

【買い物リストルール】
- ${numDays}日分の全食材を集約
- 同じ食材は合算
- 「toBuy」（新しく買うもの）と「alreadyHave」（冷蔵庫にあるもの）を分ける
- 冷蔵庫の食材で量が足りない場合は不足分をtoBuyに入れる
- カテゴリ分け（この順番・名前で必ず分ける）: 🥩 肉類、🐟 魚介類、🥬 野菜・その他、🧂 調味料・乾物

【弁当】
${bentoDays.length > 0 ? `- ${bentoDays.join("・")}は高校生の弁当用に主菜から取り分けできるようにする\n- 土日は弁当なし\n- 取り分け方法を各主菜のbentoフィールドに記載` : "- 弁当対象日なし（bentoフィールドはnull）"}

【予算】
- 業務スーパー・ドン・キホーテの価格帯を意識
- 新規購入分（toBuy）のみの予算概算を出す
- 冷蔵庫活用による節約額も記載

【出力フォーマット】
以下のJSON形式のみを出力してください。
説明文やマークダウンのコードブロック（\`\`\`）は絶対に付けないでください。
JSONの先頭は必ず { で始めてください。
dayフィールドには対象日程の日付表記をそのまま使ってください。

{
  "mealPlan": [
    {
      "day": "${formatDateForPrompt(selectedDates[0] || "2026-04-13")}",
      "label": "🍚 どんぶりで楽Day",
      "main": {
        "name": "豚バラスタミナ丼",
        "time": "10分",
        "memo": "簡単な説明",
        "bento": "弁当取り分けメモ",
        "shared": null,
        "recipe": {
          "servings": "4人分",
          "ingredients": [
            { "name": "豚バラ肉", "amount": "400g", "fromFridge": true }
          ],
          "steps": ["① ...", "② ..."],
          "point": "コツ"
        }
      },
      "side": { "name": "...", "time": "...", "memo": "...", "bento": null, "shared": "A", "recipe": { } },
      "soup": { "name": "...", "time": "...", "memo": "...", "bento": null, "shared": null, "recipe": { } },
      "freeze": null
    }
  ],
  "shoppingList": {
    "toBuy": [
      { "category": "🥩 肉", "items": [ { "name": "鶏むね肉", "qty": "600g", "note": "用途", "fromFridge": false } ] }
    ],
    "alreadyHave": [
      { "category": "🥩 肉", "items": [ { "name": "豚バラ肉", "qty": "300g", "note": "用途", "fromFridge": true } ] }
    ]
  },
  "freezePrep": [
    { "name": "鶏むね照り焼き用", "ingredients": "材料と調味料", "steps": ["① ...", "② ..."], "forDay": "Day2用" }
  ],
  "tips": ["💰 ...", "⏰ ...", "🍱 ..."],
  "estimatedBudget": "約5,000円（冷蔵庫活用で約1,500円節約）"
}`;
}
