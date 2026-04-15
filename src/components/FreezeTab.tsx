"use client";

import type { AppState } from "@/lib/types";

export function FreezeTab({ state }: { state: AppState }) {
  const plan = state.currentPlan;
  if (!plan || !plan.freezePrep || plan.freezePrep.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-[13px]">
        下味冷凍の仕込みはありません。
        <br />
        先に献立を作ってください。
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl bg-[#e3f2fd] p-3 text-[12px] text-[#1976d2]">
        ❄️ 日曜日にまとめて仕込んで冷凍保存しておきましょう
      </div>

      {plan.freezePrep.map((prep, i) => (
        <div key={i} className="rounded-xl bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-gray-800">{prep.name}</h3>
            <span className="text-[11px] bg-[#e3f2fd] text-[#1976d2] rounded-full px-2 py-0.5">
              {prep.forDay}
            </span>
          </div>

          <div className="text-[12px] font-bold text-gray-600 mt-3 mb-1">
            【材料】
          </div>
          <p className="text-[13px] text-gray-700 leading-relaxed">
            {prep.ingredients}
          </p>

          <div className="text-[12px] font-bold text-gray-600 mt-3 mb-1">
            【手順】
          </div>
          <ol className="text-[13px] text-gray-700 space-y-1">
            {prep.steps.map((step, si) => (
              <li key={si}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
