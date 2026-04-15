import Anthropic from "@anthropic-ai/sdk";

export type ApiErrorInfo = {
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
};

export function handleAnthropicError(error: unknown): ApiErrorInfo {
  if (error instanceof Anthropic.APIError) {
    switch (error.status) {
      case 429:
        return {
          message: "APIが混雑しています。しばらく待ってからお試しください。",
          retryable: true,
          retryAfterMs: 30_000,
        };
      case 529:
        return {
          message: "AIサーバーが混雑しています。数分後にお試しください。",
          retryable: true,
          retryAfterMs: 5_000,
        };
      case 401:
        return {
          message:
            "APIキーの設定に問題があります。管理者にお問い合わせください。",
          retryable: false,
        };
      default:
        return {
          message: "エラーが発生しました。もう一度お試しください。",
          retryable: true,
          retryAfterMs: 3_000,
        };
    }
  }
  return { message: "通信エラーが発生しました。", retryable: true };
}

/**
 * 指数バックオフ付きリトライ（429 / 529 のみリトライ対象）
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelayMs = 5000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const isRetryable =
        error instanceof Anthropic.APIError &&
        (error.status === 429 || error.status === 529);

      if (!isRetryable) throw error;

      const delay = initialDelayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Maximum retries exceeded");
}
