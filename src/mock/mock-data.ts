import type { GenerateResponse, DayPlan, MenuItem, Recipe, FavoriteMeal, FridgeItem } from "@/lib/types";
import { formatDateLabel } from "@/components/Calendar";

// ===== 主菜プール（20種以上） =====
const MAIN_POOL: { name: string; label: string; time: string; memo: string; bento: string; recipe: Recipe; freeze?: string }[] = [
  {
    name: "豚バラスタミナ丼",
    label: "🍚 スタミナ丼",
    time: "10分",
    memo: "豚バラ・玉ねぎ・焼肉のタレで炒めてご飯に乗せる",
    bento: "丼の具を別容器に取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ肉", amount: "400g", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "焼肉のタレ", amount: "大さじ5", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "白いりごま", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 豚バラを5cm幅に切る。玉ねぎを5mm幅の薄切りにする",
        "② フライパンにごま油を熱し、玉ねぎを中火で2分炒める",
        "③ 豚バラを広げて入れ、焼き色がつくまで焼く",
        "④ にんにく・焼肉のタレ・醤油を加え、全体に絡める",
        "⑤ ご飯に盛り、白いりごまをかける",
      ],
      point: "豚バラは広げて焼くとカリッと仕上がる。キャベツの千切りを添えると栄養バランス◎",
    },
  },
  {
    name: "鶏むねの照り焼き",
    label: "🍗 照り焼き",
    time: "15分",
    memo: "下味冷凍を解凍して焼くだけ",
    bento: "1切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏むね肉", amount: "600g", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "片栗粉", amount: "大さじ2", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "みりん", amount: "大さじ3", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 鶏むねを1cm厚のそぎ切りにし、酒を揉み込んで5分置く",
        "② 片栗粉を全体にまぶす",
        "③ フライパンに油を熱し、中火で両面3分ずつ焼く",
        "④ 醤油・みりん・砂糖を混ぜてフライパンに入れ、とろみが出るまで絡める",
      ],
      point: "フォークで穴を開けると味が染みる。片栗粉をまぶすとパサつき防止＆タレがよく絡む",
    },
    freeze: "鶏むね照り焼き用",
  },
  {
    name: "鮭のバター醤油ソテー",
    label: "🐟 魚の日",
    time: "12分",
    memo: "焼くだけ簡単メニュー",
    bento: "1切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "生鮭", amount: "4切れ", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "小麦粉", amount: "大さじ2", fromFridge: false },
        { name: "バター", amount: "20g", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 鮭に塩こしょうをふり、小麦粉を薄くまぶす",
        "② フライパンにバター半量を溶かし、鮭を弱めの中火で片面4分焼く",
        "③ 裏返して3分焼く",
        "④ 残りのバター・醤油・酒を回しかけ、スプーンでタレをかけながら絡める",
      ],
      point: "弱めの中火でじっくり焼くと身がふっくら。バターは焦がさないように注意",
    },
  },
  {
    name: "牛こまプルコギ丼",
    label: "🥩 プルコギ丼",
    time: "12分",
    memo: "甘辛ダレがご飯に合う",
    bento: "丼の具を取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "牛こま切れ", amount: "400g", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "にんじん", amount: "1/2本", fromFridge: false },
        { name: "ニラ", amount: "1/2束", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "コチュジャン", amount: "小さじ2", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "白いりごま", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 醤油・砂糖・コチュジャン・ごま油・にんにくを混ぜてタレを作る",
        "② 牛肉をタレに10分漬ける。玉ねぎは薄切り、にんじんは千切り、ニラは4cm幅に切る",
        "③ フライパンで玉ねぎ・にんじんを中火で2分炒める",
        "④ 牛肉をタレごと加え、強火で3分炒める",
        "⑤ ニラを加えてさっと炒め、ご飯に乗せてごまをかける",
      ],
      point: "タレに漬け込む時間が美味しさの秘訣。コチュジャンの量で辛さを調整",
    },
  },
  {
    name: "業スー冷凍餃子＆唐揚げ",
    label: "❄️ 楽Day",
    time: "10分",
    memo: "冷凍食品で楽ちん",
    bento: "餃子と唐揚げを詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "冷凍餃子", amount: "20個", fromFridge: false },
        { name: "冷凍唐揚げ", amount: "500g", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "水", amount: "80ml（餃子用）", fromFridge: false },
        { name: "酢", amount: "適量（つけダレ用）", fromFridge: false },
        { name: "醤油", amount: "適量（つけダレ用）", fromFridge: false },
        { name: "ラー油", amount: "お好みで", fromFridge: false },
      ],
      steps: [
        "① フライパンに油を熱し、冷凍餃子を並べる（解凍不要）",
        "② 水80mlを入れて蓋をし、中火で5分蒸し焼き",
        "③ 蓋を取って水気を飛ばし、底がカリッとしたら完成",
        "④ 唐揚げはレンジ600Wで4〜5分温める",
        "⑤ 酢醤油＋ラー油をつけダレとして添える",
      ],
      point: "餃子は水でなく熱湯を入れるとさらにパリッと焼ける",
    },
  },
  {
    name: "キーマカレー",
    label: "🍛 カレーの日",
    time: "15分",
    memo: "合い挽き肉でサッと作れる",
    bento: "別容器にカレーを入れる",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "合い挽き肉", amount: "500g", fromFridge: false },
        { name: "玉ねぎ", amount: "2個", fromFridge: false },
        { name: "にんじん", amount: "1本", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "カレールー", amount: "1/2箱（4〜5皿分）", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ2", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ1", fromFridge: false },
        { name: "水", amount: "200ml", fromFridge: false },
      ],
      steps: [
        "① 玉ねぎ・にんじんをみじん切りにする",
        "② フライパンに油を熱し、にんにく・生姜を炒めて香りを出す",
        "③ 合い挽き肉を加え、色が変わるまで炒める",
        "④ 玉ねぎ・にんじんを加えて3分炒める",
        "⑤ 水を加え、ルーを砕いて入れる。ケチャップ・ソースも加えて5分煮る",
      ],
      point: "ルーは細かく砕くと早く溶ける。ゆで卵を添えると見栄え◎",
    },
  },
  {
    name: "チキン南蛮",
    label: "🍗 チキン南蛮",
    time: "20分",
    memo: "揚げ焼きで簡単チキン南蛮",
    bento: "2切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "600g", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "小麦粉", amount: "大さじ3", fromFridge: false },
        { name: "卵", amount: "2個", fromFridge: false },
        { name: "サラダ油", amount: "大さじ4", fromFridge: false },
        { name: "酢", amount: "大さじ3", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "砂糖", amount: "大さじ3", fromFridge: false },
        { name: "マヨネーズ", amount: "大さじ4", fromFridge: false },
        { name: "ゆで卵", amount: "2個", fromFridge: false },
        { name: "酢（タルタル用）", amount: "小さじ1", fromFridge: false },
      ],
      steps: [
        "① 【甘酢ダレ】酢大さじ3・醤油大さじ3・砂糖大さじ3を混ぜておく",
        "② 【タルタル】ゆで卵を刻み、マヨネーズ大さじ4・酢小さじ1を混ぜる",
        "③ 鶏ももを一口大に切り、塩こしょう→小麦粉→溶き卵の順につける",
        "④ フライパンに油を多めに熱し、中火で片面3分ずつ揚げ焼き",
        "⑤ 揚がった鶏肉を甘酢ダレに漬けて絡める",
        "⑥ 皿に盛り、タルタルソースをかける",
      ],
      point: "甘酢ダレは熱いうちに漬けるのがコツ。タルタルに玉ねぎみじん切りを入れても美味しい",
    },
  },
  {
    name: "豚こまの生姜焼き",
    label: "🥩 生姜焼き",
    time: "10分",
    memo: "定番おかず、タレに漬けて焼くだけ",
    bento: "2〜3切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚こま切れ", amount: "400g", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "生姜チューブ", amount: "5cm", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "小さじ1", fromFridge: false },
      ],
      steps: [
        "① 醤油・酒・みりん・砂糖・生姜を混ぜてタレを作る",
        "② 豚肉をタレに5分漬ける",
        "③ 玉ねぎを5mm幅の薄切りにする",
        "④ フライパンに油を熱し、玉ねぎを中火で2分炒める",
        "⑤ 豚肉をタレごと加え、強火で3分炒めて完成",
      ],
      point: "玉ねぎは先に炒めると甘みが出る。キャベツの千切りを添えるのが定番",
    },
  },
  {
    name: "麻婆豆腐",
    label: "🌶️ 中華の日",
    time: "12分",
    memo: "ひき肉と豆腐で満足感たっぷり",
    bento: "別容器に取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚ひき肉", amount: "300g", fromFridge: false },
        { name: "絹ごし豆腐", amount: "2丁（600g）", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "生姜チューブ", amount: "2cm", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "豆板醤", amount: "小さじ1〜2", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ2", fromFridge: false },
        { name: "水", amount: "200ml", fromFridge: false },
        { name: "片栗粉", amount: "大さじ1（水大さじ2で溶く）", fromFridge: false },
      ],
      steps: [
        "① 豆腐を2cm角に切り、熱湯で2分茹でてザルにあげる",
        "② 長ねぎをみじん切りにする",
        "③ フライパンにごま油を熱し、にんにく・生姜・豆板醤を弱火で炒めて香りを出す",
        "④ ひき肉を加え、色が変わるまで中火で炒める",
        "⑤ 水・鶏がらスープの素・醤油を加えて煮立たせる",
        "⑥ 豆腐を加えて2分煮る。水溶き片栗粉を回し入れてとろみをつける",
        "⑦ 長ねぎを散らして完成",
      ],
      point: "豆板醤の量で辛さ調整。子供用には豆板醤なしで味噌大さじ1に変更",
    },
  },
  {
    name: "鶏もも肉のネギ塩焼き",
    label: "🍗 ネギ塩",
    time: "12分",
    memo: "ネギ塩ダレでさっぱり",
    bento: "2切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "600g", fromFridge: false },
        { name: "長ねぎ", amount: "2本", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "ごま油", amount: "大さじ2", fromFridge: false },
        { name: "塩", amount: "小さじ1/2", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ1", fromFridge: false },
        { name: "レモン汁", amount: "大さじ1", fromFridge: false },
        { name: "黒こしょう", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 【ネギ塩ダレ】ねぎ白い部分をみじん切りにし、ごま油・塩・鶏がら・レモン汁・黒こしょうを混ぜる",
        "② 鶏ももを一口大に切り、塩こしょうをふる",
        "③ フライパンに油を熱し、皮目を下にして中火で4分焼く",
        "④ 裏返して3分焼き、中まで火を通す",
        "⑤ 皿に盛り、ネギ塩ダレをたっぷりかける",
      ],
      point: "ネギは白い部分を使うのがポイント。皮目をパリッと焼くと香ばしい",
    },
  },
  {
    name: "肉味噌うどん",
    label: "🍜 うどんの日",
    time: "10分",
    memo: "冷凍うどんで簡単",
    bento: "肉味噌を別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "冷凍うどん", amount: "4玉", fromFridge: false },
        { name: "豚ひき肉", amount: "300g", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
        { name: "生姜チューブ", amount: "2cm", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "味噌", amount: "大さじ3", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "豆板醤", amount: "小さじ1/2（お好みで）", fromFridge: false },
      ],
      steps: [
        "① 冷凍うどんをレンジ600Wで3分半温める",
        "② フライパンにごま油を熱し、にんにく・生姜を炒めて香りを出す",
        "③ ひき肉を加え、ポロポロになるまで炒める",
        "④ 味噌・醤油・砂糖・酒・豆板醤を加え、汁気がなくなるまで炒める",
        "⑤ うどんに肉味噌を乗せ、刻みねぎを散らす。温泉卵を添えても◎",
      ],
      point: "肉味噌は多めに作って冷凍保存できる。ご飯にも合う万能おかず",
    },
  },
  {
    name: "豚バラ大根",
    label: "🥩 和食の日",
    time: "20分",
    memo: "大根に味が染みて美味しい",
    bento: "汁気を切って詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ肉", amount: "300g", fromFridge: false },
        { name: "大根", amount: "1/2本（400g）", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "水", amount: "200ml", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
      ],
      steps: [
        "① 大根を1cm厚のいちょう切りにし、耐熱容器に入れてレンジ600Wで4分加熱",
        "② 豚バラを4cm幅に切る",
        "③ フライパンに油を熱し、豚バラを中火で炒める。脂が出たらキッチンペーパーで拭く",
        "④ 大根を加えてさっと炒め、水・醤油・みりん・酒・砂糖・生姜を入れる",
        "⑤ 落し蓋をして中火で10分煮る。汁気が半分になったら完成",
      ],
      point: "大根はレンジで下茹ですると大幅時短。落し蓋はアルミホイルでOK",
    },
  },
  {
    name: "チーズタッカルビ",
    label: "🧀 韓国風",
    time: "15分",
    memo: "チーズとコチュジャンの組み合わせ",
    bento: "チーズなしで取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "500g", fromFridge: false },
        { name: "キャベツ", amount: "1/4個", fromFridge: false },
        { name: "玉ねぎ", amount: "1/2個", fromFridge: false },
        { name: "とろけるチーズ", amount: "200g", fromFridge: false },
        { name: "コチュジャン", amount: "大さじ3", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① コチュジャン・醤油・砂糖・酒・にんにくを混ぜてタレを作る",
        "② 鶏ももを一口大に切り、タレに10分漬ける",
        "③ キャベツをざく切り、玉ねぎを薄切りにする",
        "④ フライパンにごま油を熱し、鶏肉をタレごと入れて中火で5分炒める",
        "⑤ 野菜を加えて3分炒め、チーズを中央に乗せて蓋をし2分蒸す",
      ],
      point: "ホットプレートで作ると盛り上がる。チーズを真ん中に集めて溶かすのがコツ",
    },
  },
  {
    name: "回鍋肉（ホイコーロー）",
    label: "🌶️ 中華の日",
    time: "10分",
    memo: "甜麺醤でコク旨",
    bento: "取り分けてご飯に乗せる",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ肉", amount: "300g", fromFridge: false },
        { name: "キャベツ", amount: "1/4個", fromFridge: false },
        { name: "ピーマン", amount: "2個", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "甜麺醤", amount: "大さじ2", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "酒", amount: "大さじ1", fromFridge: false },
        { name: "豆板醤", amount: "小さじ1/2（お好みで）", fromFridge: false },
      ],
      steps: [
        "① キャベツを一口大にちぎる。ピーマンは乱切り、ねぎは斜め切り",
        "② 豚バラを5cm幅に切る",
        "③ フライパンに油を熱し、豚バラを中火で炒めて脂を出す",
        "④ にんにく・豆板醤を加えて香りを出す",
        "⑤ 野菜を加えて強火で2分炒め、甜麺醤・醤油・酒で味付け",
      ],
      point: "キャベツはちぎると味が染みやすい。強火で一気に仕上げるのが中華のコツ",
    },
  },
  {
    name: "親子丼",
    label: "🍚 どんぶり",
    time: "10分",
    memo: "卵ふわとろの親子丼",
    bento: "具を別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "400g", fromFridge: false },
        { name: "卵", amount: "6個", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "めんつゆ（3倍濃縮）", amount: "大さじ5", fromFridge: false },
        { name: "水", amount: "150ml", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "三つ葉（あれば）", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 鶏ももを2cm角に切る。玉ねぎを薄切りにする",
        "② フライパンに水・めんつゆ・みりんを入れて煮立たせる",
        "③ 玉ねぎ→鶏肉の順に入れ、蓋をして中火で5分煮る",
        "④ 溶き卵の2/3を回し入れ、蓋をして1分。残りの卵を入れて火を止め、蓋をして30秒蒸らす",
        "⑤ ご飯に乗せ、あれば三つ葉を散らす",
      ],
      point: "卵は2回に分けて入れるとふわとろに。火を止めてからの予熱で仕上げる",
    },
  },
  {
    name: "鯖の味噌煮",
    label: "🐟 魚の日",
    time: "15分",
    memo: "缶詰でお手軽",
    bento: "1切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鯖の味噌煮缶", amount: "2缶", fromFridge: false },
        { name: "大根", amount: "10cm", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
        { name: "醤油", amount: "小さじ1", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "万能ねぎ", amount: "2〜3本", fromFridge: false },
      ],
      steps: [
        "① 大根をすりおろす（またはいちょう切りにしてレンジ3分）",
        "② 鍋に鯖缶を汁ごと入れ、生姜・醤油・みりんを加える",
        "③ 中火で3分温める",
        "④ 大根おろしと刻みねぎを添えて盛り付ける",
      ],
      point: "缶詰なので調理はほぼ温めるだけ。大根おろしでさっぱり食べられる",
    },
  },
  {
    name: "豚キムチ炒め",
    label: "🌶️ ピリ辛",
    time: "8分",
    memo: "キムチの旨みで味付け簡単",
    bento: "取り分けてご飯に乗せる",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ肉", amount: "400g", fromFridge: false },
        { name: "キムチ", amount: "300g", fromFridge: false },
        { name: "ニラ", amount: "1束", fromFridge: false },
        { name: "もやし", amount: "1袋", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "小さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ1", fromFridge: false },
        { name: "白いりごま", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 豚バラを4cm幅に切る。ニラを4cm幅に切る",
        "② フライパンにごま油を熱し、豚バラを中火で3分炒める",
        "③ もやしを加えて1分炒める",
        "④ キムチを汁ごと入れ、酒・醤油を加えて強火で2分炒める",
        "⑤ ニラを入れてさっと炒め、ごまをふる",
      ],
      point: "キムチは汁ごと入れると旨みが段違い。ニラは最後に入れて食感を残す",
    },
  },
  {
    name: "焼きそば",
    label: "🍜 麺の日",
    time: "10分",
    memo: "ソース焼きそば、野菜たっぷり",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "焼きそば麺", amount: "4玉", fromFridge: false },
        { name: "豚バラ肉", amount: "200g", fromFridge: false },
        { name: "キャベツ", amount: "1/4個", fromFridge: false },
        { name: "もやし", amount: "1袋", fromFridge: false },
        { name: "にんじん", amount: "1/3本", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "焼きそばソース", amount: "付属4袋", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "かつお節", amount: "2パック", fromFridge: false },
        { name: "青のり", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 麺をレンジ600Wで1分半温めてほぐしやすくする",
        "② 豚バラを3cm幅、キャベツをざく切り、にんじんを短冊切りにする",
        "③ フライパンに油を熱し、豚バラを炒めて塩こしょう",
        "④ 野菜を加えて2分炒め、麺を入れてほぐしながら炒める",
        "⑤ ソースを加えて全体に絡め、かつお節・青のりをかける",
      ],
      point: "麺を先にレンジで温めるとダマにならない。水を少量かけるとほぐれやすい",
    },
  },
  {
    name: "鶏むねの唐揚げ",
    label: "🍗 唐揚げ",
    time: "20分",
    memo: "下味冷凍で味染み唐揚げ",
    bento: "3個取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏むね肉", amount: "600g", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
        { name: "片栗粉", amount: "大さじ5", fromFridge: false },
        { name: "サラダ油", amount: "フライパンに1cm程度", fromFridge: false },
      ],
      steps: [
        "① 鶏むねを一口大のそぎ切りにする（繊維を断つように斜めに切る）",
        "② 醤油・酒・にんにく・生姜・ごま油をボウルで混ぜ、鶏肉を10分漬ける",
        "③ 片栗粉をまぶす（ビニール袋でやると楽）",
        "④ フライパンに油を1cm入れて170℃に熱し、片面3分ずつ揚げ焼き",
        "⑤ 一度取り出して2分休ませ、180℃に上げて1分二度揚げする",
      ],
      point: "二度揚げでカリッとジューシーに。むね肉はそぎ切りにするとパサつかない",
    },
    freeze: "鶏むね唐揚げ用",
  },
  {
    name: "ビビンバ丼",
    label: "🍚 ビビンバ",
    time: "20分",
    memo: "ナムルと肉そぼろで本格風",
    bento: "具を別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "牛こま切れ", amount: "300g", fromFridge: false },
        { name: "もやし", amount: "1袋", fromFridge: false },
        { name: "ほうれん草", amount: "1束", fromFridge: false },
        { name: "にんじん", amount: "1/2本", fromFridge: false },
        { name: "卵黄", amount: "4個", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "コチュジャン", amount: "大さじ2", fromFridge: false },
        { name: "ごま油", amount: "大さじ3", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ1", fromFridge: false },
        { name: "白いりごま", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 【肉そぼろ】牛肉に醤油大さじ2・砂糖・にんにくを揉み込み、フライパンで炒める",
        "② 【もやしナムル】レンジ2分→水気を切り、ごま油大さじ1・鶏がら・塩少々で和える",
        "③ 【ほうれん草ナムル】茹でて3cm幅に切り、ごま油大さじ1・醤油大さじ1で和える",
        "④ 【にんじんナムル】千切りにしてレンジ1分半、ごま油大さじ1・塩少々で和える",
        "⑤ ご飯に全部乗せ、卵黄・コチュジャン・ごまをトッピング",
      ],
      point: "混ぜて食べるのが美味しい。ナムルは前日に作り置きすると楽",
    },
  },
  {
    name: "冷凍グラタン＆冷凍コロッケ",
    label: "❄️ 楽Day",
    time: "10分",
    memo: "レンジとトースターで完結",
    bento: "コロッケを詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "冷凍グラタン", amount: "4個", fromFridge: false },
        { name: "冷凍コロッケ", amount: "8個", fromFridge: false },
        { name: "サラダ油", amount: "揚げる場合は適量", fromFridge: false },
        { name: "中濃ソース", amount: "適量", fromFridge: false },
        { name: "キャベツ", amount: "2〜3枚（千切り用）", fromFridge: false },
      ],
      steps: [
        "① グラタンはレンジ600Wで表示時間温め、トースターで焼き目をつける（3分）",
        "② コロッケは油で揚げるか、レンジ600Wで表示時間温める",
        "③ キャベツを千切りにして皿に敷く",
        "④ コロッケを盛り、ソースを添える",
      ],
      point: "業スーの冷凍コロッケが安くておすすめ。キャベツの千切りで野菜も補える",
    },
  },
  {
    name: "豚丼（帯広風）",
    label: "🍚 豚丼",
    time: "10分",
    memo: "甘辛タレでがっつり",
    bento: "具を取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚ロース", amount: "500g", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ4", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "紅生姜", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 醤油・砂糖・みりん・酒を混ぜてタレを作る",
        "② 豚ロースに塩こしょうをふる",
        "③ フライパンに油を熱し、豚肉を中火で片面2分ずつ焼く",
        "④ タレを加えて煮詰めながら肉に絡める（1〜2分）",
        "⑤ ご飯に乗せて紅生姜を添える",
      ],
      point: "タレを先に煮詰めてから肉に絡めると照りが出る。刻みのりをかけても◎",
    },
  },
  // ===== ここから追加28品 =====
  {
    name: "肉じゃが",
    label: "🥩 和食の日",
    time: "20分",
    memo: "定番の家庭料理",
    bento: "汁気を切って詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚こま切れ", amount: "300g", fromFridge: false },
        { name: "じゃがいも", amount: "4個", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "にんじん", amount: "1本", fromFridge: false },
        { name: "しらたき", amount: "1袋", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "みりん", amount: "大さじ3", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "だしの素", amount: "小さじ1", fromFridge: false },
        { name: "水", amount: "300ml", fromFridge: false },
      ],
      steps: [
        "① じゃがいもを一口大、玉ねぎをくし切り、にんじんを乱切り、しらたきを食べやすく切る",
        "② 鍋に油を熱し、豚肉を炒める。色が変わったら野菜を加えて2分炒める",
        "③ 水・だしの素・酒・砂糖・みりん・醤油を加え、落し蓋をして中火で15分煮る",
        "④ じゃがいもに竹串が通ったら完成",
      ],
      point: "落し蓋はアルミホイルでOK。一度冷ますと味がよく染みる",
    },
  },
  {
    name: "鶏もものトマト煮",
    label: "🍅 洋食の日",
    time: "20分",
    memo: "トマト缶で簡単洋食",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "600g", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "しめじ", amount: "1パック", fromFridge: false },
        { name: "トマト缶", amount: "1缶（400g）", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "オリーブオイル", amount: "大さじ1", fromFridge: false },
        { name: "コンソメ", amount: "1個", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "小さじ1", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① 鶏ももを一口大に切り、塩こしょうをふる。玉ねぎを薄切り、しめじをほぐす",
        "② フライパンにオリーブオイルとにんにくを熱し、鶏肉を皮目から焼く（両面3分）",
        "③ 玉ねぎ・しめじを加えて2分炒め、トマト缶・コンソメ・ケチャップ・砂糖を入れる",
        "④ 蓋をして弱火で10分煮込み、塩こしょうで味を整える",
      ],
      point: "パスタやパンと合わせても美味しい。チーズを乗せるのもおすすめ",
    },
  },
  {
    name: "豚肉のポン酢炒め",
    label: "🥩 さっぱり",
    time: "10分",
    memo: "ポン酢でさっぱり簡単",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚こま切れ", amount: "400g", fromFridge: false },
        { name: "なす", amount: "3本", fromFridge: false },
        { name: "ピーマン", amount: "3個", fromFridge: false },
        { name: "サラダ油", amount: "大さじ2", fromFridge: false },
        { name: "ポン酢", amount: "大さじ4", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "白いりごま", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① なすを乱切り、ピーマンを一口大に切る",
        "② フライパンに油を熱し、なすを中火で3分炒めて取り出す",
        "③ 豚肉を炒め、色が変わったらなす・ピーマンを戻す",
        "④ ポン酢・みりんを回しかけて1分炒め、ごまをふる",
      ],
      point: "なすは油を多めに使うとトロトロに。大葉を添えるとさらにさっぱり",
    },
  },
  {
    name: "オムライス",
    label: "🍳 洋食の日",
    time: "15分",
    memo: "子供も大好き定番洋食",
    bento: "別容器に詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "ご飯", amount: "茶碗4杯", fromFridge: false },
        { name: "鶏もも肉", amount: "200g", fromFridge: false },
        { name: "玉ねぎ", amount: "1/2個", fromFridge: false },
        { name: "卵", amount: "8個", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ5", fromFridge: false },
        { name: "バター", amount: "20g", fromFridge: false },
        { name: "サラダ油", amount: "大さじ2", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "牛乳", amount: "大さじ2（卵用）", fromFridge: false },
        { name: "コンソメ", amount: "小さじ1", fromFridge: false },
      ],
      steps: [
        "① 鶏肉を小さめに切り、玉ねぎをみじん切りにする",
        "② フライパンにバターで鶏肉と玉ねぎを炒め、ご飯・ケチャップ・コンソメを加えて炒める",
        "③ チキンライスを皿に盛る。卵2個＋牛乳を混ぜ、油を敷いたフライパンで薄焼きにする",
        "④ チキンライスに卵を被せ、上からケチャップをかける（×4人分繰り返す）",
      ],
      point: "卵は半熟で仕上げるとふわとろ。卵液にマヨネーズ小さじ1を入れると破れにくい",
    },
  },
  {
    name: "鶏もものケチャップ焼き",
    label: "🍗 洋風",
    time: "12分",
    memo: "ケチャップ味で子供に人気",
    bento: "2切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "600g", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ4", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ2", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "砂糖", amount: "小さじ1", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
      ],
      steps: [
        "① ケチャップ・ソース・醤油・砂糖・にんにくを混ぜてタレを作る",
        "② 鶏ももを一口大に切り、塩こしょうをふる",
        "③ フライパンに油を熱し、皮目から中火で4分焼く。裏返して3分",
        "④ タレを加えて強火で1分、照りが出るまで絡める",
      ],
      point: "ケチャップは焦げやすいので最後に絡める。レタスを添えると彩り◎",
    },
  },
  {
    name: "ナポリタン",
    label: "🍝 パスタの日",
    time: "15分",
    memo: "懐かしの喫茶店風ナポリタン",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "スパゲッティ", amount: "400g", fromFridge: false },
        { name: "ウインナー", amount: "8本", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "ピーマン", amount: "3個", fromFridge: false },
        { name: "マッシュルーム缶", amount: "1缶", fromFridge: false },
        { name: "バター", amount: "20g", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ8", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ1", fromFridge: false },
        { name: "牛乳", amount: "大さじ2", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "粉チーズ", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① パスタを表示時間通り茹でる。ウインナーを斜め切り、玉ねぎを薄切り、ピーマンを細切り",
        "② フライパンにバターを溶かし、ウインナー・玉ねぎを中火で3分炒める",
        "③ ピーマン・マッシュルームを加えて1分。茹でたパスタを入れる",
        "④ ケチャップ・ソース・牛乳を加えて強火で2分炒め、粉チーズをかける",
      ],
      point: "牛乳を加えるとまろやかに。ケチャップは多めが喫茶店風のコツ",
    },
  },
  {
    name: "豚バラもやし蒸し",
    label: "🥩 ヘルシー",
    time: "10分",
    memo: "レンジで超簡単ヘルシー",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ肉", amount: "400g", fromFridge: false },
        { name: "もやし", amount: "2袋", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "ポン酢", amount: "大さじ4", fromFridge: false },
        { name: "万能ねぎ", amount: "3本", fromFridge: false },
        { name: "白いりごま", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 耐熱皿にもやしを広げ、豚バラを重ならないように乗せる",
        "② 塩こしょう・酒をふり、ふんわりラップしてレンジ600Wで8分",
        "③ 豚肉に火が通っているか確認（赤ければ追加2分）",
        "④ 刻みねぎとごまをかけ、ポン酢をかけて食べる",
      ],
      point: "フライパン不要の洗い物が楽なメニュー。ゴマだれでも美味しい",
    },
  },
  {
    name: "鶏そぼろ丼",
    label: "🍚 そぼろ丼",
    time: "10分",
    memo: "3色そぼろ丼",
    bento: "そぼろを別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏ひき肉", amount: "400g", fromFridge: false },
        { name: "卵", amount: "4個", fromFridge: false },
        { name: "醤油", amount: "大さじ3", fromFridge: false },
        { name: "みりん", amount: "大さじ3", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
        { name: "サラダ油", amount: "小さじ1", fromFridge: false },
        { name: "塩", amount: "少々（卵用）", fromFridge: false },
        { name: "絹さや（あれば）", amount: "8枚", fromFridge: false },
      ],
      steps: [
        "① 【鶏そぼろ】フライパンにひき肉・醤油・みりん・酒・砂糖・生姜を入れ、菜箸4本でかき混ぜながら中火で5分",
        "② 【炒り卵】卵に塩を加えて溶き、油を敷いたフライパンで菜箸で細かくかき混ぜながら炒る",
        "③ 絹さやがあれば塩茹でして斜め切り",
        "④ ご飯に鶏そぼろ・炒り卵・絹さやを彩りよく盛る",
      ],
      point: "菜箸4本で混ぜるとそぼろが細かくなる。多めに作って冷凍保存◎",
    },
  },
  {
    name: "エビチリ",
    label: "🦐 中華の日",
    time: "15分",
    memo: "ケチャップで簡単エビチリ",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "冷凍むきえび", amount: "400g", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "卵", amount: "1個", fromFridge: false },
        { name: "片栗粉", amount: "大さじ2", fromFridge: false },
        { name: "サラダ油", amount: "大さじ2", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
        { name: "生姜チューブ", amount: "2cm", fromFridge: false },
        { name: "豆板醤", amount: "小さじ1", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ4", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ1", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "水", amount: "100ml", fromFridge: false },
      ],
      steps: [
        "① えびを解凍し、酒・片栗粉を揉み込む。長ねぎをみじん切り",
        "② ケチャップ・鶏がら・砂糖・水を混ぜてチリソースを作る",
        "③ フライパンに油を熱し、にんにく・生姜・豆板醤を弱火で炒めて香りを出す",
        "④ えびを加えて中火で2分炒め、チリソースを入れて3分煮詰める。溶き卵を回し入れる",
      ],
      point: "豆板醤の量で辛さ調整。子供用は豆板醤なしでもOK。卵でまろやかに",
    },
  },
  {
    name: "ハンバーグ",
    label: "🥩 洋食の日",
    time: "20分",
    memo: "定番の煮込みハンバーグ",
    bento: "1個取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "合い挽き肉", amount: "500g", fromFridge: false },
        { name: "玉ねぎ", amount: "1/2個", fromFridge: false },
        { name: "パン粉", amount: "大さじ4", fromFridge: false },
        { name: "牛乳", amount: "大さじ3", fromFridge: false },
        { name: "卵", amount: "1個", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "ナツメグ", amount: "少々", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ4", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ3", fromFridge: false },
        { name: "水", amount: "100ml", fromFridge: false },
      ],
      steps: [
        "① 玉ねぎをみじん切りにしてレンジ2分加熱し冷ます。パン粉を牛乳で湿らす",
        "② ひき肉・玉ねぎ・パン粉・卵・塩こしょう・ナツメグをよくこねて4等分に成形",
        "③ フライパンに油を熱し、中火で片面3分焼く。裏返して蓋をし弱火で5分蒸し焼き",
        "④ ケチャップ・ソース・水を加えて5分煮込む",
      ],
      point: "こねる時は手を冷水で冷やすとベタつかない。中央をくぼませると膨らみ防止",
    },
  },
  {
    name: "野菜炒め定食",
    label: "🥬 野菜の日",
    time: "8分",
    memo: "冷蔵庫の余り野菜で",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚こま切れ", amount: "300g", fromFridge: false },
        { name: "キャベツ", amount: "1/4個", fromFridge: false },
        { name: "にんじん", amount: "1/2本", fromFridge: false },
        { name: "もやし", amount: "1袋", fromFridge: false },
        { name: "ピーマン", amount: "2個", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ2", fromFridge: false },
        { name: "醤油", amount: "大さじ1.5", fromFridge: false },
        { name: "オイスターソース", amount: "大さじ1", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① 野菜を食べやすい大きさに切る（にんじんは短冊切り）",
        "② フライパンに油を強火で熱し、豚肉を炒める",
        "③ にんじん→キャベツ→もやし→ピーマンの順に加え、強火で2分炒める",
        "④ 鶏がら・醤油・オイスターソース・塩こしょうで味付け",
      ],
      point: "強火で手早く炒めるのがシャキシャキのコツ。水っぽくならない",
    },
  },
  {
    name: "カレーうどん",
    label: "🍛 カレーの日",
    time: "10分",
    memo: "残りカレーでもOK",
    bento: "別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "冷凍うどん", amount: "4玉", fromFridge: false },
        { name: "豚こま切れ", amount: "200g", fromFridge: false },
        { name: "長ねぎ", amount: "1本", fromFridge: false },
        { name: "油揚げ", amount: "1枚", fromFridge: false },
        { name: "めんつゆ（3倍濃縮）", amount: "大さじ4", fromFridge: false },
        { name: "カレールー", amount: "2かけ", fromFridge: false },
        { name: "水", amount: "800ml", fromFridge: false },
        { name: "片栗粉", amount: "大さじ1（水大さじ2で溶く）", fromFridge: false },
      ],
      steps: [
        "① うどんをレンジで温める。ねぎを斜め切り、油揚げを短冊切り",
        "② 鍋に水を沸かし、豚肉・ねぎ・油揚げを入れて2分煮る",
        "③ めんつゆ・カレールーを加えて溶かし、水溶き片栗粉でとろみをつける",
        "④ うどんを器に入れ、カレー汁をかける",
      ],
      point: "とろみをつけると麺に絡んで美味しい。七味唐辛子を添えて",
    },
  },
  {
    name: "タコライス",
    label: "🌮 エスニック",
    time: "10分",
    memo: "カフェ風ワンプレート",
    bento: "具を別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "合い挽き肉", amount: "400g", fromFridge: false },
        { name: "玉ねぎ", amount: "1/2個", fromFridge: false },
        { name: "レタス", amount: "4枚", fromFridge: false },
        { name: "トマト", amount: "1個", fromFridge: false },
        { name: "とろけるチーズ", amount: "100g", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ3", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ2", fromFridge: false },
        { name: "カレー粉", amount: "小さじ2", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① 玉ねぎをみじん切り。レタスを千切り、トマトを角切り",
        "② フライパンでにんにく・ひき肉・玉ねぎを炒め、ケチャップ・ソース・カレー粉で味付け",
        "③ ご飯にレタス→タコミート→トマト→チーズの順に盛る",
      ],
      point: "タバスコやサルサソースを添えると本格的。温泉卵を乗せても◎",
    },
  },
  {
    name: "ミートソースパスタ",
    label: "🍝 パスタの日",
    time: "20分",
    memo: "トマト缶で本格ミートソース",
    bento: "ソースを別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "スパゲッティ", amount: "400g", fromFridge: false },
        { name: "合い挽き肉", amount: "400g", fromFridge: false },
        { name: "玉ねぎ", amount: "1個", fromFridge: false },
        { name: "にんじん", amount: "1/2本", fromFridge: false },
        { name: "トマト缶", amount: "1缶（400g）", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "オリーブオイル", amount: "大さじ1", fromFridge: false },
        { name: "コンソメ", amount: "1個", fromFridge: false },
        { name: "ケチャップ", amount: "大さじ2", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ1", fromFridge: false },
        { name: "砂糖", amount: "小さじ1", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "粉チーズ", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 玉ねぎ・にんじんをみじん切り。パスタを茹で始める",
        "② フライパンにオリーブオイル・にんにくを熱し、ひき肉を炒める",
        "③ 野菜を加えて3分炒め、トマト缶・コンソメ・ケチャップ・ソース・砂糖を入れて10分煮る",
        "④ 茹でたパスタにソースをかけ、粉チーズをふる",
      ],
      point: "ソースは多めに作って冷凍保存OK。グラタンやドリアにもアレンジ可能",
    },
  },
  {
    name: "鶏むねの味噌マヨ焼き",
    label: "🍗 味噌マヨ",
    time: "12分",
    memo: "味噌マヨでご飯がすすむ",
    bento: "2切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏むね肉", amount: "600g", fromFridge: false },
        { name: "酒", amount: "大さじ1", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "味噌", amount: "大さじ2", fromFridge: false },
        { name: "マヨネーズ", amount: "大さじ2", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "砂糖", amount: "小さじ1", fromFridge: false },
        { name: "万能ねぎ", amount: "2本", fromFridge: false },
      ],
      steps: [
        "① 味噌・マヨネーズ・みりん・砂糖を混ぜてタレを作る",
        "② 鶏むねをそぎ切りにし、酒を揉み込む",
        "③ フライパンに油を熱し、鶏肉を中火で両面3分ずつ焼く",
        "④ タレを加えて絡め、刻みねぎをかける",
      ],
      point: "味噌マヨは焦げやすいので弱めの火で。むね肉はそぎ切りでパサつき防止",
    },
  },
  {
    name: "牛丼",
    label: "🍚 どんぶり",
    time: "15分",
    memo: "吉野家風のつゆだく牛丼",
    bento: "具を別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "牛こま切れ", amount: "500g", fromFridge: false },
        { name: "玉ねぎ", amount: "2個", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
        { name: "醤油", amount: "大さじ4", fromFridge: false },
        { name: "みりん", amount: "大さじ4", fromFridge: false },
        { name: "酒", amount: "大さじ3", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "だしの素", amount: "小さじ1", fromFridge: false },
        { name: "水", amount: "300ml", fromFridge: false },
        { name: "紅生姜", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① 玉ねぎを薄切りにする",
        "② 鍋に水・だしの素・酒・砂糖・みりん・醤油・生姜を入れて煮立たせる",
        "③ 玉ねぎを入れて3分煮て、牛肉を広げながら加える。アクを取り5分煮る",
        "④ ご飯に汁ごとかけ、紅生姜を添える",
      ],
      point: "牛肉は広げて入れるとかたまりにならない。温泉卵を乗せても美味しい",
    },
  },
  {
    name: "豚ロースのトンテキ",
    label: "🥩 がっつり",
    time: "12分",
    memo: "厚切り豚ロースをガッツリ",
    bento: "切って詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚ロース厚切り", amount: "4枚（500g）", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "薄力粉", amount: "適量", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "ウスターソース", amount: "大さじ4", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "バター", amount: "10g", fromFridge: false },
      ],
      steps: [
        "① 豚ロースの筋を切り、塩こしょう→薄力粉を薄くまぶす",
        "② ウスターソース・醤油・みりん・砂糖・にんにくを混ぜてタレを作る",
        "③ フライパンに油を熱し、中火で片面3分ずつ焼く",
        "④ タレとバターを加え、1分煮詰めながら絡める。キャベツの千切りを添える",
      ],
      point: "筋切りをしっかりすると反り返らない。バターで風味アップ",
    },
  },
  {
    name: "白菜と豚バラのミルフィーユ鍋",
    label: "🍲 鍋の日",
    time: "15分",
    memo: "白菜と豚バラを重ねるだけ",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ薄切り", amount: "400g", fromFridge: false },
        { name: "白菜", amount: "1/2個", fromFridge: false },
        { name: "だしの素", amount: "小さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "水", amount: "200ml", fromFridge: false },
        { name: "ポン酢", amount: "適量（つけダレ）", fromFridge: false },
        { name: "万能ねぎ", amount: "3本", fromFridge: false },
      ],
      steps: [
        "① 白菜と豚バラを交互に重ね、5cm幅に切る",
        "② 鍋に断面を上にして隙間なく詰める",
        "③ 水・だしの素・酒を加え、蓋をして中火で10分煮る",
        "④ 刻みねぎをかけ、ポン酢で食べる",
      ],
      point: "詰めるだけで見た目が華やか。ゆず胡椒を添えても◎",
    },
  },
  {
    name: "チャーハン",
    label: "🍚 チャーハン",
    time: "8分",
    memo: "パラパラ卵チャーハン",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "ご飯", amount: "茶碗4杯", fromFridge: false },
        { name: "卵", amount: "4個", fromFridge: false },
        { name: "長ねぎ", amount: "1本", fromFridge: false },
        { name: "ハム", amount: "6枚", fromFridge: false },
        { name: "サラダ油", amount: "大さじ2", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ2", fromFridge: false },
        { name: "醤油", amount: "大さじ1（鍋肌から）", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① ねぎをみじん切り、ハムを5mm角に切る。卵を溶く",
        "② フライパンに油を強火で熱し、溶き卵を入れて半熟のうちにご飯を投入",
        "③ 強火のままお玉の背で押し付けるように炒め、パラパラになったらハム・ねぎを加える",
        "④ 鶏がら・塩こしょうで味付け、鍋肌から醤油を回しかけ、ごま油で仕上げ",
      ],
      point: "ご飯は温かいものを使う。強火キープでパラパラに。醤油は鍋肌から入れると焦げて香ばしい",
    },
  },
  {
    name: "鶏もも肉のめんつゆ唐揚げ",
    label: "🍗 唐揚げ",
    time: "15分",
    memo: "めんつゆで味付け簡単",
    bento: "3個取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "600g", fromFridge: false },
        { name: "めんつゆ（3倍濃縮）", amount: "大さじ4", fromFridge: false },
        { name: "にんにくチューブ", amount: "3cm", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
        { name: "片栗粉", amount: "大さじ5", fromFridge: false },
        { name: "サラダ油", amount: "フライパンに1cm", fromFridge: false },
      ],
      steps: [
        "① 鶏ももを一口大に切り、めんつゆ・にんにく・生姜を揉み込んで10分漬ける",
        "② 片栗粉をまぶす（ビニール袋でやると楽）",
        "③ フライパンに油1cmを170℃に熱し、片面3分ずつ揚げ焼き",
        "④ 一度取り出して2分休ませ、180℃で1分二度揚げ",
      ],
      point: "めんつゆだけで味が決まる時短レシピ。もも肉でジューシーに",
    },
  },
  {
    name: "豚こまとなすの味噌炒め",
    label: "🌶️ ご飯がすすむ",
    time: "10分",
    memo: "甘辛味噌でご飯がすすむ",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚こま切れ", amount: "400g", fromFridge: false },
        { name: "なす", amount: "4本", fromFridge: false },
        { name: "ピーマン", amount: "3個", fromFridge: false },
        { name: "サラダ油", amount: "大さじ3", fromFridge: false },
        { name: "味噌", amount: "大さじ3", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "生姜チューブ", amount: "2cm", fromFridge: false },
      ],
      steps: [
        "① なすを乱切り、ピーマンを一口大に切る。味噌・砂糖・酒・みりん・生姜を混ぜてタレを作る",
        "② フライパンに油大さじ2を熱し、なすを中火で3分炒めて取り出す",
        "③ 油大さじ1を足し、豚肉を炒める。色が変わったらなす・ピーマンを戻す",
        "④ タレを加えて全体に絡め、1分炒める",
      ],
      point: "なすは油を吸うので多めに。味噌ダレは焦がさないよう手早く",
    },
  },
  {
    name: "鮭のちゃんちゃん焼き",
    label: "🐟 魚の日",
    time: "15分",
    memo: "味噌バターで北海道風",
    bento: "1切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "生鮭", amount: "4切れ", fromFridge: false },
        { name: "キャベツ", amount: "1/4個", fromFridge: false },
        { name: "玉ねぎ", amount: "1/2個", fromFridge: false },
        { name: "にんじん", amount: "1/3本", fromFridge: false },
        { name: "しめじ", amount: "1パック", fromFridge: false },
        { name: "バター", amount: "20g", fromFridge: false },
        { name: "味噌", amount: "大さじ3", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 味噌・みりん・酒・砂糖を混ぜてタレを作る。野菜を食べやすく切る",
        "② フライパンにバター半量を溶かし、鮭を両面焼く（片面3分）",
        "③ 野菜を鮭の周りに入れ、タレをかけて蓋をし中火で5分蒸し焼き",
        "④ 残りのバターを乗せて完成",
      ],
      point: "ホイルに包んでトースターで焼いてもOK。味噌バターが絶品",
    },
  },
  {
    name: "厚揚げの肉巻き",
    label: "🥩 節約",
    time: "12分",
    memo: "厚揚げでボリュームアップ",
    bento: "切って詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "厚揚げ", amount: "2枚", fromFridge: false },
        { name: "豚バラ薄切り", amount: "300g", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "片栗粉", amount: "適量", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "酒", amount: "大さじ1", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 厚揚げを8等分に切り、豚バラを巻きつける。塩こしょう→片栗粉をまぶす",
        "② フライパンに油を熱し、巻き終わりを下にして中火で焼く（全面3分）",
        "③ 醤油・みりん・酒・砂糖を混ぜたタレを加え、転がしながら絡める",
      ],
      point: "厚揚げでかさ増しできて節約に◎。大葉を巻いても美味しい",
    },
  },
  {
    name: "豚バラキャベツの塩だれ炒め",
    label: "🥩 塩だれ",
    time: "8分",
    memo: "塩だれでさっぱり",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚バラ肉", amount: "400g", fromFridge: false },
        { name: "キャベツ", amount: "1/3個", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "塩", amount: "小さじ1/2", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ2", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
        { name: "レモン汁", amount: "大さじ1", fromFridge: false },
        { name: "黒こしょう", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① ごま油・塩・鶏がら・にんにく・レモン汁を混ぜて塩だれを作る",
        "② キャベツをざく切りにする。豚バラを4cm幅に切る",
        "③ フライパンに油を熱し、豚バラを中火で3分炒める",
        "④ キャベツを加えて2分炒め、塩だれを回しかけて黒こしょうをふる",
      ],
      point: "レモンでさっぱり。ビールに合うおかず。もやしを足してもOK",
    },
  },
  {
    name: "かに玉丼（天津飯）",
    label: "🍚 中華丼",
    time: "10分",
    memo: "ふわとろ卵の天津飯",
    bento: "具を別容器に",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "卵", amount: "8個", fromFridge: false },
        { name: "カニカマ", amount: "10本", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "ごま油", amount: "大さじ2", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ2", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "酢", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "水", amount: "200ml", fromFridge: false },
        { name: "片栗粉", amount: "大さじ1（水大さじ2で溶く）", fromFridge: false },
      ],
      steps: [
        "① 【甘酢あん】水・鶏がら・醤油・酢・砂糖を鍋で煮立て、水溶き片栗粉でとろみをつける",
        "② カニカマをほぐし、ねぎをみじん切り。卵を溶いてカニカマ・ねぎを混ぜる",
        "③ フライパンにごま油を熱し、卵液を入れて大きくかき混ぜ、半熟で止める（1人分ずつ作る）",
        "④ ご飯に卵を乗せ、甘酢あんをかける",
      ],
      point: "卵は1人分ずつ作るとふわふわに仕上がる。グリーンピースを散らすと彩り◎",
    },
  },
  {
    name: "鶏もも肉の甘辛煮",
    label: "🍗 甘辛煮",
    time: "15分",
    memo: "こってり甘辛で白飯に合う",
    bento: "2切れ取り分け",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "鶏もも肉", amount: "600g", fromFridge: false },
        { name: "サラダ油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ4", fromFridge: false },
        { name: "みりん", amount: "大さじ3", fromFridge: false },
        { name: "酒", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "酢", amount: "大さじ1", fromFridge: false },
        { name: "生姜チューブ", amount: "3cm", fromFridge: false },
      ],
      steps: [
        "① 鶏ももを一口大に切る",
        "② フライパンに油を熱し、鶏肉を皮目から中火で4分焼く。裏返して2分",
        "③ 余分な脂をキッチンペーパーで拭き、醤油・みりん・酒・砂糖・酢・生姜を加える",
        "④ 中火で汁気が半分になるまで5分煮絡める",
      ],
      point: "酢を入れると肉が柔らかくなりさっぱり感も。ゆで卵を一緒に煮ても◎",
    },
  },
  {
    name: "焼肉のたれ炒飯",
    label: "🍚 チャーハン",
    time: "8分",
    memo: "焼肉のたれで味付け一発",
    bento: "取り分けて詰める",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "ご飯", amount: "茶碗4杯", fromFridge: false },
        { name: "豚ひき肉", amount: "200g", fromFridge: false },
        { name: "卵", amount: "3個", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "レタス", amount: "2枚", fromFridge: false },
        { name: "サラダ油", amount: "大さじ2", fromFridge: false },
        { name: "焼肉のタレ", amount: "大さじ5", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① ねぎをみじん切り、レタスをちぎる。卵を溶く",
        "② フライパンに油を強火で熱し、ひき肉をポロポロに炒める",
        "③ 溶き卵を入れ、すぐにご飯を投入して強火で炒める",
        "④ 焼肉のたれを加えて全体に絡め、ねぎ・レタスを入れてさっと炒め、ごま油で仕上げ",
      ],
      point: "焼肉のたれで味が一発で決まる。レタスはシャキシャキ感を残す",
    },
  },
];

