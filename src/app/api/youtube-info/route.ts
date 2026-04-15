import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

/**
 * YouTube動画のタイトル・概要欄を取得し、
 * 概要欄からレシピを抽出（またはClaude APIで生成）する
 */
export async function POST(req: Request) {
  try {
    const { url } = (await req.json()) as { url: string };

    if (!url) {
      return NextResponse.json({ error: "URLが必要です" }, { status: 400 });
    }

    // YouTube URLのバリデーション
    const ytRegex =
      /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(ytRegex);
    if (!match) {
      return NextResponse.json(
        { error: "有効なYouTube URLを入力してください" },
        { status: 400 }
      );
    }

    const videoId = match[1];
    let title = "";
    let channel = "";
    let description = "";

    if (YOUTUBE_API_KEY) {
      // YouTube Data API v3 で概要欄を取得
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      const ytRes = await fetch(apiUrl);

      if (!ytRes.ok) {
        return NextResponse.json(
          { error: "YouTube APIの呼び出しに失敗しました" },
          { status: 400 }
        );
      }

      const ytData = (await ytRes.json()) as {
        items?: {
          snippet: {
            title: string;
            description: string;
            channelTitle: string;
          };
        }[];
      };

      if (!ytData.items || ytData.items.length === 0) {
        return NextResponse.json(
          { error: "動画が見つかりませんでした" },
          { status: 404 }
        );
      }

      const snippet = ytData.items[0].snippet;
      title = snippet.title;
      channel = snippet.channelTitle;
      description = snippet.description;
    } else {
      // APIキーなし：oEmbed APIでタイトルのみ取得
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl);

      if (!res.ok) {
        return NextResponse.json(
          { error: "動画情報を取得できませんでした" },
          { status: 400 }
        );
      }

      const data = (await res.json()) as {
        title: string;
        author_name: string;
      };
      title = data.title;
      channel = data.author_name;
    }

    // タイトルから料理名を推定
    let dishName = title;
    const bracketMatch = title.match(/[【「](.+?)[】」]/);
    if (bracketMatch) {
      dishName = bracketMatch[1];
    }
    dishName = dishName
      .replace(/[#＃]\S+/g, "")
      .replace(/\s*(レシピ|作り方|簡単|時短|節約|料理|shorts|Shorts)\s*/g, "")
      .trim();

    // レシピ抽出・生成
    type RecipeData = {
      servings: string;
      ingredients: { name: string; amount: string; fromFridge: boolean }[];
      steps: string[];
      point: string | null;
      time: string;
    };

    let recipe: RecipeData;

    if (USE_MOCK) {
      // モック
      recipe = {
        servings: "4人分",
        ingredients: [
          { name: "メイン食材", amount: "適量", fromFridge: false },
          { name: "調味料", amount: "適量", fromFridge: false },
        ],
        steps: [
          `① ${dishName}の材料を準備する`,
          "② 下ごしらえをする",
          "③ 調理する",
          "④ 盛り付けて完成",
        ],
        point: `${channel} のレシピ`,
        time: "15分",
      };
    } else {
      // Claude APIで概要欄を解析してレシピ抽出
      const client = new Anthropic();

      const hasDescription = description.length > 30;
      const prompt = hasDescription
        ? `以下のYouTube料理動画の概要欄からレシピ情報を抽出してJSON形式で出力してください。

動画タイトル: ${title}
チャンネル: ${channel}
概要欄:
---
${description.slice(0, 3000)}
---

概要欄に材料や手順が書かれていればそれを忠実に抽出してください。
4人家族（大人2人＋食べ盛り男子2人）向けに分量を調整してください。
概要欄に材料が見つからない場合は、料理名から一般的なレシピを推定してください。

以下のJSON形式のみを出力してください（説明文やコードブロックは不要）:
{
  "servings": "4人分",
  "ingredients": [
    { "name": "食材名", "amount": "分量", "fromFridge": false }
  ],
  "steps": ["① 手順1", "② 手順2"],
  "point": "コツやポイント",
  "time": "調理時間（例: 15分）"
}`
        : `以下のYouTube料理動画のタイトルから、この料理のレシピを推定してJSON形式で出力してください。

動画タイトル: ${title}
チャンネル: ${channel}
推定料理名: ${dishName}

4人家族（大人2人＋食べ盛り男子2人）向けの分量で作ってください。

以下のJSON形式のみを出力してください（説明文やコードブロックは不要）:
{
  "servings": "4人分",
  "ingredients": [
    { "name": "食材名", "amount": "分量", "fromFridge": false }
  ],
  "steps": ["① 手順1", "② 手順2"],
  "point": "コツやポイント",
  "time": "調理時間（例: 15分）"
}`;

      const msg = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      });

      const text =
        msg.content[0].type === "text" ? msg.content[0].text : "";
      try {
        const cleaned = text
          .replace(/```json?\n?/g, "")
          .replace(/```/g, "")
          .trim();
        recipe = JSON.parse(cleaned);
      } catch {
        recipe = {
          servings: "4人分",
          ingredients: [],
          steps: [],
          point: `${channel} のレシピ`,
          time: "動画を参照",
        };
      }
    }

    return NextResponse.json({
      videoId,
      title,
      dishName,
      description: description.slice(0, 500),
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      channel,
      url: `https://www.youtube.com/shorts/${videoId}`,
      recipe,
    });
  } catch (e) {
    console.error("youtube-info error:", e);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
