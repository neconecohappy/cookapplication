"use client";

import { useState } from "react";
import type { FavoriteMeal, MenuItem } from "@/lib/types";

export function FavoritesTab({
  favorites,
  onRemove,
  onViewRecipe,
  onAddFromYoutube,
  selectedFavorites,
  onToggleSelectedFavorite,
}: {
  favorites: FavoriteMeal[];
  onRemove: (name: string) => void;
  onViewRecipe: (menuItem: MenuItem) => void;
  onAddFromYoutube: (fav: FavoriteMeal) => void;
  selectedFavorites: string[];
  onToggleSelectedFavorite: (name: string) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [ytUrl, setYtUrl] = useState("");
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [ytPreview, setYtPreview] = useState<{
    videoId: string;
    title: string;
    dishName: string;
    thumbnail: string;
    channel: string;
    url: string;
    recipe?: {
      servings: string;
      ingredients: { name: string; amount: string; fromFridge: boolean }[];
      steps: string[];
      point: string | null;
      time: string;
    };
  } | null>(null);

  const handleFetchYoutube = async () => {
    if (!ytUrl.trim()) return;
    setYtLoading(true);
    setYtError(null);
    setYtPreview(null);

    try {
      const res = await fetch("/api/youtube-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setYtError(data.error || "取得に失敗しました");
        return;
      }
      setYtPreview(data);
    } catch {
      setYtError("通信エラーが発生しました");
    } finally {
      setYtLoading(false);
    }
  };

  const handleSaveYoutube = () => {
    if (!ytPreview) return;
    const r = ytPreview.recipe;
    const fav: FavoriteMeal = {
      id: `yt-${Date.now()}`,
      name: ytPreview.dishName,
      menuItem: {
        name: ytPreview.dishName,
        time: r?.time || "動画を参照",
        memo: ytPreview.title,
        bento: null,
        shared: null,
        recipe: {
          servings: r?.servings || "4人分",
          ingredients: r?.ingredients || [],
          steps: [
            ...(r?.steps || []),
            `📺 動画: ${ytPreview.url}`,
          ],
          point: r?.point || `${ytPreview.channel} のレシピ`,
        },
      },
      addedAt: new Date().toISOString(),
      youtubeUrl: ytPreview.url,
      youtubeThumbnail: ytPreview.thumbnail,
    };
    onAddFromYoutube(fav);
    setYtUrl("");
    setYtPreview(null);
  };

  return (
    <div className="p-4 space-y-3">
      {/* YouTube URL 入力 */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <div className="text-[13px] font-bold text-gray-700 mb-2">
          📺 YouTubeから追加
        </div>
        <p className="text-[11px] text-gray-400 mb-2">
          ショート動画やレシピ動画のURLを貼り付けて保存できます
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            placeholder="YouTubeのURLを貼り付け"
            className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-[13px]"
            onKeyDown={(e) => e.key === "Enter" && handleFetchYoutube()}
          />
          <button
            onClick={handleFetchYoutube}
            disabled={!ytUrl.trim() || ytLoading}
            className="h-10 px-3 rounded-lg bg-[#e8725a] text-white text-[13px] font-bold disabled:opacity-50"
          >
            {ytLoading ? "..." : "取得"}
          </button>
        </div>

        {ytError && (
          <div className="mt-2 text-[12px] text-red-500">⚠️ {ytError}</div>
        )}

        {ytPreview && (
          <div className="mt-3 rounded-lg border border-gray-200 p-3">
            <div className="flex gap-3">
              <img
                src={ytPreview.thumbnail}
                alt=""
                className="w-24 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-gray-800 line-clamp-2">
                  {ytPreview.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {ytPreview.channel}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[12px] text-gray-600">料理名:</span>
              <span className="text-[13px] font-bold text-[#e8725a]">
                {ytPreview.dishName}
              </span>
            </div>
            {ytPreview.recipe && ytPreview.recipe.ingredients.length > 0 && (
              <div className="mt-2">
                <div className="text-[11px] font-bold text-gray-600 mb-1">推定レシピ:</div>
                <div className="text-[11px] text-gray-500">
                  ⏱ {ytPreview.recipe.time} ・ {ytPreview.recipe.servings}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  材料: {ytPreview.recipe.ingredients.map(i => i.name).join("、")}
                </div>
              </div>
            )}
            <button
              onClick={handleSaveYoutube}
              className="mt-2 w-full h-9 rounded-lg bg-gradient-to-r from-[#e8725a] to-[#f4a261] text-white text-[13px] font-bold"
            >
              ❤️ お気に入りに保存
            </button>
          </div>
        )}
      </div>

      {/* お気に入り一覧 */}
      <div className="rounded-xl bg-white shadow-sm p-3">
        <div className="text-[13px] font-bold text-gray-700">
          ❤️ お気に入りメニュー（{favorites.length}件）
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          チェックを入れると次回の献立に含めます
        </div>
        {selectedFavorites.length > 0 && (
          <div className="mt-1.5 text-[12px] text-[#e8725a] font-bold">
            ✅ {selectedFavorites.length}品を献立に含める予定
          </div>
        )}
      </div>

      {favorites.length === 0 && (
        <div className="rounded-xl bg-white shadow-sm p-5 text-center text-gray-500 text-[13px] leading-relaxed">
          <p className="text-2xl mb-1">🍽️</p>
          <p>
            献立タブのハートボタンか、
            <br />
            上のYouTube URLで追加できます。
          </p>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <h3 className="font-bold text-[15px] mb-2">お気に入りから削除</h3>
            <p className="text-[13px] text-gray-600 mb-4">
              「{deleteTarget}」を削除しますか？
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 rounded-lg border border-gray-300 text-[13px]"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  onRemove(deleteTarget);
                  setDeleteTarget(null);
                }}
                className="flex-1 h-10 rounded-lg bg-red-500 text-white text-[13px] font-bold"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {favorites.map((fav) => {
        const isSelected = selectedFavorites.includes(fav.name);
        return (
        <div
          key={fav.id}
          className={`rounded-xl shadow-sm p-4 active:scale-[0.99] transition-all ${
            isSelected ? "bg-[#fff8f6] border-2 border-[#e8725a]" : "bg-white border-2 border-transparent"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* チェックボックス */}
            <button
              onClick={() => onToggleSelectedFavorite(fav.name)}
              className="flex-shrink-0 mt-1"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                isSelected ? "bg-[#e8725a] border-[#e8725a]" : "border-gray-300"
              }`}>
                {isSelected && <span className="text-white text-[12px]">✓</span>}
              </div>
            </button>
            {fav.youtubeThumbnail && (
              <a
                href={fav.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <img
                  src={fav.youtubeThumbnail}
                  alt=""
                  className="w-20 h-14 rounded-lg object-cover"
                />
                <div className="text-[9px] text-center text-red-500 mt-0.5">
                  ▶ YouTube
                </div>
              </a>
            )}
            <div className="flex-1 min-w-0">
              <button
                onClick={() =>
                  fav.youtubeUrl
                    ? window.open(fav.youtubeUrl, "_blank")
                    : onViewRecipe(fav.menuItem)
                }
                className="text-left w-full"
              >
                <div className="text-[15px] font-bold text-gray-800 mb-1">
                  🔥 {fav.name}
                </div>
                <div className="text-[12px] text-gray-500">
                  {fav.youtubeUrl ? (
                    <>📺 {fav.menuItem.recipe.point}</>
                  ) : (
                    <>
                      ⏱ {fav.menuItem.time}
                      {fav.menuItem.bento && " ・ 🍱 弁当OK"}
                    </>
                  )}
                </div>
                {!fav.youtubeUrl && fav.menuItem.recipe.point && (
                  <div className="mt-1.5 text-[11px] text-[#e8725a] bg-[#fff3e0] rounded-lg px-2 py-1">
                    💡 {fav.menuItem.recipe.point}
                  </div>
                )}
                {!fav.youtubeUrl && (
                  <div className="mt-2 text-[11px] text-gray-400">
                    材料:{" "}
                    {fav.menuItem.recipe.ingredients
                      .map((i) => i.name)
                      .join("、") || "なし"}
                  </div>
                )}
              </button>
            </div>
            <button
              onClick={() => setDeleteTarget(fav.name)}
              className="text-[18px] text-gray-300 hover:text-red-400 flex-shrink-0 mt-1 transition-colors"
              title="お気に入りから削除"
            >
              🗑️
            </button>
          </div>
          <div className="text-[10px] text-gray-300 mt-2">
            追加日: {new Date(fav.addedAt).toLocaleDateString("ja-JP")}
          </div>
        </div>
        );
      })}
    </div>
  );
}