// ===== 副菜プール =====
const SIDE_POOL: { name: string; recipe: Recipe }[] = [
  {
    name: "切干大根の中華サラダ",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "切干大根", amount: "80g", fromFridge: false },
        { name: "きゅうり", amount: "2本", fromFridge: false },
        { name: "ハム", amount: "4枚", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "酢", amount: "大さじ2", fromFridge: false },
        { name: "ごま油", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "小さじ2", fromFridge: false },
        { name: "白いりごま", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 切干大根を水で10分戻し、水気をしっかり絞る",
        "② きゅうりを千切り、ハムを細切りにする",
        "③ 醤油・酢・ごま油・砂糖を混ぜてドレッシングを作る",
        "④ 全て和えてごまをかける。保存容器で冷蔵",
      ],
      point: "3日目はごま油を少し足すとリフレッシュ。水気はしっかり絞ると味がぼやけない",
    },
  },
  {
    name: "ほうれん草コーンバター",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "ほうれん草", amount: "2束", fromFridge: false },
        { name: "コーン缶", amount: "1缶", fromFridge: false },
        { name: "バター", amount: "20g", fromFridge: false },
        { name: "醤油", amount: "大さじ1.5", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① ほうれん草を茹でて冷水に取り、3cm幅に切って水気を絞る",
        "② フライパンにバターを溶かし、コーン（水気を切る）を1分炒める",
        "③ ほうれん草を加えてさっと炒め、醤油・塩こしょうで味付け",
        "④ 粗熱を取って保存容器で冷蔵",
      ],
      point: "3日目はとろけるチーズを乗せてレンジで温めるとグラタン風に",
    },
  },
  {
    name: "キャベツのごま和え",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "キャベツ", amount: "1/2個", fromFridge: false },
        { name: "すりごま", amount: "大さじ3", fromFridge: false },
        { name: "醤油", amount: "大さじ1.5", fromFridge: false },
        { name: "砂糖", amount: "小さじ2", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
      ],
      steps: [
        "① キャベツをざく切りにし、耐熱容器に入れてレンジ600Wで3分加熱",
        "② 粗熱が取れたら水気をしっかり絞る",
        "③ すりごま・醤油・砂糖・ごま油を混ぜ、キャベツと和える",
        "④ 保存容器で冷蔵",
      ],
      point: "3日目はマヨネーズ大さじ1を足すとコクのある違った味わいに",
    },
  },
  {
    name: "もやしのナムル",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "もやし", amount: "2袋", fromFridge: false },
        { name: "ごま油", amount: "大さじ2", fromFridge: false },
        { name: "にんにくチューブ", amount: "2cm", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ1", fromFridge: false },
        { name: "塩", amount: "小さじ1/2", fromFridge: false },
        { name: "白いりごま", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① もやしを耐熱容器に入れ、レンジ600Wで2分半加熱",
        "② ザルにあけて水気をしっかり切る（キッチンペーパーで押さえる）",
        "③ ごま油・にんにく・鶏がら・塩を加えて混ぜる",
        "④ ごまをふり、保存容器で冷蔵",
      ],
      point: "3日目はラー油を数滴たらしてピリ辛に。水気は徹底的に切るのが日持ちのコツ",
    },
  },
  {
    name: "ブロッコリーの塩昆布和え",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "ブロッコリー", amount: "2株", fromFridge: false },
        { name: "塩昆布", amount: "20g", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "白いりごま", amount: "小さじ2", fromFridge: false },
      ],
      steps: [
        "① ブロッコリーを小房に分け、耐熱容器に入れてレンジ600Wで3分加熱",
        "② 水気を切り、熱いうちに塩昆布・ごま油を加えて和える",
        "③ ごまをふり、保存容器で冷蔵",
      ],
      point: "塩昆布の塩気で味付け不要。3日目はマヨネーズ大さじ1で味変",
    },
  },
  {
    name: "にんじんしりしり",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "にんじん", amount: "3本", fromFridge: false },
        { name: "ツナ缶", amount: "1缶", fromFridge: false },
        { name: "卵", amount: "2個", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "めんつゆ（3倍濃縮）", amount: "大さじ2", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "白いりごま", amount: "適量", fromFridge: false },
      ],
      steps: [
        "① にんじんをスライサーか包丁で千切りにする",
        "② フライパンにごま油を熱し、にんじんを中火で2分炒める",
        "③ ツナ缶を油ごと加えて1分炒め、めんつゆ・塩こしょうで味付け",
        "④ 溶き卵を回し入れ、大きく混ぜて炒り合わせる。ごまをふる",
      ],
      point: "めんつゆだけで味が決まる。にんじんは細く切ると子供も食べやすい",
    },
  },
  {
    name: "小松菜とちくわの煮浸し",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "小松菜", amount: "2束", fromFridge: false },
        { name: "ちくわ", amount: "4本", fromFridge: false },
        { name: "めんつゆ（3倍濃縮）", amount: "大さじ3", fromFridge: false },
        { name: "水", amount: "150ml", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "かつお節", amount: "1パック", fromFridge: false },
      ],
      steps: [
        "① 小松菜を3cm幅に切る。ちくわを5mm幅の斜め切りにする",
        "② 鍋に水・めんつゆ・みりんを入れて煮立たせる",
        "③ ちくわ→小松菜の茎→葉の順に入れ、2分煮る",
        "④ 火を止めてかつお節を混ぜる。冷めたら保存容器で冷蔵",
      ],
      point: "冷やして食べても美味しい。煮汁ごと保存すると味が染みる",
    },
  },
  {
    name: "ポテトサラダ",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "じゃがいも", amount: "4個（500g）", fromFridge: false },
        { name: "きゅうり", amount: "1本", fromFridge: false },
        { name: "ハム", amount: "4枚", fromFridge: false },
        { name: "マヨネーズ", amount: "大さじ5", fromFridge: false },
        { name: "酢", amount: "小さじ2", fromFridge: false },
        { name: "塩", amount: "小さじ1/2", fromFridge: false },
        { name: "こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① じゃがいもを皮ごと洗い、ラップに包んでレンジ600Wで6分加熱",
        "② 熱いうちに皮をむき、フォークで粗めに潰す。酢をふりかける",
        "③ きゅうりを薄切りにし、塩少々で揉んで水気を絞る。ハムを短冊切り",
        "④ 粗熱が取れたらきゅうり・ハム・マヨネーズ・塩こしょうを加えて混ぜる",
      ],
      point: "熱いうちに酢を加えると味が染みて日持ちも良くなる。3日目はカレー粉小さじ1でアレンジ",
    },
  },
  {
    name: "かぼちゃの甘煮",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "かぼちゃ", amount: "1/4個（400g）", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "みりん", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ2", fromFridge: false },
        { name: "水", amount: "200ml", fromFridge: false },
      ],
      steps: [
        "① かぼちゃのワタと種を取り、一口大に切る（皮は所々むく）",
        "② 鍋にかぼちゃを皮目を下に並べ、水・砂糖・みりん・醤油を入れる",
        "③ 落し蓋（アルミホイル）をして中火で15分煮る",
        "④ 竹串がスッと通ったら火を止め、そのまま冷まして味を含ませる",
      ],
      point: "レンジで3分下茹ですると時短。冷ます間に味が染みるので急がない",
    },
  },
  {
    name: "白菜のツナマヨサラダ",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "白菜", amount: "1/4個", fromFridge: false },
        { name: "ツナ缶", amount: "1缶", fromFridge: false },
        { name: "マヨネーズ", amount: "大さじ3", fromFridge: false },
        { name: "醤油", amount: "小さじ1", fromFridge: false },
        { name: "塩", amount: "小さじ1/2（塩もみ用）", fromFridge: false },
        { name: "こしょう", amount: "少々", fromFridge: false },
      ],
      steps: [
        "① 白菜を千切りにし、塩小さじ1/2をふって5分置く",
        "② しんなりしたら水気をギュッと絞る",
        "③ ツナ缶（油を軽く切る）・マヨネーズ・醤油・こしょうを加えて和える",
        "④ 保存容器で冷蔵",
      ],
      point: "コーン缶を足すと子供に人気。水気をしっかり絞るのが美味しさのコツ",
    },
  },
  {
    name: "ピーマンとじゃこの炒め物",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "ピーマン", amount: "6個", fromFridge: false },
        { name: "しらす", amount: "50g", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ1", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "かつお節", amount: "1パック", fromFridge: false },
      ],
      steps: [
        "① ピーマンのヘタと種を取り、細切りにする",
        "② フライパンにごま油を熱し、ピーマンを中火で2分炒める",
        "③ しらすを加えて1分炒め、醤油・みりんを回しかける",
        "④ 火を止めてかつお節を混ぜる。保存容器で冷蔵",
      ],
      point: "かつお節の風味がアクセント。ピーマンは細切りにすると苦味が和らぐ",
    },
  },
  {
    name: "きんぴらごぼう",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "ごぼう", amount: "2本", fromFridge: false },
        { name: "にんじん", amount: "1本", fromFridge: false },
        { name: "ごま油", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "みりん", amount: "大さじ1", fromFridge: false },
        { name: "酒", amount: "大さじ1", fromFridge: false },
        { name: "白いりごま", amount: "大さじ1", fromFridge: false },
        { name: "赤唐辛子", amount: "1本（お好みで）", fromFridge: false },
      ],
      steps: [
        "① ごぼうを千切りにし、水に5分さらしてアクを抜く。にんじんも千切り",
        "② フライパンにごま油を熱し、赤唐辛子（種を取る）を入れて香りを出す",
        "③ ごぼう→にんじんの順に入れ、中火で3分炒める",
        "④ 酒・醤油・砂糖・みりんを加え、汁気がなくなるまで炒める",
        "⑤ ごまをふる。保存容器で冷蔵",
      ],
      point: "ごぼうは太めに切ると食感が良い。唐辛子はお好みで",
    },
  },
  {
    name: "春雨サラダ",
    recipe: {
      servings: "4人×3日分",
      ingredients: [
        { name: "春雨", amount: "80g", fromFridge: false },
        { name: "きゅうり", amount: "1本", fromFridge: false },
        { name: "ハム", amount: "4枚", fromFridge: false },
        { name: "酢", amount: "大さじ3", fromFridge: false },
        { name: "醤油", amount: "大さじ2", fromFridge: false },
        { name: "砂糖", amount: "大さじ1", fromFridge: false },
        { name: "ごま油", amount: "大さじ2", fromFridge: false },
        { name: "白いりごま", amount: "大さじ1", fromFridge: false },
      ],
      steps: [
        "① 春雨を表示時間通り茹で、冷水で冷やしてザルにあげる。食べやすい長さに切る",
        "② きゅうりを千切り、ハムを細切りにする",
        "③ 酢・醤油・砂糖・ごま油を混ぜてドレッシングを作る",
        "④ 春雨・きゅうり・ハムをドレッシングで和え、ごまをふる",
      ],
      point: "春雨が熱いうちにドレッシングで和えると味が染みる。錦糸卵をのせると華やか",
    },
  },
];

