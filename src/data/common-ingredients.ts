/**
 * よく使う食材のプリセットデータ
 * カテゴリ別に並べて、タップだけで追加できるようにする
 */
export const COMMON_INGREDIENTS = [
  {
    category: "🥩 肉",
    items: [
      { name: "豚バラ薄切り", defaultAmount: "300g" },
      { name: "豚こま切れ", defaultAmount: "300g" },
      { name: "鶏むね肉", defaultAmount: "300g" },
      { name: "鶏もも肉", defaultAmount: "300g" },
      { name: "牛こま切れ", defaultAmount: "200g" },
      { name: "合いびき肉", defaultAmount: "300g" },
      { name: "鶏ひき肉", defaultAmount: "200g" },
      { name: "ベーコン", defaultAmount: "1パック" },
      { name: "ウインナー", defaultAmount: "1袋" },
      { name: "ハム", defaultAmount: "1パック" },
    ],
  },
  {
    category: "🐟 魚",
    items: [
      { name: "鮭切り身", defaultAmount: "2切れ" },
      { name: "さば切り身", defaultAmount: "2切れ" },
      { name: "ツナ缶", defaultAmount: "1缶" },
      { name: "しらす", defaultAmount: "1パック" },
      { name: "えび", defaultAmount: "200g" },
    ],
  },
  {
    category: "🥬 野菜",
    items: [
      { name: "玉ねぎ", defaultAmount: "2個" },
      { name: "にんじん", defaultAmount: "2本" },
      { name: "じゃがいも", defaultAmount: "3個" },
      { name: "キャベツ", defaultAmount: "1/2玉" },
      { name: "もやし", defaultAmount: "1袋" },
      { name: "ほうれん草", defaultAmount: "1束" },
      { name: "白菜", defaultAmount: "1/4玉" },
      { name: "大根", defaultAmount: "1/3本" },
      { name: "長ねぎ", defaultAmount: "1本" },
      { name: "ピーマン", defaultAmount: "3個" },
      { name: "きゅうり", defaultAmount: "2本" },
      { name: "トマト", defaultAmount: "2個" },
      { name: "なす", defaultAmount: "2本" },
      { name: "しめじ", defaultAmount: "1パック" },
      { name: "えのき", defaultAmount: "1袋" },
      { name: "ニラ", defaultAmount: "1束" },
      { name: "小松菜", defaultAmount: "1束" },
      { name: "レタス", defaultAmount: "1/2玉" },
      { name: "ブロッコリー", defaultAmount: "1株" },
    ],
  },
  {
    category: "🥚 卵・乳製品",
    items: [
      { name: "卵", defaultAmount: "6個" },
      { name: "牛乳", defaultAmount: "500ml" },
      { name: "チーズ", defaultAmount: "適量" },
      { name: "豆腐", defaultAmount: "1丁" },
      { name: "油揚げ", defaultAmount: "2枚" },
    ],
  },
  {
    category: "🧊 冷凍庫",
    items: [
      { name: "冷凍餃子", defaultAmount: "1袋" },
      { name: "冷凍コロッケ", defaultAmount: "1袋" },
      { name: "冷凍うどん", defaultAmount: "3玉" },
      { name: "冷凍ご飯", defaultAmount: "2パック" },
      { name: "冷凍枝豆", defaultAmount: "1袋" },
    ],
  },
];

/**
 * 量の選択肢（タップで選べるように）
 */
export const AMOUNT_PRESETS: Record<string, string[]> = {
  // 重さ
  weight: ["100g", "200g", "300g", "400g", "500g", "600g", "700g", "800g", "900g", "1000g"],
  // 個数
  count: ["1個", "2個", "3個", "4個", "5個", "6個", "7個", "8個"],
  // 本数
  sticks: ["1本", "2本", "3本", "4本", "5本"],
  // パック
  pack: ["1パック", "2パック", "3パック"],
  // 切り身
  fillet: ["1切れ", "2切れ", "3切れ", "4切れ"],
  // ざっくり
  rough: ["少し", "半分くらい", "1個分", "たくさん"],
};
