"use client";

import { useState, useRef, useCallback } from "react";
import type { FridgeItem } from "@/lib/types";
import { COMMON_INGREDIENTS, AMOUNT_PRESETS } from "@/data/common-ingredients";
import { resizeImageToBase64 } from "@/lib/image-utils";
import { USE_MOCK } from "@/lib/config";

type Props = {
  items: FridgeItem[];
  onUpdate: (items: FridgeItem[]) => void;
};

// ─── 音声入力パーサー ───
function parseVoiceInput(text: string): { name: string; amount: string } | null {
  // 数量パターンを検出: "にんじん3本", "豚バラ300グラム", "卵6個"
  const match = text.match(
    /(.+?)(\d+\.?\d*)\s*(本|個|g|グラム|kg|キロ|ml|パック|袋|枚|束|切れ|丁)/
  );
  if (match) {
    const unit = match[3].replace("グラム", "g").replace("キロ", "kg");
    return { name: match[1].trim(), amount: `${match[2]}${unit}` };
  }
  // 数量なしの場合は食材名だけ返す
  return { name: text.trim(), amount: "適量" };
}

// ─── カテゴリ自動判定 ───
function detectCategory(name: string): string {
  if (/豚|鶏|牛|肉|ベーコン|ハム|ソーセージ|ウインナー|ひき/.test(name)) return "肉";
  if (/鮭|さば|ぶり|えび|イカ|マグロ|ツナ|しらす|たら|アジ|魚/.test(name)) return "魚";
  if (/卵|牛乳|チーズ|豆腐|油揚げ|納豆|ヨーグルト/.test(name)) return "卵・乳製品";
  if (/冷凍/.test(name)) return "冷凍";
  return "野菜";
}

// ─── 量のプリセット判定 ───
function getAmountPresetKey(name: string): string {
  if (/g|肉|ひき|バラ|こま|もも|むね|えび/.test(name)) return "weight";
  if (/切り身|鮭|さば/.test(name)) return "fillet";
  if (/パック|しらす|しめじ|えのき|納豆/.test(name)) return "pack";
  if (/本|にんじん|ねぎ|きゅうり|なす|ごぼう|ニラ/.test(name)) return "sticks";
  if (/袋|もやし|ウインナー|枝豆/.test(name)) return "pack";
  if (/束|ほうれん草|小松菜/.test(name)) return "sticks";
  return "count";
}

