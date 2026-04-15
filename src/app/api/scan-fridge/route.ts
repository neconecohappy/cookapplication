import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SCAN_FRIDGE_PROMPT } from "@/lib/prompts/scan-fridge";
import { safeParseJSON } from "@/lib/parse-json";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { handleAnthropicError } from "@/lib/api-error";
import type { FridgeItem } from "@/lib/types";

const MAX_PAYLOAD_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(req: Request) {
  // レート制限
  const ip = getClientIP(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "リクエスト回数の上限に達しました。1時間後にお試しください。" },
      { status: 429 }
    );
  }

  // サイズチェック
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > MAX_PAYLOAD_SIZE) {
    return NextResponse.json(
      {
        error:
          "画像サイズが大きすぎます。1枚あたり500KB以下にしてください。",
      },
      { status: 413 }
    );
  }

  let images: string[] = [];
  try {
    const body = await req.json();
    images = body.images || [];
  } catch {
    return NextResponse.json({ error: "リクエストが不正です" }, { status: 400 });
  }

  if (images.length === 0) {
    return NextResponse.json(
      { error: "画像が指定されていません" },
      { status: 400 }
    );
  }
  if (images.length > 4) {
    return NextResponse.json(
      { error: "画像は最大4枚までです" },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "APIキーが設定されていません" },
      { status: 500 }
    );
  }

  try {
    const client = new Anthropic();

    const content: Anthropic.ContentBlockParam[] = [
      ...images.map(
        (img) =>
          ({
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: img,
            },
          }) as Anthropic.ImageBlockParam
      ),
      {
        type: "text",
        text: "この冷蔵庫の写真から食材を識別してJSONで出力してください。",
      },
    ];

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SCAN_FRIDGE_PROMPT,
      messages: [{ role: "user", content }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const parsed = safeParseJSON<{
      ingredients: Omit<FridgeItem, "id" | "confirmed">[];
    }>(text);

    if (!parsed || !parsed.ingredients) {
      return NextResponse.json(
        {
          error:
            "認識できませんでした。明るい場所で再撮影してください。",
        },
        { status: 500 }
      );
    }

    // id と confirmed を付与
    const ingredients: FridgeItem[] = parsed.ingredients.map((ing) => ({
      ...ing,
      id: crypto.randomUUID(),
      confirmed: ing.confidence === "high",
    }));

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error("scan-fridge error:", error);
    const info = handleAnthropicError(error);
    return NextResponse.json({ error: info.message }, { status: 500 });
  }
}
