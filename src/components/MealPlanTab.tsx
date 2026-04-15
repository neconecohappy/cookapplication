"use client";

import { useState } from "react";
import type { AppState, GenerateResponse, DayPlan, MenuItem } from "@/lib/types";
import { Calendar } from "@/components/Calendar";

type Props = {
  state: AppState;
  isLoading: boolean;
  streamText: string;
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  onGenerate: () => void;
  onOpenRecipe: (dayIndex: number) => void;
  onReplaceDay: (dayIndex: number) => void;
  onSwapDays: (dayIndexA: number, dayIndexB: number) => void;
  onToggleFavorite: (name: string, menuItem: MenuItem) => void;
  selectedFavorites: string[];
  error: string | null;
};

export function MealPlanTab({
  state,
  isLoading,
  streamText,
  selectedDates,
  onDatesChange,
  onGenerate,
  onOpenRecipe,
  onReplaceDay,
  onSwapDays,
  onToggleFavorite,
  selectedFavorites,
  error,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirst, setSwapFirst] = useState<number | null>(null);
  const plan: GenerateResponse | null = state.currentPlan;

  const handleClick = () => {
    if (selectedDates.length === 0) return;
    if (plan) {
      setConfirmOpen(true);
    } else {
      onGenerate();
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 状態サマリー */}
      <div className="flex gap-2 flex-wrap text-[11px]">
        <span className="bg-[#e0f2f1] text-[#00897b] rounded-full px-2.5 py-1">
          📷 冷蔵庫: {state.fridgeItems.length}品目
        </span>
        <span className="bg-[#fff3e0] text-[#f57c00] rounded-full px-2.5 py-1">
          🚫 NG: {state.dislikedIngredients.length}品目
        </span>
        <span className="bg-[#ffebee] text-[#c62828] rounded-full px-2.5 py-1">
          ⚠️ アレルギー: {state.allergyIngredients.length}品目
        </span>
      </div>

      {/* カレンダー */}
      <Calendar selected={selectedDates} onChange={onDatesChange} />

      {/* お気に入り選択中の表示 */}
      {selectedFavorites.length > 0 && (
        <div className="rounded-xl bg-[#fff3e0] p-3 flex items-center gap-2">
          <span className="text-[13px]">❤️</span>
          <span className="text-[12px] text-[#e8725a] font-bold flex-1">
            お気に入りから{selectedFavorites.length}品を献立に含めます
          </span>
          <span className="text-[11px] text-gray-400">お気に入りタブで変更</span>
        </div>
      )}

      {/* 生成ボタン */}
      <button
        disabled={isLoading || selectedDates.length === 0}
        onClick={handleClick}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#e8725a] to-[#f4a261] text-white font-bold shadow-sm disabled:opacity-50"
      >
        {isLoading
          ? "🍳 献立を作成中..."
          : selectedDates.length === 0
            ? "📅 日付を選んでください"
            : plan
              ? `🔄 ${selectedDates.length}日分の献立を作り直す`
              : `✨ ${selectedDates.length}日分の献立を作る`}
      </button>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-800 p-3 text-[13px]">
          ⚠️ {error}
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="rounded-xl bg-white shadow-sm p-4 text-[12px] text-gray-600">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: Math.min(selectedDates.length, 10) }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full bg-gradient-to-r from-[#e8725a] to-[#f4a261] animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-gray-500">
            {selectedDates.length}日分の献立を生成しています…
          </p>
          {streamText && (
            <pre className="mt-2 text-[10px] text-gray-400 max-h-24 overflow-hidden whitespace-pre-wrap">
              {streamText.slice(-300)}
            </pre>
          )}
        </div>
      )}

      {/* 献立リスト */}
      {!isLoading && plan && (
        <div className="space-y-3">
          {/* 入れ替えモードボタン */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSwapMode(!swapMode);
                setSwapFirst(null);
              }}
              className={`flex-1 h-9 rounded-lg text-[12px] font-bold transition-colors ${
                swapMode
                  ? "bg-[#e8725a] text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {swapMode ? "↕️ 入れ替えモード ON（タップで選択）" : "↕️ 曜日を入れ替える"}
            </button>
            {swapMode && (
              <button
                onClick={() => {
                  setSwapMode(false);
                  setSwapFirst(null);
                }}
                className="h-9 px-3 rounded-lg bg-gray-100 text-gray-500 text-[12px]"
              >
                キャンセル
              </button>
            )}
          </div>

          {/* 入れ替えモードのガイド */}
          {swapMode && (
            <div className="rounded-xl bg-[#fff3e0] p-3 text-[12px] text-[#e8725a] text-center font-bold">
              {swapFirst === null
                ? "📌 入れ替えたい1日目をタップしてください"
                : `📌 ${plan.mealPlan[swapFirst].day}を選択中 → 入れ替え先をタップ`}
            </div>
          )}

          {plan.mealPlan.map((day: DayPlan, idx: number) => {
            const isFav = (state.favoriteMeals || []).some(
              (f) => f.name === day.main.name
            );
            const isSwapSelected = swapFirst === idx;

            const handleCardClick = () => {
              if (!swapMode) {
                onOpenRecipe(idx);
                return;
              }
              // 入れ替えモード
              if (swapFirst === null) {
                setSwapFirst(idx);
              } else if (swapFirst === idx) {
                setSwapFirst(null); // 同じ日を再タップで解除
              } else {
                onSwapDays(swapFirst, idx);
                setSwapMode(false);
                setSwapFirst(null);
              }
            };

            return (
              <div key={idx} className="relative">
                <button
                  onClick={handleCardClick}
                  className={`w-full text-left rounded-xl shadow-sm p-4 pr-12 active:scale-[0.99] transition-all ${
                    isSwapSelected
                      ? "bg-[#fff3e0] border-2 border-[#e8725a] ring-2 ring-[#e8725a]/20"
                      : swapMode
                        ? "bg-white border-2 border-dashed border-gray-300 hover:border-[#f4a261]"
                        : "bg-white"
                  }`}
                >
                  {swapMode && (
                    <div className="absolute top-3 left-3">
                      <span className="text-[18px]">
                        {isSwapSelected ? "✅" : "👆"}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-baseline justify-between mb-1.5 ${swapMode ? "pl-7" : ""}`}>
                    <span className="text-[13px] font-bold text-[#e8725a]">
                      {day.day}
                    </span>
                    <span className="text-[11px] bg-[#fff3e0] text-[#ff9800] rounded-full px-2 py-0.5">
                      {day.label}
                    </span>
                  </div>
                  <div className={`text-[15px] font-bold text-gray-800 mb-1 ${swapMode ? "pl-7" : ""}`}>
                    🔥 {day.main.name}
                  </div>
                  <div className={`text-[12px] text-gray-500 leading-relaxed ${swapMode ? "pl-7" : ""}`}>
                    🥗 {day.side.name.replace(/^【.+?】/, "")}
                    <br />
                    🍜 {day.soup.name}
                  </div>
                  <div className={`text-[11px] text-gray-400 mt-1 ${swapMode ? "pl-7" : ""}`}>
                    ⏱ {day.main.time} {swapMode ? "・ タップで選択" : "・ タップでレシピ"}
                  </div>
                </button>
                {!swapMode && (
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(day.main.name, day.main);
                      }}
                      className="text-[20px] transition-transform active:scale-125"
                      title={isFav ? "お気に入りから外す" : "お気に入りに追加"}
                    >
                      {isFav ? "❤️" : "🤍"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplaceDay(idx);
                      }}
                      className="text-[16px] text-gray-400 hover:text-[#e8725a] transition-colors active:scale-125"
                      title="この日の献立を変更"
                    >
                      🔄
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* 予算 */}
          <div className="rounded-xl bg-gradient-to-r from-[#fff3e0] to-[#ffe0b2] p-3 text-center">
            <p className="text-[12px] text-[#e8725a] font-bold">
              💰 {plan.estimatedBudget}
            </p>
          </div>
        </div>
      )}

      {/* 初回誘導 */}
      {!plan && !isLoading && (
        <div className="rounded-xl bg-white shadow-sm p-5 text-center text-gray-500 text-[13px] leading-relaxed">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="font-bold text-gray-700 mb-1">はじめまして！</p>
          <p>
            上のカレンダーで日付を選んで
            <br />
            「献立を作る」ボタンを押してください。
          </p>
          <p className="mt-2 text-[12px] text-gray-400">
            先に「⚙️設定」や「📷冷蔵庫」タブで
            <br />
            情報を入れておくとより良い献立に！
          </p>
        </div>
      )}

      {/* 確認ダイアログ */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <h3 className="font-bold text-[15px] mb-2">新しい献立を作りますか？</h3>
            <p className="text-[12px] text-gray-500 mb-4">
              今の献立と買い物チェックはリセットされます。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 h-10 rounded-lg border border-gray-300 text-[13px]"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  onGenerate();
                }}
                className="flex-1 h-10 rounded-lg bg-[#e8725a] text-white text-[13px] font-bold"
              >
                作り直す
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
