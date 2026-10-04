// データ：出発するバス停と行き先。経路は公式の時刻表・路線図で確かめたものだけを入れる（出典は CLAUDE.md の表）。
// 行き先の名前の「|」は、ボタンで改行してよい位置（ほかでは消える）。
// 文言は { ja, en, zh（簡体字）, tw（繁体字）, ko }。無い言語は英語、次に日本語で表示する。
// 停留所・乗り場の名前と各言語の表記は、のりものNAVI沖縄（https://www.busnavi-okinawa.com/）の表記に合わせる。
var STOPS = [
  { id: 'naha-bt', maps: '那覇バスターミナル',
    name: { ja: '那覇バスターミナル', en: 'Naha Bus Terminal', zh: '那霸巴士总站', tw: '那霸巴士總站', ko: '나하버스터미널' } },
  { id: 'kencho', maps: '県庁北口 バス停 那覇',
    name: { ja: '県庁北口', en: 'Kencho Kitaguchi', zh: '县厅北口', tw: '縣廳北口', ko: '켄초키타구치' } },
  { id: 'collective', maps: 'ホテルコレクティブ 那覇',
    name: { ja: 'ホテルコレクティブ前', en: 'Hotel Collective mae', zh: '嘉新酒店前', tw: '嘉新酒店前', ko: '호텔 콜렉티브 앞' } },
  { id: 'makishi', maps: '牧志 バス停 那覇',
    name: { ja: '牧志', en: 'Makishi', zh: '牧志', tw: '牧志', ko: '마키시' } }
];

var DESTS = [
  { id: 'airport', maps: '那覇空港',
    name: { ja: '那覇空港', en: 'Naha Airport', zh: '那霸机场', tw: '那霸機場', ko: '나하 공항' },
    sub: { ja: '那覇市', en: 'Naha', zh: '那霸市', tw: '那霸市', ko: '나하시' },
    routes: {} },
  { id: 'shuri', maps: '首里城公園',
    name: { ja: '首里城', en: 'Shuri Castle', zh: '首里城', tw: '首里城', ko: '슈리성' },
    sub: { ja: '那覇市', en: 'Naha', zh: '那霸市', tw: '那霸市', ko: '나하시' },
    routes: {} },
  { id: 'american-village', maps: '美浜アメリカンビレッジ',
    name: { ja: 'アメリカン|ビレッジ', en: 'American Village', zh: '美国村', tw: '美國村', ko: '아메리칸 빌리지' },
    sub: { ja: '北谷町', en: 'Chatan', zh: '北谷町', tw: '北谷町', ko: '차탄' },
    routes: {} },
  { id: 'rycom', maps: 'イオンモール沖縄ライカム',
    name: { ja: 'イオンモール|沖縄ライカム', en: 'AEON MALL Okinawa Rycom', zh: '永旺梦乐城|冲绳来客梦', tw: '永旺夢樂城|沖繩來客夢', ko: '이온몰 오키나와 라이카무' },
    sub: { ja: '北中城村', en: 'Kitanakagusuku', zh: '北中城村', tw: '北中城村', ko: '기타나카구스쿠' },
    routes: {} },
  { id: 'manzamo', maps: '万座毛',
    name: { ja: '万座毛', en: 'Cape Manzamo', zh: '万座毛', tw: '萬座毛', ko: '만자모' },
    sub: { ja: '恩納村', en: 'Onna', zh: '恩纳村', tw: '恩納村', ko: '온나' },
    routes: {} },
  { id: 'churaumi', maps: '沖縄美ら海水族館',
    name: { ja: '美ら海水族館', en: 'Churaumi Aquarium', zh: '美丽海水族馆', tw: '美麗海水族館', ko: '추라우미 수족관' },
    sub: { ja: '本部町', en: 'Motobu', zh: '本部町', tw: '本部町', ko: '모토부' },
    routes: {} }
];

