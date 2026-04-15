"use client";

import { useState, useMemo } from "react";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function Calendar({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (dates: string[]) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const todayStr = toDateStr(today);
  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const toggleDate = (dateStr: string) => {
    if (selectedSet.has(dateStr)) {
      onChange(selected.filter((d) => d !== dateStr));
    } else {
      // 最大14日まで
      if (selected.length >= 14) return;
      const next = [...selected, dateStr].sort();
      onChange(next);
    }
  };

  const selectWeek = (startDate: Date) => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      if (d.getMonth() === month) {
        dates.push(toDateStr(d));
      }
    }
    // 既に全選択済みなら解除、そうでなければ追加
    const allSelected = dates.every((d) => selectedSet.has(d));
    if (allSelected) {
      onChange(selected.filter((d) => !dates.includes(d)));
    } else {
      const merged = [...new Set([...selected, ...dates])].sort();
      onChange(merged.slice(0, 14));
    }
  };

  const clearAll = () => onChange([]);

  // カレンダーのセル配列を構築
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-xl bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-gray-700">
          📅 献立を作る日を選択
        </h3>
        {selected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-[11px] text-gray-400 underline"
          >
            クリア
          </button>
        )}
      </div>

      {/* 月切り替え */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-[14px] flex items-center justify-center"
        >
          ‹
        </button>
        <span className="text-[14px] font-bold text-gray-700">
          {year}年{month + 1}月
        </span>
        <button
          onClick={() => setViewMonth(addMonths(viewMonth, 1))}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 text-[14px] flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-[11px] font-medium py-1 ${
              i === 0
                ? "text-red-400"
                : i === 6
                  ? "text-blue-400"
                  : "text-gray-400"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={idx} className="h-9" />;
          }
          const dateStr = toDateStr(new Date(year, month, day));
          const isSelected = selectedSet.has(dateStr);
          const isToday = dateStr === todayStr;
          const isPast =
            parseDate(dateStr).getTime() < parseDate(todayStr).getTime();
          const dayOfWeek = (firstDay + day - 1) % 7;

          return (
            <button
              key={idx}
              onClick={() => !isPast && toggleDate(dateStr)}
              disabled={isPast}
              className={`h-9 rounded-lg text-[13px] font-medium transition-all relative ${
                isPast
                  ? "text-gray-300 cursor-not-allowed"
                  : isSelected
                    ? "bg-[#e8725a] text-white shadow-sm"
                    : isToday
                      ? "bg-orange-50 text-[#e8725a] font-bold"
                      : dayOfWeek === 0
                        ? "text-red-500 hover:bg-red-50"
                        : dayOfWeek === 6
                          ? "text-blue-500 hover:bg-blue-50"
                          : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e8725a]" />
              )}
            </button>
          );
        })}
      </div>

      {/* クイック選択 */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            // 今日から7日間
            const dates: string[] = [];
            for (let i = 0; i < 7; i++) {
              const d = new Date(today);
              d.setDate(d.getDate() + i);
              dates.push(toDateStr(d));
            }
            onChange(dates);
          }}
          className="flex-1 h-8 rounded-lg bg-gray-100 text-[11px] text-gray-600 font-medium"
        >
          今週7日間
        </button>
        <button
          onClick={() => {
            // 今日から平日5日間（土日スキップ）
            const dates: string[] = [];
            let d = new Date(today);
            while (dates.length < 5) {
              const dow = d.getDay();
              if (dow !== 0 && dow !== 6) {
                dates.push(toDateStr(d));
              }
              d = new Date(d);
              d.setDate(d.getDate() + 1);
            }
            onChange(dates);
          }}
          className="flex-1 h-8 rounded-lg bg-gray-100 text-[11px] text-gray-600 font-medium"
        >
          平日5日間
        </button>
        <button
          onClick={() => {
            // 次の月〜土
            let d = new Date(today);
            while (d.getDay() !== 1) {
              d.setDate(d.getDate() + 1);
            }
            const dates: string[] = [];
            for (let i = 0; i < 6; i++) {
              const nd = new Date(d);
              nd.setDate(nd.getDate() + i);
              dates.push(toDateStr(nd));
            }
            onChange(dates);
          }}
          className="flex-1 h-8 rounded-lg bg-gray-100 text-[11px] text-gray-600 font-medium"
        >
          次の月〜土
        </button>
      </div>

      {/* 選択数表示 */}
      <div className="mt-2 text-center text-[12px] text-gray-500">
        {selected.length > 0 ? (
          <span>
            <span className="text-[#e8725a] font-bold">{selected.length}日</span>
            分の献立を作ります（最大14日）
          </span>
        ) : (
          <span>日付をタップして選択してください</span>
        )}
      </div>
    </div>
  );
}

/** 日付文字列を "4/13（月）" の形式にフォーマット */
export function formatDateLabel(dateStr: string): string {
  const d = parseDate(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = WEEKDAYS[d.getDay()];
  return `${m}/${day}（${dow}）`;
}
