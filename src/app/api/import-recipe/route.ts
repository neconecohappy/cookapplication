import { NextResponse } from "next/server";
import { extractJsonLd, convertJsonLdToRecipe } from "@/lib/recipe-parser";
import { stripHtml } from "@/lib/strip-html";
import { safeParseJSON } from "@/lib/parse-json";

export async function POST(req: Request) {
  const { url, type = "main" } = await req.json();

  // 1. ページ取得
  let html: string;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible)" },
      signal: AbortSignal.timeout(10000), // 10秒タイムアウト
    });
    if (!res.ok) {
      return NextResponse.json({ error: "ページを読み込めませんでした" }, { status: 400 });
    }
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "ページの取得に失敗しました" }, { status: 400 });
  }

  // 2. JSON-LDでパース（無料）
  const jsonLd = extractJsonLd(html);
  if (jsonLd) {
    const recipe = convertJsonLdToRecipe(jsonLd, type as "main" | "side" | "soup");
    if (recipe) {
      const recipeName = (jsonLd.name as string) || "レシピ";
      return NextResponse.json({ recipe, name: recipeName, method: "json-ld" });
    }
  }

  // 3. JSON-LDがない場合のみ Claude API にフォールバック（有料）
  // Anthropic APIキーが設定されていない場合はエラーを返す
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "このサイトはJSON-LD非対応のため、自動取り込みできませんでした。手動で追加してください。" },
      { status: 422 }
    );
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const textContent = stripHtml(html).slice(0, 4000);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: IMPORT_RECIPE_PROMPT,
      messages: [
        { role: "user", content: `URL: ${url}\n\n${textContent}` },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const parsed = safeParseJSON<{ name: string; servings: string; ingredients: { name: string; amount: string }[]; steps: string[]; point: string | null }>(text);

    if (!parsed) {
      return NextResponse.json({ error: "レシピの変換に失敗しました" }, { status: 422 });
    }

    const recipe = {
      servings: parsed.servings || "4人分",
      ingredients: (parsed.ingredients || []).map((i) => ({
        name: i.name,
        amount: i.amount,
        fromFridge: false,
      })),
      steps: parsed.steps || [],
      point: parsed.point || null,
    };

    return NextResponse.json({ recipe, name: parsed.name || "レシピ", method: "ai-fallback" });
  } catch {
    return NextResponse.json({ error: "AI解析に失敗しました" }, { status: 500 });
  }
}

// AIフォールバック用プロンプト（JSON-LDがないサイトのみ使用）
const IMPORT_RECIPE_PROMPT = `
あなたはレシピ変換の専門家です。
Webページの内容からレシピを読み取り、JSON形式に変換してください。

【重要】元サイトの手順文をそのままコピーしない。自分の言葉で書き直す。

【変換ルール】
- 4人家族（大人2人＋中高生男子2人）向けの分量に調整
- 手順は3〜5ステップに簡略化
- 各材料には調味料の分量も正確に記載

JSONのみ出力。コードブロック不要。
{ "name": "料理名", "servings": "4人分",
  "ingredients": [{"name": "豚バラ肉", "amount": "400g"}, {"name": "醤油", "amount": "大さじ3"}],
  "steps": ["① ...", "② ..."], "point": "コツやポイント" }
`;