// ---- 経路
// 出典：系統・乗り場・発車時刻・乗っている時間・運賃は、のりものNAVI沖縄の時刻表から times.js に自動で取り込む（scripts/fetch-times.mjs）。
// 降りてからの徒歩は各施設の公式（首里城公園・アメリカンビレッジ・美ら海水族館・イオンモール沖縄ライカム）。万座毛は公式に記載がなく、のりものNAVIの経路検索の値。
// 97番の山川で降りる案内は、現地で確認。山川（石嶺向け）から守礼門までの徒歩約11分はGoogleマップの徒歩の経路（2026-10-04）。ゆいレールは公式の運賃表・ダイヤ（2026-10-04 確認）。
// 経路の形：{ buses: [{ line, times（times.js の乗り場キー）, board, alight（名前。日本語は times.js の停留所名と同じ）, walk }], note, rail }
function at(name, dir) {
  var o = {};
  for (var k in name) o[k] = (k === 'en' || k === 'ko') ? name[k] + ' (' + dir[k] + ')' : name[k] + '（' + dir[k] + '）';
  return o;
}
function stopName(id) { for (var i = 0; i < STOPS.length; i++) if (STOPS[i].id === id) return STOPS[i].name; }
var DIR = {
  north: { ja: '安謝・古島向け', en: 'for Aja / Furujima', zh: '往安谢、古岛方向', tw: '往安謝、古島方向', ko: '아자·후루지마 방면' },
  kokusai: { ja: '国際通り・久茂地向け', en: 'for Kokusai-dori / Kumoji', zh: '往国际通、久茂地方向', tw: '往國際通、久茂地方向', ko: '국제거리·구모지 방면' },
  bt: { ja: '那覇バスターミナル・旭橋向け', en: 'for Naha Bus Terminal / Asahibashi', zh: '往那霸巴士总站、旭桥方向', tw: '往那霸巴士總站、旭橋方向', ko: '나하버스터미널·아사히바시 방면' },
  park: { ja: '公園前向け', en: 'for Koen-mae', zh: '往公园前方向', tw: '往公園前方向', ko: '고엔마에 방면' },
  shuriRail: { ja: '首里・てだこ浦西方面', en: 'toward Shuri / Tedako-Uranishi', zh: '往首里、Tedako浦西方向', tw: '往首里、Tedako浦西方向', ko: '슈리·테다코우라니시 방면' },
  airportRail: { ja: '那覇空港方面', en: 'toward Naha Airport', zh: '往那霸机场方向', tw: '往那霸機場方向', ko: '나하공항 방면' }
};
var BOARD = (function () {
  function bt(n) { return { ja: '那覇バスターミナル のりば' + n, en: 'Naha Bus Terminal, Platform ' + n, zh: '那霸巴士总站 ' + n + '号乘车处', tw: '那霸巴士總站 ' + n + '號乘車處', ko: '나하버스터미널 ' + n + '번 승차장' }; }
  var ASAHI = { ja: '旭橋・那覇バスターミナル', en: 'Asahibashi/Naha Bus Terminal', zh: '旭桥、那霸巴士总站', tw: '旭橋、那霸巴士總站', ko: '아사히바시・나하버스터미널' };
  return {
    'bt-1': bt(1), 'bt-3': bt(3), 'bt-4': bt(4), 'bt-8': bt(8),
    'asahi-11': { ja: ASAHI.ja + ' のりば11', en: ASAHI.en + ', Platform 11', zh: ASAHI.zh + ' 11号乘车处', tw: ASAHI.tw + ' 11號乘車處', ko: ASAHI.ko + ' 11번 승차장' },
    'asahi-park': at(ASAHI, DIR.park),
    'kencho-kokusai': at(stopName('kencho'), DIR.kokusai), 'kencho-bt': at(stopName('kencho'), DIR.bt),
    'collective-north': at(stopName('collective'), DIR.north), 'collective-bt': at(stopName('collective'), DIR.bt),
    'makishi-north': at(stopName('makishi'), DIR.north), 'makishi-bt': at(stopName('makishi'), DIR.bt)
  };
})();
// 降りる停留所と、そこからの歩き
var ALIGHT = {
  koen: { name: { ja: '首里城公園入口', en: 'Shurijo Koen Iriguchi', zh: '首里城公园入口', tw: '首里城公園入口', ko: '슈리조코엔이리구치' },
    walk: { ja: '首里城まで歩いて約5分', en: 'About 5 min walk to the castle', zh: '步行约5分钟到首里城', tw: '步行約5分鐘到首里城', ko: '성까지 걸어서 약 5분' } },
  mae: { name: { ja: '首里城前', en: 'Shurijo mae', zh: '首里城前', tw: '首里城前', ko: '슈리조마에' },
    walk: { ja: '首里城まで歩いて約1分', en: 'About 1 min walk to the castle', zh: '步行约1分钟到首里城', tw: '步行約1分鐘到首里城', ko: '성까지 걸어서 약 1분' } },
  yamakawa: { name: { ja: '山川', en: 'Yamakawa', zh: '山川', tw: '山川', ko: '야마카와' },
    walk: { ja: '首里城まで歩いて約11分', en: 'About 11 min walk to the castle', zh: '步行约11分钟到首里城', tw: '步行約11分鐘到首里城', ko: '성까지 걸어서 약 11분' } },
  kuwae: { name: { ja: '桑江', en: 'Kuwae', zh: '桑江', tw: '桑江', ko: '구와에' },
    walk: { ja: 'アメリカンビレッジまで歩いて約3分', en: 'About 3 min walk to American Village', zh: '步行约3分钟到美国村', tw: '步行約3分鐘到美國村', ko: '아메리칸 빌리지까지 걸어서 약 3분' } },
  onna: { name: { ja: '恩納', en: 'Onna', zh: '恩纳', tw: '恩納', ko: '온나' },
    walk: { ja: '万座毛まで歩いて約12分', en: 'About 12 min walk to Cape Manzamo', zh: '步行约12分钟到万座毛', tw: '步行約12分鐘到萬座毛', ko: '만자모까지 걸어서 약 12분' } },
  rycom: { name: { ja: 'イオンモール沖縄ライカム', en: 'Aeon Mall Okinawa Rycom', zh: '永旺梦乐城冲绳来客梦', tw: '永旺夢樂城沖繩來客夢', ko: '이온몰오키나와라이카무' },
    walk: { ja: 'モールに着きます', en: 'Stops at the mall', zh: '直达购物中心', tw: '直達購物中心', ko: '몰 앞에 도착합니다' } },
  higa: { name: { ja: '比嘉西原', en: 'Higairibaru', zh: '比嘉西原', tw: '比嘉西原', ko: '히가이리바루' },
    walk: { ja: 'モールまで歩いて約5分', en: 'About 5 min walk to the mall', zh: '步行约5分钟到购物中心', tw: '步行約5分鐘到購物中心', ko: '몰까지 걸어서 약 5분' } },
  kinen: { name: { ja: '記念公園前', en: 'Kinen Koen mae', zh: '纪念公园前', tw: '紀念公園前', ko: '기넨코엔마에' },
    walk: { ja: '水族館まで歩いて約10分', en: 'About 10 min walk to the aquarium', zh: '步行约10分钟到水族馆', tw: '步行約10分鐘到水族館', ko: '수족관까지 걸어서 약 10분' } },
  airport: { name: { ja: '国内線旅客ターミナル前', en: 'Domestic Terminal (Kokunaisen Ryokaku Terminal mae)', zh: '国内客运大楼前', tw: '國內線旅客航站大廈前', ko: '국내선 여객터미널 앞' },
    walk: { ja: '空港の国内線ターミナルの前に着きます', en: 'Stops in front of the domestic terminal', zh: '到达机场国内线航站楼前', tw: '到達機場國內線航站大廈前', ko: '공항 국내선 터미널 앞에 도착합니다' } }
};
function bus(line, key, alight) { return { line: String(line), times: key, board: BOARD[key], alight: ALIGHT[alight].name, walk: ALIGHT[alight].walk }; }
function buses(lines, key, alight) { return lines.map(function (n) { return bus(n, key, alight); }); }
var YEN = function (n) { return { ja: n + '円', en: '¥' + n, zh: n + '日元', tw: n + '日圓', ko: n + '엔' }; };
var MIN = function (n) { return { ja: '約' + n + '分', en: 'About ' + n + ' min', zh: '约' + n + '分钟', tw: '約' + n + '分鐘', ko: '약 ' + n + '분' }; };
// ゆいレールで行けない行き先は、県庁北口だけを案内する
var SUNDAY_BUS = { ja: '日曜（祝日を除く）の12〜18時は、国際通りにバスが来ません。県庁北口から乗りましょう。', en: 'On Sundays (except holidays) 12:00–18:00, no buses run on Kokusai-dori. Use the Kencho Kitaguchi stop.', zh: '周日（节假日除外）12:00–18:00，国际通没有巴士。请到县厅北口乘车。', tw: '週日（國定假日除外）12:00–18:00，國際通沒有公車。請到縣廳北口搭車。', ko: '일요일(공휴일 제외) 12:00~18:00에는 국제거리에 버스가 다니지 않습니다. 켄초키타구치 정류장에서 타세요.' };
var SUNDAY = { ja: '日曜（祝日を除く）の12〜18時は、国際通りにバスが来ません。県庁北口から乗るか、ゆいレールを使いましょう。', en: 'On Sundays (except holidays) 12:00–18:00, no buses run on Kokusai-dori. Use the Kencho Kitaguchi stop or the Yui Rail.', zh: '周日（节假日除外）12:00–18:00，国际通没有巴士。请到县厅北口乘车，或乘坐单轨电车（Yui Rail）。', tw: '週日（國定假日除外）12:00–18:00，國際通沒有公車。請到縣廳北口搭車，或搭乘單軌電車（Yui Rail）。', ko: '일요일(공휴일 제외) 12:00~18:00에는 국제거리에 버스가 다니지 않습니다. 켄초키타구치 정류장에서 타거나 유이레일을 이용하세요.' };
var FROM_ASAHI = { ja: '美ら海水族館へ行く117番の高速バスは、旭橋・那覇バスターミナルの「のりば11」から出ます（ゆいレール旭橋駅のすぐ近く）。', en: 'Express bus 117 to the aquarium leaves from Platform 11 at Asahibashi/Naha Bus Terminal (next to Asahibashi Station on the Yui Rail).', zh: '前往水族馆的117路高速巴士，从旭桥、那霸巴士总站的11号乘车处发车（单轨电车旭桥站旁）。', tw: '前往水族館的117路高速公車，從旭橋、那霸巴士總站的11號乘車處發車（單軌電車旭橋站旁）。', ko: '수족관행 117번 고속버스는 아사히바시・나하버스터미널 11번 승차장에서 출발합니다(유이레일 아사히바시역 바로 옆).' };
var RAIL_FREQ = { ja: '昼は8〜10分ごと', en: 'Every 8–10 min (daytime)', zh: '白天每8–10分钟一班', tw: '白天每8–10分鐘一班', ko: '낮에는 8~10분 간격' };
var STATION = {
  asahibashi: { ja: '旭橋駅', en: 'Asahibashi Station', zh: '旭桥站', tw: '旭橋站', ko: '아사히바시역' },
  kenchomae: { ja: '県庁前駅', en: 'Prefectural Office Station', zh: '县政府前站', tw: '縣政府前站', ko: '현청앞역' },
  miebashi: { ja: '美栄橋駅', en: 'Miebashi Station', zh: '美荣桥站', tw: '美榮橋站', ko: '미에바시역' },
  makishi: { ja: '牧志駅', en: 'Makishi Station', zh: '牧志站', tw: '牧志站', ko: '마키시역' },
  shuri: { ja: '首里駅', en: 'Shuri Station', zh: '首里站', tw: '首里站', ko: '슈리역' },
  airport: { ja: '那覇空港駅', en: 'Naha Airport Station', zh: '那霸机场站', tw: '那霸機場站', ko: '나하공항역' }
};
function rail(from, dir, to, walk, fare, min) { return { board: at(STATION[from], DIR[dir]), alight: STATION[to], walk: walk, fare: YEN(fare), ride: MIN(min) }; }
function dest(id) { for (var i = 0; i < DESTS.length; i++) if (DESTS[i].id === id) return DESTS[i]; }