export function FridgeTab({ items, onUpdate }: Props) {
  const [searchText, setSearchText] = useState("");
  const [selectingItem, setSelectingItem] = useState<{
    name: string;
    defaultAmount: string;
  } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualAmount, setManualAmount] = useState("");

  // カメラ（オプション機能として残す）
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── 食材追加 ───
  const addItem = useCallback(
    (name: string, amount: string) => {
      // 既に同じ食材があれば追加しない
      if (items.some((i) => i.name === name)) return;
      const newItem: FridgeItem = {
        id: crypto.randomUUID(),
        name,
        estimatedAmount: amount,
        confidence: "high",
        category: detectCategory(name),
        confirmed: true,
      };
      onUpdate([...items, newItem]);
    },
    [items, onUpdate]
  );

  // ─── プリセット食材タップ ───
  const handlePresetTap = (item: { name: string; defaultAmount: string }) => {
    if (items.some((i) => i.name === item.name)) return;
    setSelectingItem(item);
  };

  const handleAmountSelect = (amount: string) => {
    if (!selectingItem) return;
    addItem(selectingItem.name, amount);
    setSelectingItem(null);
  };

  // ─── 音声入力 ───
  const startVoiceInput = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setVoiceError("お使いのブラウザは音声入力に対応していません");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognitionCtor() as any;
    recognition.lang = "ja-JP";
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript as string;
      const parsed = parseVoiceInput(text);
      if (parsed && parsed.name) {
        addItem(parsed.name, parsed.amount);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setVoiceError("音声を認識できませんでした。もう一度お試しください");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setVoiceError(null);
    setIsListening(true);
    recognition.start();
  };

  // ─── 手動追加 ───
  const addManual = () => {
    if (!manualName.trim()) return;
    addItem(manualName.trim(), manualAmount.trim() || "適量");
    setManualName("");
    setManualAmount("");
  };

  // ─── 削除・編集 ───
  const removeItem = (id: string) => {
    onUpdate(items.filter((i) => i.id !== id));
  };

  const updateItem = (
    id: string,
    field: "name" | "estimatedAmount",
    value: string
  ) => {
    onUpdate(
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  // ─── カメラスキャン（オプション機能） ───
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const total = [...photos, ...files].slice(0, 4);
    setPhotos(total);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (photos.length === 0) return;
    setIsScanning(true);
    setScanError(null);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 2000));
        const mockItems: FridgeItem[] = [
          { id: crypto.randomUUID(), name: "豚バラ肉", estimatedAmount: "約300g", confidence: "high", category: "肉", confirmed: true },
          { id: crypto.randomUUID(), name: "にんじん", estimatedAmount: "約2本", confidence: "high", category: "野菜", confirmed: true },
          { id: crypto.randomUUID(), name: "卵", estimatedAmount: "約6個", confidence: "medium", category: "卵・乳製品", confirmed: false },
        ];
        onUpdate([...items, ...mockItems]);
        setPhotos([]);
        setIsScanning(false);
        return;
      }
      const base64Images = await Promise.all(photos.map((f) => resizeImageToBase64(f)));
      const res = await fetch("/api/scan-fridge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: base64Images }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "解析に失敗しました");
      }
      const data = (await res.json()) as { ingredients: FridgeItem[] };
      onUpdate([...items, ...data.ingredients]);
      setPhotos([]);
    } catch (e) {
      setScanError((e as Error).message);
    } finally {
      setIsScanning(false);
    }
  };

  // ─── 検索フィルタ ───
  const filteredCategories = COMMON_INGREDIENTS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        searchText === "" ||
        item.name.includes(searchText)
    ),
  })).filter((cat) => cat.items.length > 0);

  // ─── 登録済み食材のカテゴリ別グループ ───
  const groupedItems = items.reduce<Record<string, FridgeItem[]>>((acc, item) => {
    const cat = item.category || "その他";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryIcons: Record<string, string> = {
    "肉": "🥩",
    "魚": "🐟",
    "野菜": "🥬",
    "卵・乳製品": "🥚",
    "冷凍": "🧊",
    "その他": "📦",
  };

  return (
    <div className="p-4 space-y-4">
      {/* ─── 登録済み食材 ─── */}
      {items.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm p-4">
          <h3 className="text-[14px] font-bold text-gray-700 mb-3">
            🏠 冷蔵庫の食材（{items.length}品目）
          </h3>
          <div className="space-y-3">
            {Object.entries(groupedItems).map(([cat, catItems]) => (
              <div key={cat}>
                <div className="text-[12px] font-bold text-gray-500 mb-1">
                  {categoryIcons[cat] || "📦"} {cat}
                </div>
                <div className="space-y-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 text-[13px] bg-gray-50 rounded-lg px-3 py-1.5"
                    >
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateItem(item.id, "name", e.target.value)
                        }
                        className="flex-1 bg-transparent outline-none min-w-0"
                      />
                      <input
                        value={item.estimatedAmount}
                        onChange={(e) =>
                          updateItem(item.id, "estimatedAmount", e.target.value)
                        }
                        className="w-16 text-gray-500 text-[12px] bg-transparent outline-none text-right"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-300 hover:text-red-400 text-[14px] flex-shrink-0"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-xl bg-white shadow-sm p-5 text-center text-gray-400 text-[13px] leading-relaxed">
          <p className="text-2xl mb-1">🏠</p>
          <p>
            食材をタップして追加してください。
            <br />
            献立生成時に冷蔵庫の食材が考慮されます。
          </p>
        </div>
      )}

      {/* ─── 量の選択パネル ─── */}
      {selectingItem && (
        <div className="rounded-xl bg-[#fff3e0] shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-bold text-gray-700">
              {selectingItem.name} の量は？
            </span>
            <button
              onClick={() => setSelectingItem(null)}
              className="text-gray-400 text-[14px]"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              AMOUNT_PRESETS[getAmountPresetKey(selectingItem.name)] ||
              AMOUNT_PRESETS.count
            ).map((amount) => (
              <button
                key={amount}
                onClick={() => handleAmountSelect(amount)}
                className="px-3 py-1.5 rounded-full bg-white text-[12px] text-gray-700 border border-gray-200 active:bg-[#e8725a] active:text-white"
              >
                {amount}
              </button>
            ))}
            <button
              onClick={() =>
                handleAmountSelect(selectingItem.defaultAmount)
              }
              className="px-3 py-1.5 rounded-full bg-[#e8725a] text-white text-[12px] font-bold"
            >
              {selectingItem.defaultAmount}（デフォルト）
            </button>
          </div>
        </div>
      )}

      {/* ─── 食材を追加 ─── */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <h3 className="text-[13px] font-bold text-gray-700 mb-2">
          ＋ 食材を追加
        </h3>

        {/* 検索 */}
        <input
          type="text"
          placeholder="🔍 食材を検索..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full h-9 rounded-lg border border-gray-300 px-3 text-[13px] mb-3"
        />

        {/* よく使う食材 */}
        <div className="space-y-3">
          {filteredCategories.map((cat) => (
            <div key={cat.category}>
              <div className="text-[11px] font-bold text-gray-500 mb-1.5">
                {cat.category}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.items.map((item) => {
                  const alreadyAdded = items.some(
                    (i) => i.name === item.name
                  );
                  return (
                    <button
                      key={item.name}
                      onClick={() => handlePresetTap(item)}
                      disabled={alreadyAdded}
                      className={`px-2.5 py-1 rounded-full text-[12px] transition-colors ${
                        alreadyAdded
                          ? "bg-gray-100 text-gray-300 line-through"
                          : "bg-[#f5f5f5] text-gray-700 active:bg-[#e8725a] active:text-white"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 手動入力 ─── */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <h3 className="text-[13px] font-bold text-gray-700 mb-2">
          ✏️ 手動で入力
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="食材名"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addManual()}
            className="flex-1 h-9 rounded-lg border border-gray-300 px-2 text-[13px]"
          />
          <input
            type="text"
            placeholder="量"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addManual()}
            className="w-20 h-9 rounded-lg border border-gray-300 px-2 text-[13px]"
          />
          <button
            onClick={addManual}
            className="w-9 h-9 rounded-lg bg-[#e8725a] text-white text-[16px]"
          >
            ＋
          </button>
        </div>
      </div>

      {/* ─── 音声入力 ─── */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <h3 className="text-[13px] font-bold text-gray-700 mb-2">
          🎤 音声で追加
        </h3>
        <p className="text-[11px] text-gray-400 mb-2">
          「にんじん3本」のように話すと自動で追加されます
        </p>
        <button
          onClick={startVoiceInput}
          disabled={isListening}
          className={`w-full h-10 rounded-lg text-[13px] font-bold transition-colors ${
            isListening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-[#f5f5f5] text-gray-700 active:bg-[#e8725a] active:text-white"
          }`}
        >
          {isListening ? "🎤 聞き取り中..." : "🎤 タップして話す"}
        </button>
        {voiceError && (
          <p className="mt-2 text-[11px] text-red-500">{voiceError}</p>
        )}
      </div>

      {/* ─── カメラスキャン（オプション） ─── */}
      <div className="rounded-xl bg-white shadow-sm p-4">
        <button
          onClick={() => setShowCamera(!showCamera)}
          className="flex items-center gap-2 w-full text-left"
        >
          <span className="text-[13px] font-bold text-gray-500">
            📷 カメラで読み取る（AI使用）
          </span>
          <span className="text-[11px] text-gray-400 ml-auto">
            {showCamera ? "▲" : "▼"}
          </span>
        </button>

        {showCamera && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] text-gray-400">
              写真をAIで解析します。APIキーが必要です。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-9 rounded-lg bg-[#00897b] text-white text-[12px] font-bold"
              >
                📸 写真を選ぶ
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {photos.map((_, i) => (
                  <div key={i} className="relative">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">
                      📷{i + 1}
                    </div>
                    <button
                      onClick={() =>
                        setPhotos(photos.filter((__, j) => j !== i))
                      }
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              disabled={photos.length === 0 || isScanning}
              onClick={handleScan}
              className="w-full h-9 rounded-lg bg-[#e8725a] text-white text-[13px] font-bold disabled:opacity-40"
            >
              {isScanning
                ? "🔍 解析中..."
                : `🔍 食材を解析する (${photos.length})`}
            </button>
            {scanError && (
              <p className="text-[11px] text-red-600">{scanError}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
