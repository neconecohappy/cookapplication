import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildGeneratePrompt } from "@/lib/prompts/generate";
import { safeParseJSON } from "@/lib/parse-json";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { handleAnthropicError } from "@/lib/api-error";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";

export async function POST(req: Request) {
  // レート制限
  const ip = getClientIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "リクエスト回数の上限に達しました。1時間後にお試しください。" },
      { status: 429 }
    );
  }

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "APIキーが設定されていません" },
      { status: 500 }
    );
  }

  const { fridgeIngredients, dislikedIngredients, allergyIngredients, selectedDates, recentMealNames, requestedFavorites } = body;
  if (!selectedDates || selectedDates.length === 0) {
    return NextResponse.json({ error: "日付が選択されていません" }, { status: 400 });
  }
  const systemPrompt = buildGeneratePrompt(
    fridgeIngredients || [],
    dislikedIngredients || [],
    allergyIngredients || [],
    selectedDates,
    recentMealNames || [],
    requestedFavorites || []
  );

  const url = new URL(req.url);
  const useStream = url.searchParams.get("stream") !== "false";

  const client = new Anthropic();

  const requestParams = {
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [
      {
        role: "user" as const,
        content:
          `${selectedDates.length}日分の献立を作成してください。バリエーション豊かにお願いします。`,
      },
    ],
  };

  // 非ストリーミング（フォールバック用）
  if (!useStream) {
    try {
      let parsed: GenerateResponse | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        const message = await client.messages.create(requestParams);
        const text =
          message.content[0].type === "text" ? message.content[0].text : "";
        parsed = safeParseJSON<GenerateResponse>(text);
        if (parsed && parsed.mealPlan && parsed.shoppingList) break;
      }
      if (!parsed) {
        return NextResponse.json(
          { error: "献立の生成に失敗しました。もう一度お試しください。" },
          { status: 500 }
        );
      }
      return NextResponse.json(parsed);
    } catch (error) {
      console.error("generate (non-stream) error:", error);
      const info = handleAnthropicError(error);
      return NextResponse.json({ error: info.message }, { status: 500 });
    }
  }

  // ストリーミング
  try {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = client.messages.stream(requestParams);
          stream.on("text", (text: string) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          });
          await stream.finalMessage();
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("stream error:", error);
          const info = handleAnthropicError(error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: info.message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("generate error:", error);
    const info = handleAnthropicError(error);
    return NextResponse.json({ error: info.message }, { status: 500 });
  }
}
