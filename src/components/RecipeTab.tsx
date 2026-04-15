"use client";

import { useState, useEffect } from "react";
import type { AppState, MenuItem } from "@/lib/types";

export function RecipeTab({
  state,
  selectedDay,
  onSelectDay,
  onToggleFavorite,
}: {
  state: AppState;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onToggleFavorite: (name: string, menuItem: MenuItem) => void;
}) {
  const plan = state.currentPlan;
  const [localDay, setLocalDay] = useState(selectedDay);

  useEffect(() => {
    setLocalDay(selectedDay);
  }, [selectedDay]);

  if (!plan) {
    return (
      <div className="p-4 text-center text-gray-500 text-[13px]">
        先に「📅献立」タブで献立を作ってください。
      </div>
    );
  }

  const day = plan.mealPlan[localDay];
  if (!day) return null;

  const isFav = (state.favoriteMeals || []).some((f) => f.name === day.main.name);

  return (
    <div className="p-4 space-y-4">
      {/* 日付セレクタ */}
      <select
        value={localDay}
        onChange={(e) => {
          const v = Number(e.target.value);
          setLocalDay(v);
          onSelectDay(v);
        }}
        className="w-full h-11 rounded-xl border border-gray-300 px-3 bg-white text-[14px] font-bold text-gray-700"
      >
        {plan.mealPlan.map((d, i) => (
          <option key={i} value={i}>
            {d.day} — {d.label}
          </option>
        ))}
      </select>

      <div className="relative">
        <MenuCard icon="🔥" title="主菜" menu={day.main} color="#e8725a" />
        <button
          onClick={() => onToggleFavorite(day.main.name, day.main)}
          className="absolute top-4 right-4 text-[20px] transition-transform active:scale-125"
          title={isFav ? "お気に入りから外す" : "お気に入りに追加"}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <MenuCard icon="🥗" title="副菜" menu={day.side} color="#4caf50" />
      <MenuCard icon="🍜" title="汁物" menu={day.soup} color="#1976d2" />
    </div>
  );
}

function MenuCard({
  icon,
  title,
  menu,
  color,
}: {
  icon: string;
  title: string;
  menu: MenuItem;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white shadow-sm p-4">
      <div
        className="text-[11px] font-bold mb-1"
        style={{ color }}
      >
        {icon} {title}
      </div>
      <h3 className="text-[16px] font-bold text-gray-800 mb-1">{menu.name}</h3>
      <div className="text-[11px] text-gray-400 mb-3">
        ⏱ {menu.time} ・ 👨‍👩‍👦‍👦 {menu.recipe.servings}
      </div>

      <div className="text-[12px] font-bold text-gray-600 mb-1.5">【材料】</div>
      <ul className="text-[13px] text-gray-700 space-y-0.5 mb-3">
        {menu.recipe.ingredients.map((ing, i) => (
          <li key={i} className="flex">
            <span className="w-4">{ing.fromFridge ? "🏠" : "　"}</span>
            <span className="flex-1">{ing.name}</span>
            <span className="text-gray-500">{ing.amount}</span>
          </li>
        ))}
      </ul>

      <div className="text-[12px] font-bold text-gray-600 mb-1.5">【手順】</div>
      <ol className="text-[13px] text-gray-700 space-y-1 mb-3">
        {menu.recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      {menu.recipe.point && (
        <div className="rounded-lg bg-[#fff3e0] text-[12px] text-[#e8725a] p-2 mb-2">
          💡 コツ: {menu.recipe.point}
        </div>
      )}
      {menu.bento && (
        <div className="rounded-lg bg-[#f1f8e9] text-[12px] text-[#4caf50] p-2">
          🍱 弁当: {menu.bento}
        </div>
      )}
    </div>
  );
}