// ===== 汁物プール =====
const SOUP_POOL: { name: string; recipe: Recipe }[] = [
  {
    name: "インスタント味噌汁",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "インスタント味噌汁", amount: "4食分", fromFridge: false },
      ],
      steps: ["① お湯を沸かして注ぐだけ"],
      point: null,
    },
  },
  {
    name: "わかめスープ",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "乾燥わかめ", amount: "大さじ2", fromFridge: false },
        { name: "鶏がらスープの素", amount: "小さじ2", fromFridge: false },
        { name: "醤油", amount: "小さじ1", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
        { name: "白いりごま", amount: "適量", fromFridge: false },
        { name: "水", amount: "800ml", fromFridge: false },
      ],
      steps: [
        "① 鍋に水を沸かし、鶏がらスープの素・醤油を入れる",
        "② わかめを加えて1分煮る",
        "③ 火を止めてごま油を回しかけ、ごまをふる",
      ],
      point: "長ねぎの小口切りを入れても美味しい",
    },
  },
  {
    name: "卵スープ",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "卵", amount: "2個", fromFridge: false },
        { name: "鶏がらスープの素", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "小さじ1", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "片栗粉", amount: "小さじ1（水小さじ2で溶く）", fromFridge: false },
        { name: "ごま油", amount: "小さじ1/2", fromFridge: false },
        { name: "水", amount: "800ml", fromFridge: false },
      ],
      steps: [
        "① 鍋に水を沸かし、鶏がら・醤油・塩こしょうを入れる",
        "② 水溶き片栗粉を入れて軽くとろみをつける",
        "③ 溶き卵を菜箸に伝わせながらゆっくり回し入れる",
        "④ 卵がふわっと浮いたら火を止め、ごま油をたらす",
      ],
      point: "とろみをつけてから卵を入れるとふわふわに仕上がる",
    },
  },
  {
    name: "豚汁",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "豚こま切れ", amount: "100g", fromFridge: false },
        { name: "大根", amount: "5cm", fromFridge: false },
        { name: "にんじん", amount: "1/3本", fromFridge: false },
        { name: "ごぼう", amount: "1/3本", fromFridge: false },
        { name: "長ねぎ", amount: "1/2本", fromFridge: false },
        { name: "味噌", amount: "大さじ3", fromFridge: false },
        { name: "だしの素", amount: "小さじ2", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
        { name: "水", amount: "800ml", fromFridge: false },
      ],
      steps: [
        "① 大根・にんじんをいちょう切り、ごぼうを斜め薄切り（水にさらす）、ねぎを小口切り",
        "② 鍋にごま油を熱し、豚肉を炒める。色が変わったら野菜を加えて2分炒める",
        "③ 水・だしの素を入れ、沸騰したらアクを取り、中火で8分煮る",
        "④ 火を止めて味噌を溶き入れる。器に盛ってねぎを散らす",
      ],
      point: "味噌は沸騰させると風味が飛ぶので、必ず火を止めてから溶く",
    },
  },
  {
    name: "コーンスープ（インスタント）",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "コーンスープの素", amount: "4食分", fromFridge: false },
      ],
      steps: ["① お湯150mlを注いでよくかき混ぜる"],
      point: "クルトンを浮かべると食べ応えアップ",
    },
  },
  {
    name: "中華たまごスープ",
    recipe: {
      servings: "4人分",
      ingredients: [
        { name: "卵", amount: "1個", fromFridge: false },
        { name: "長ねぎ", amount: "1/4本", fromFridge: false },
        { name: "鶏がらスープの素", amount: "大さじ1", fromFridge: false },
        { name: "醤油", amount: "小さじ1", fromFridge: false },
        { name: "ごま油", amount: "小さじ1", fromFridge: false },
        { name: "塩こしょう", amount: "少々", fromFridge: false },
        { name: "水", amount: "800ml", fromFridge: false },
      ],
      steps: [
        "① 鍋に水を沸かし、鶏がら・醤油・塩こしょうを入れる",
        "② 溶き卵を流し入れ、ふわっと浮いたら火を止める",
        "③ ごま油をたらし、刻みねぎを散らす",
      ],
      point: "卵は沸騰した状態で一気に入れるとふわふわになる",
    },
  },
];

