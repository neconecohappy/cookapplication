"use client";

import { useState } from "react";
import type { DislikedIngredient } from "@/lib/types";

const SUGGEST = [
  "セロリ",
  "パクチー",
  "レバー",
  "ゴーヤ",
  "ピーマン",
  "しいたけ",
  "グリンピース",
  "なす",
];

export function SettingsTab({
  disliked,
  allergy,
  onUpdateDisliked,
  onUpdateAllergy,
  onResetAll,
}: {
  disliked: DislikedIngredient[];
  allergy: DislikedIngredient[];
  onUpdateDisliked: (list: DislikedIngredient[]) => void;
  onUpdateAllergy: (list: DislikedIngredient[]) => void;
  onResetAll: () => void;
}) {
  const [dislikeInput, setDislikeInput] = useState("");
  const [allergyInput, setAllergyInput] = useState("");

  const addItem = (
    name: string,
    type: "dislike" | "allergy",
    list: DislikedIngredient[],
    update: (l: DislikedIngredient[]) => void
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (list.some((i) => i.name === trimmed)) return;
    update([
      ...list,
      {
        id: crypto.randomUUID(),
        name: trimmed,
        type,
        addedAt: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="p-4 space-y-4">
      {/* アレルギー */}
      <div className="rounded-xl bg-white shadow-sm p-4 border-2 border-[#ffebee]">
        <h3 className="text-[14px] font-bold text-[#c62828] mb-2">
          ⚠️ アレルギー食材（絶対に使わない）
        </h3>
        <p className="text-[11px] text-gray-500 mb-3">
          派生調味料・加工品も含め完全除外されます
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem(allergyInput, "allergy", allergy, onUpdateAllergy);
                setAllergyInput("");
              }
            }}
            placeholder="食材名を入力..."
            className="flex-1 h-9 rounded-lg border border-gray-300 px-2 text-[13px]"
          />
          <button
            onClick={() => {
              addItem(allergyInput, "allergy", allergy, onUpdateAllergy);
              setAllergyInput("");
            }}
            className="px-4 h-9 rounded-lg bg-[#c62828] text-white text-[13px] font-bold"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allergy.length === 0 && (
            <span className="text-[11px] text-gray-400">未登録</span>
          )}
          {allergy.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 bg-[#ffebee] text-[#c62828] rounded-full px-2.5 py-1 text-[12px]"
            >
              {a.name}
              <button
                onClick={() =>
                  onUpdateAllergy(allergy.filter((x) => x.id !== a.id))
                }
                className="text-[#c62828] font-bold"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 嫌いな食材 */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <h3 className="text-[14px] font-bold text-[#f57c00] mb-2">
          🚫 嫌いな食材（できるだけ避ける）
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={dislikeInput}
            onChange={(e) => setDislikeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem(dislikeInput, "dislike", disliked, onUpdateDisliked);
                setDislikeInput("");
              }
            }}
            placeholder="食材名を入力..."
            className="flex-1 h-9 rounded-lg border border-gray-300 px-2 text-[13px]"
          />
          <button
            onClick={() => {
              addItem(dislikeInput, "dislike", disliked, onUpdateDisliked);
              setDislikeInput("");
            }}
            className="px-4 h-9 rounded-lg bg-[#f57c00] text-white text-[13px] font-bold"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {disliked.length === 0 && (
            <span className="text-[11px] text-gray-400">未登録</span>
          )}
          {disliked.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 bg-[#fff3e0] text-[#f57c00] rounded-full px-2.5 py-1 text-[12px]"
            >
              {d.name}
              <button
                onClick={() =>
                  onUpdateDisliked(disliked.filter((x) => x.id !== d.id))
                }
                className="text-[#f57c00] font-bold"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        <div className="text-[11px] text-gray-500 mb-1">
          よく登録される食材:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGEST.filter((s) => !disliked.some((d) => d.name === s)).map((s) => (
            <button
              key={s}
              onClick={() => addItem(s, "dislike", disliked, onUpdateDisliked)}
              className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-1 text-[11px]"
            >
              ＋{s}
            </button>
          ))}
        </div>
      </div>

      {/* データ管理 */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <h3 className="text-[14px] font-bold text-gray-700 mb-2">
          📱 データ管理
        </h3>
        <button
          onClick={() => {
            if (confirm("全データをリセットしますか？この操作は取り消せません。")) {
              onResetAll();
            }
          }}
          className="w-full h-10 rounded-lg border border-red-300 text-red-600 text-[13px] font-bold"
        >
          🗑 全データをリセット
        </button>
      </div>
    </div>
  );
}