// 首里城
(function () {
  var W = ALIGHT.koen.walk, S = { ja: '首里城まで歩いて約15分', en: 'About 15 min walk to the castle', zh: '步行约15分钟到首里城', tw: '步行約15分鐘到首里城', ko: '성까지 걸어서 약 15분' };
  dest('shuri').routes = {
    'naha-bt': { buses: [bus(346, 'bt-8', 'koen'), bus(97, 'bt-8', 'yamakawa'), bus(7, 'bt-1', 'mae')], rail: rail('asahibashi', 'shuriRail', 'shuri', S, 320, 16) },
    'kencho': { buses: [bus(346, 'kencho-kokusai', 'koen'), bus(97, 'kencho-kokusai', 'yamakawa'), bus(7, 'kencho-kokusai', 'mae')], rail: rail('kenchomae', 'shuriRail', 'shuri', S, 320, 14) },
    'collective': { buses: [bus(346, 'collective-north', 'koen'), bus(97, 'collective-north', 'yamakawa')], note: SUNDAY, rail: rail('miebashi', 'shuriRail', 'shuri', S, 320, 13) },
    'makishi': { buses: [bus(346, 'makishi-north', 'koen'), bus(97, 'makishi-north', 'yamakawa')], note: SUNDAY, rail: rail('makishi', 'shuriRail', 'shuri', S, 290, 11) }
  };
})();
// アメリカンビレッジ（桑江で降りる）
dest('american-village').routes = {
  'naha-bt': { buses: buses([120, 20], 'asahi-11', 'kuwae').concat(buses([28, 29], 'bt-3', 'kuwae')) },
  'kencho': { buses: buses([120, 28, 29, 20], 'kencho-kokusai', 'kuwae') },
  'collective': { buses: buses([120, 28, 20], 'collective-north', 'kuwae'), note: SUNDAY_BUS },
  'makishi': { buses: buses([120, 28, 20], 'makishi-north', 'kuwae'), note: SUNDAY_BUS }
};
// イオンモール沖縄ライカム
dest('rycom').routes = {
  'naha-bt': { buses: [bus(152, 'asahi-11', 'rycom'), bus(23, 'bt-4', 'higa')] },
  'kencho': { buses: buses([23, 190], 'kencho-kokusai', 'higa') },
  'collective': { buses: buses([190, 23], 'collective-north', 'higa'), note: SUNDAY_BUS },
  'makishi': { buses: buses([190, 23], 'makishi-north', 'higa'), note: SUNDAY_BUS }
};
// 万座毛（恩納で降りる）
dest('manzamo').routes = {
  'naha-bt': { buses: buses([120, 20], 'asahi-11', 'onna') },
  'kencho': { buses: buses([120, 20], 'kencho-kokusai', 'onna') },
  'collective': { buses: buses([120, 20], 'collective-north', 'onna'), note: SUNDAY_BUS },
  'makishi': { buses: buses([120, 20], 'makishi-north', 'onna'), note: SUNDAY_BUS }
};
// 美ら海水族館（117番の高速バス。旭橋・那覇バスターミナルのりば11だけから出る）
dest('churaumi').routes = {
  'naha-bt': { buses: [bus(117, 'asahi-11', 'kinen')] },
  'kencho': { buses: [bus(117, 'asahi-11', 'kinen')], note: FROM_ASAHI },
  'collective': { buses: [bus(117, 'asahi-11', 'kinen')], note: FROM_ASAHI },
  'makishi': { buses: [bus(117, 'asahi-11', 'kinen')], note: FROM_ASAHI }
};
// 那覇空港（那覇バスターミナル・旭橋向けの乗り場から）
(function () {
  var W = { ja: '空港の中にある駅です', en: 'The station is at the airport', zh: '车站就在机场内', tw: '車站就在機場內', ko: '공항 안에 있는 역입니다' };
  dest('airport').routes = {
    'naha-bt': { buses: buses([120, 99, 125, 190], 'asahi-park', 'airport'), rail: rail('asahibashi', 'airportRail', 'airport', W, 290, 11) },
    'kencho': { buses: buses([120, 99, 125, 190], 'kencho-bt', 'airport'), rail: rail('kenchomae', 'airportRail', 'airport', W, 290, 13) },
    'collective': { buses: buses([120, 125, 190], 'collective-bt', 'airport'), note: SUNDAY, rail: rail('miebashi', 'airportRail', 'airport', W, 320, 14) },
    'makishi': { buses: buses([120, 125, 190], 'makishi-bt', 'airport'), note: SUNDAY, rail: rail('makishi', 'airportRail', 'airport', W, 320, 16) }
  };
})();