/**
 * 2つの曜日を入れ替える（主菜＋汁物を交換し、副菜の使い回しを再計算）
 */
export function swapDaysMock(
  currentPlan: GenerateResponse,
  dayIndexA: number,
  dayIndexB: number
): GenerateResponse {
  if (dayIndexA === dayIndexB) return currentPlan;

  const newMealPlan = [...currentPlan.mealPlan];
  const numDays = newMealPlan.length;
  const halfA = Math.ceil(numDays / 2);

  // 主菜・汁物・ラベル・freezeを入れ替え
  const tempMain = newMealPlan[dayIndexA].main;
  const tempSoup = newMealPlan[dayIndexA].soup;
  const tempLabel = newMealPlan[dayIndexA].label;
  const tempFreeze = newMealPlan[dayIndexA].freeze;

  newMealPlan[dayIndexA] = {
    ...newMealPlan[dayIndexA],
    main: newMealPlan[dayIndexB].main,
    soup: newMealPlan[dayIndexB].soup,
    label: newMealPlan[dayIndexB].label,
    freeze: newMealPlan[dayIndexB].freeze,
  };
  newMealPlan[dayIndexB] = {
    ...newMealPlan[dayIndexB],
    main: tempMain,
    soup: tempSoup,
    label: tempLabel,
    freeze: tempFreeze,
  };

  // 副菜の使い回しを再計算（前半=A、後半=B）
  // 現在の副菜AとBを特定
  const sideARecipe = newMealPlan[0]?.side.recipe;
  const sideBRecipe = newMealPlan[halfA]?.side.recipe;
  const sideAName = newMealPlan[0]?.side.name.replace(/^【.*?】/, "") || "";
  const sideBName = newMealPlan[halfA]?.side.name.replace(/^【.*?】/, "") || sideAName;

  for (let i = 0; i < numDays; i++) {
    const isFirstHalf = i < halfA;
    const isFirstDay = i === 0 || i === halfA;
    const groupLabel = isFirstHalf ? "A" : "B";
    const sideName = isFirstHalf ? sideAName : sideBName;
    const sideRecipe = isFirstHalf ? sideARecipe : sideBRecipe;

    newMealPlan[i] = {
      ...newMealPlan[i],
      side: {
        name: `【作り置き${groupLabel}${!isFirstDay ? (i === halfA - 1 || i === numDays - 1 ? " 最終日" : "") : ""}】${sideName}`,
        time: isFirstDay ? "10分" : "0分",
        memo: isFirstDay ? "まとめて作る。清潔な容器で冷蔵保存" : "保存分を出すだけ",
        bento: "小分け容器に詰める",
        shared: groupLabel,
        recipe: sideRecipe,
      },
    };
  }

  return { ...currentPlan, mealPlan: newMealPlan };
}

