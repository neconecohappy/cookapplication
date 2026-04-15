"use client";

import { useState } from "react";
import type { AppState, ManualShoppingItem } from "@/lib/types";

export function ShoppingTab({
  state,
  onToggle,
  manualItems,
  onAddManualItem,
  onToggleManualItem,
  onRemoveManualItem,
}: {
  state: AppState;
  onToggle: (key: string) => void;
  manualItems: ManualShoppingItem[];
  onAddManualItem: (name: string, qty: string) => void;
  onToggleManualItem: (id: string) => void;
  onRemoveManualItem: (id: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const plan = state.currentPlan;

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddManualItem(trimmed, newQty.trim() || "適量");
    setNewName("");
    setNewQty("");
    setShowAddForm(false);
  };

  // 手動追加セクション（献立なくても表示）
  const manualSection = (
    <div className="space-y-3">
      <div className="rounded-xl bg-white shadow-sm p-3">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-bold text-gray-700">
            ✏️ 自分で追加したもの
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-[12px] text-[#e8725a] font-bold"
          >
            {showAddForm ? "閉じる" : "＋ 追加"}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="rounded-xl bg-white shadow-sm p-4 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="商品名（例: 牛乳）"
            className="w-full h-10 rounded-lg border border-gray-300 px-3 text-[13px]"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="数量（例: 1本）"
              className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-[13px]"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="h-10 px-4 rounded-lg bg-[#e8725a] text-white text-[13px] font-bold disabled:opacity-50"
            >
              追加
            </button>
          </div>
        </div>
      )}

      {manualItems.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm p-4">
          <ul className="space-y-2">
            {manualItems.map((item) => (
              <li key={item.id} className="flex gap-2 items-center">
                <button
                  onClick={() => onToggleManualItem(item.id)}
                  className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${
                    item.checked
                      ? "bg-[#e8725a] border-[#e8725a] text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {item.checked && <span className="text-[11px]">✓</span>}
                </button>
                <div
                  className={`flex-1 text-[13px] ${
                    item.checked
                      ? "line-through text-gray-400"
                      : "text-gray-800 font-medium"
                  }`}
                >
                  {item.name}{" "}
                  <span className="text-gray-500 font-normal">{item.qty}</span>
                </div>
                <button
                  onClick={() => onRemoveManualItem(item.id)}
                  className="text-[14px] text-gray-300 hover:text-red-400"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (!plan) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center text-gray-500 text-[13px] mb-4">
          先に「📅献立」タブで献立を作ると、<br />献立に応じた買い物リストが表示されます。
        </div>
        {manualSection}
      </div>
    );
  }

  const toBuyTotal = plan.shoppingList.toBuy.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const checkedCount = Object.values(state.checkedItems).filter(Boolean).length;

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl bg-white shadow-sm p-3">
        <div className="text-[13px] font-bold text-gray-700 mb-1">
          🛒 買うもの
        </div>
        <div className="text-[11px] text-gray-500">
          チェック済み: {checkedCount}/{toBuyTotal + manualItems.length}
        </div>
      </div>

      {plan.shoppingList.toBuy.map((cat, ci) => (
        <div key={ci} className="rounded-xl bg-white shadow-sm p-4">
          <h3 className="text-[14px] font-bold text-gray-700 mb-2">
            {cat.category}
          </h3>
          <ul className="space-y-2">
            {cat.items.map((item, ii) => {
              const key = `${ci}-${ii}`;
              const checked = !!state.checkedItems[key];
              return (
                <li key={ii} className="flex gap-2 items-start">
                  <button
                    onClick={() => onToggle(key)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${
                      checked
                        ? "bg-[#e8725a] border-[#e8725a] text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {checked && <span className="text-[11px]">✓</span>}
                  </button>
                  <div className="flex-1">
                    <div
                      className={`text-[13px] ${
                        checked
                          ? "line-through text-gray-400"
                          : "text-gray-800 font-medium"
                      }`}
                    >
                      {item.name}{" "}
                      <span className="text-gray-500 font-normal">
                        {item.qty}
                      </span>
                    </div>
                    {item.note && (
                      <div className="text-[11px] text-gray-400">
                        {item.note}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* 手動追加セクション */}
      {manualSection}

      {plan.shoppingList.alreadyHave.length > 0 && (
        <>
          <div className="rounded-xl bg-[#e0f2f1] p-3 mt-4">
            <div className="text-[13px] font-bold text-[#00897b]">
              🏠 家にあるもの
            </div>
          </div>
          {plan.shoppingList.alreadyHave.map((cat, ci) => (
            <div key={ci} className="rounded-xl bg-white shadow-sm p-4">
              <h3 className="text-[14px] font-bold text-gray-700 mb-2">
                {cat.category}
              </h3>
              <ul className="space-y-1.5">
                {cat.items.map((item, ii) => (
                  <li key={ii} className="flex gap-2 text-[13px]">
                    <span className="text-[#00897b]">✓</span>
                    <div className="flex-1">
                      <span className="text-gray-700 font-medium">
                        {item.name}
                      </span>{" "}
                      <span className="text-gray-500">{item.qty}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      <div className="rounded-xl bg-gradient-to-r from-[#fff3e0] to-[#ffe0b2] p-4 text-center">
        <p className="text-[13px] font-bold text-[#e8725a]">
          💰 今週の買い物予算
        </p>
        <p className="text-[15px] font-bold text-gray-700 mt-1">
          {plan.estimatedBudget}
        </p>
      </div>
    </div>
  );
}