/**
 * 1日分だけ主菜を別のものに差し替える
 */
export function replaceOneDayMock(
  currentPlan: GenerateResponse,
  dayIndex: number
): GenerateResponse {
  const currentNames = new Set(currentPlan.mealPlan.map((d) => d.main.name));
  const candidates = shuffle(MAIN_POOL.filter((m) => !currentNames.has(m.name)));
  if (candidates.length === 0) return currentPlan; // 候補なし

  const newMain = candidates[0];
  const newMealPlan = currentPlan.mealPlan.map((day, idx) => {
    if (idx !== dayIndex) return day;
    return {
      ...day,
      label: newMain.label,
      main: {
        name: newMain.name,
        time: newMain.time,
        memo: newMain.memo,
        bento: newMain.bento,
        shared: null,
        recipe: newMain.recipe,
      },
      freeze: newMain.freeze || null,
    };
  });

  return { ...currentPlan, mealPlan: newMealPlan };
}

/** Fisher-Yates シャッフル */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 選択した日付＋履歴を考慮してモック献立を生成する
 */
export function buildMockResponse(
  selectedDates: string[],
  mealHistory: string[] = [],
  requestedFavorites: string[] = [],
  favoriteMeals: FavoriteMeal[] = [],
  fridgeItems: FridgeItem[] = []
): GenerateResponse {
  const numDays = selectedDates.length;
  const historySet = new Set(mealHistory);

  // 冷蔵庫の食材名リスト（部分一致用）
  const fridgeNames = fridgeItems.map((f) => f.name);

  // レシピが冷蔵庫の食材をいくつ使うかスコア計算
  function fridgeScore(recipe: Recipe): number {
    if (fridgeNames.length === 0) return 0;
    return recipe.ingredients.filter((ing) =>
      fridgeNames.some((fn) => ing.name.includes(fn) || fn.includes(ing.name))
    ).length;
  }

  // お気に入りから指定されたものをまず配置
  const favMenuItems: typeof MAIN_POOL = [];
  for (const favName of requestedFavorites) {
    const poolItem = MAIN_POOL.find((m) => m.name === favName);
    if (poolItem) {
      favMenuItems.push(poolItem);
    } else {
      const favMeal = favoriteMeals.find((f) => f.name === favName);
      if (favMeal) {
        favMenuItems.push({
          name: favMeal.menuItem.name,
          label: "❤️ お気に入り",
          time: favMeal.menuItem.time,
          memo: favMeal.menuItem.memo,
          bento: favMeal.menuItem.bento || "",
          recipe: favMeal.menuItem.recipe,
        });
      }
    }
  }

  // 残り枠を冷蔵庫スコア＋履歴を考慮して埋める
  const usedNames = new Set(favMenuItems.map((m) => m.name));
  const remaining = numDays - favMenuItems.length;
  const fresh = MAIN_POOL.filter((m) => !historySet.has(m.name) && !usedNames.has(m.name));

  // 冷蔵庫の食材がある場合はスコアが高い順にソート、同スコアならシャッフル
  const scored = shuffle(fresh).sort((a, b) => fridgeScore(b.recipe) - fridgeScore(a.recipe));
  const scoredAll = shuffle(MAIN_POOL.filter((m) => !usedNames.has(m.name))).sort((a, b) => fridgeScore(b.recipe) - fridgeScore(a.recipe));
  const fillers = [...scored, ...scoredAll]
    .filter((v, i, arr) => arr.findIndex((a) => a.name === v.name) === i)
    .slice(0, Math.max(0, remaining));

  const mainPick = [...favMenuItems, ...fillers].slice(0, numDays);

  // 副菜をランダムに2種選ぶ
  const shuffledSides = shuffle(SIDE_POOL);
  const sideA = shuffledSides[0];
  const sideB = shuffledSides[1] || shuffledSides[0];
  const halfA = Math.ceil(numDays / 2);

  // 汁物をシャッフル
  const shuffledSoups = shuffle(SOUP_POOL);

  // 食材に冷蔵庫フラグをつける
  function markFridge(recipe: Recipe): Recipe {
    if (fridgeNames.length === 0) return recipe;
    return {
      ...recipe,
      ingredients: recipe.ingredients.map((ing) => ({
        ...ing,
        fromFridge: fridgeNames.some((fn) => ing.name.includes(fn) || fn.includes(ing.name)),
      })),
    };
  }

  const mealPlan: DayPlan[] = mainPick.map((main, i) => {
    const dateLabel = formatDateLabel(selectedDates[i]);
    const isFirstHalf = i < halfA;
    const side = isFirstHalf ? sideA : sideB;
    const isFirstDay = i === 0 || i === halfA;

    const sideMenuItem: MenuItem = {
      name: `【作り置き${isFirstHalf ? "A" : "B"}${!isFirstDay ? (i === halfA - 1 || i === numDays - 1 ? " 最終日" : "") : ""}】${side.name}`,
      time: isFirstDay ? "10分" : "0分",
      memo: isFirstDay ? "まとめて作る。清潔な容器で冷蔵保存" : "保存分を出すだけ",
      bento: "小分け容器に詰める",
      shared: isFirstHalf ? "A" : "B",
      recipe: markFridge(side.recipe),
    };

    const soupIdx = i % shuffledSoups.length;

    return {
      day: dateLabel,
      label: main.label,
      main: {
        name: main.name,
        time: main.time,
        memo: main.memo,
        bento: main.bento,
        shared: null,
        recipe: markFridge(main.recipe),
      },
      side: sideMenuItem,
      soup: {
        name: shuffledSoups[soupIdx].name,
        time: shuffledSoups[soupIdx].recipe.steps.length <= 1 ? "1分" : "5分",
        memo: "",
        bento: null,
        shared: null,
        recipe: markFridge(shuffledSoups[soupIdx].recipe),
      },
      freeze: main.freeze || null,
    };
  });

  const budgetPerDay = 1000 + Math.floor(Math.random() * 300);
  const total = budgetPerDay * numDays;

  // 買い物リスト生成（簡易）
  const allIngredients = mealPlan.flatMap((d) => [
    ...d.main.recipe.ingredients,
    ...(mealPlan.indexOf(d) === 0 || mealPlan.indexOf(d) === halfA
      ? d.side.recipe.ingredients
      : []),
    ...d.soup.recipe.ingredients,
  ]);

  const grouped = new Map<string, { name: string; amount: string }>();
  allIngredients.forEach((ing) => {
    if (!grouped.has(ing.name)) {
      grouped.set(ing.name, { name: ing.name, amount: ing.amount });
    }
  });

  // カテゴリ分け
  const MEAT_KEYWORDS = ["豚", "牛", "ひき肉", "ベーコン", "ウインナー", "ソーセージ", "ハム", "肉"];
  const CHICKEN_KEYWORDS = ["鶏むね", "鶏もも", "鶏ひき", "鶏肉", "手羽", "ささみ"];
  const FISH_KEYWORDS = ["鮭", "サバ", "鯖", "魚", "ツナ", "エビ", "えび", "海老", "しらす", "たら", "ぶり", "アジ", "いか", "タコ"];
  const SEASONING_KEYWORDS = ["醤油", "味噌", "砂糖", "塩", "酢", "みりん", "酒", "油", "ごま油", "マヨネーズ", "ケチャップ", "ソース", "チューブ", "の素", "スープ", "コンソメ", "だし", "ルー", "カレー粉", "片栗粉", "小麦粉", "パン粉", "バター", "チーズ", "昆布", "めんつゆ", "ポン酢", "コチュジャン", "豆板醤", "味噌汁", "わかめスープ", "コーンスープ", "中華スープ"];

  function categorize(name: string): string {
    // 調味料を先に判定（「鶏がらスープの素」等が肉類に入るのを防ぐ）
    if (SEASONING_KEYWORDS.some((k) => name.includes(k))) return "🧂 調味料・乾物";
    if (CHICKEN_KEYWORDS.some((k) => name.includes(k))) return "🥩 肉類";
    if (MEAT_KEYWORDS.some((k) => name.includes(k))) return "🥩 肉類";
    if (FISH_KEYWORDS.some((k) => name.includes(k))) return "🐟 魚介類";
    return "🥬 野菜・その他";
  }

  // 冷蔵庫にあるかチェック
  function isInFridge(name: string): boolean {
    return fridgeNames.some((fn) => name.includes(fn) || fn.includes(name));
  }

  const toBuyMap = new Map<string, { name: string; qty: string; note: string; fromFridge: boolean }[]>();
  const alreadyHaveMap = new Map<string, { name: string; qty: string; note: string; fromFridge: boolean }[]>();
  const categoryOrder = ["🥩 肉類", "🐟 魚介類", "🥬 野菜・その他", "🧂 調味料・乾物"];

  Array.from(grouped.values()).forEach((ing) => {
    const cat = categorize(ing.name);
    const inFridge = isInFridge(ing.name);
    const targetMap = inFridge ? alreadyHaveMap : toBuyMap;
    if (!targetMap.has(cat)) targetMap.set(cat, []);
    targetMap.get(cat)!.push({ name: ing.name, qty: ing.amount, note: inFridge ? "冷蔵庫にあり" : "", fromFridge: inFridge });
  });

  const toBuyCategories = categoryOrder
    .filter((cat) => toBuyMap.has(cat))
    .map((cat) => ({ category: cat, items: toBuyMap.get(cat)! }));

  const alreadyHaveCategories = categoryOrder
    .filter((cat) => alreadyHaveMap.has(cat))
    .map((cat) => ({ category: cat, items: alreadyHaveMap.get(cat)! }));

  // freezePrep
  const freezePreps = mealPlan
    .filter((d) => d.freeze)
    .map((d) => ({
      name: d.freeze!,
      ingredients: d.main.recipe.ingredients.map((i) => `${i.name}${i.amount}`).join("、"),
      steps: ["① 材料をカット", "② ジップロックに入れて調味料を加える", "③ 空気を抜いて冷凍"],
      forDay: `${d.day}用`,
    }));

  return {
    mealPlan,
    shoppingList: {
      toBuy: toBuyCategories,
      alreadyHave: alreadyHaveCategories,
    },
    freezePrep: freezePreps,
    tips: [
      "💰 業スーの冷凍食品でコスト削減",
      "⏰ 作り置き副菜で平日の調理時間を短縮",
      "🍱 主菜は多めに作って弁当に取り分け",
    ],
    estimatedBudget: `約${total.toLocaleString()}円`,
  };
}
