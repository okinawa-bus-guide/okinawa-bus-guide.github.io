// のりものNAVI沖縄（バス4社の公式の案内）の時刻表から、案内に使う乗り場・系統の発車時刻・乗っている時間・運賃を取り込み、times.js に書く。
// 系統の中でも行き先（経由）の違う便があるので、便の種類（courseGroup）ごとに停留所の一覧を1回開き、降りる停留所を通る種類の便だけを入れる。
// 祝日は内閣府の「国民の祝日」CSVから。ダイヤが変わったら `node scripts/fetch-times.mjs` を流し直す。
import { writeFileSync } from 'node:fs';

const BASE = 'https://www.busnavi-okinawa.com/top/ViewTimeTable';
// 乗り場（のりものNAVIの停留所）。キーは data.js の `times` で使う
const BOARDS = {
  'bt-1': { sid: '99644599-2a2a-4a6b-a1cc-98eef29788b4', code: '05019101' },
  'bt-3': { sid: 'a7baf831-4cd4-46a6-afce-716382eab0f1', code: '05019103' },
  'bt-4': { sid: '0cfa9ac7-dc07-47e4-95d5-d2e8c1eaab5b', code: '05019104' },
  'bt-8': { sid: '77763cab-43e6-496f-bbe3-50ab11dbc1c4', code: '05019108' },
  'asahi-11': { sid: 'e6b942f3-9542-41e3-acad-22a2d44fbd13', code: '40700200' },
  'asahi-park': { sid: 'c13cb062-083e-4207-87de-348b5e63eff8', code: '40700000' },
  'kencho-kokusai': { sid: '5c43b142-a7b8-48ea-a4a9-f7be19a981f7', code: '05020000' },
  'kencho-bt': { sid: '5e590e2a-a3b1-4678-a32f-5e4848f811f1', code: '05020100' },
  'collective-north': { sid: 'bc2d9079-4fa6-46a9-a22c-cd427c62cbf6', code: '05030000' },
  'collective-bt': { sid: 'a89e77dc-0703-48ca-91c7-af5672ac9332', code: '05030100' },
  'makishi-north': { sid: '72ab3364-fea2-4d03-86fd-75e6e1f0238d', code: '05040000' },
  'makishi-bt': { sid: 'c2ea9190-290c-4d6a-9459-bebeecb34caf', code: '05040100' }
};
// 乗り場ごとに、系統と降りる停留所（のりものNAVIの名前の頭。「（」より前と一致させる）
const KUWAE = '桑江', ONNA = '恩納', KOEN = '首里城公園入口', MAE = '首里城前', YAMAKAWA = '山川';
const RYCOM = 'イオンモール沖縄ライカム', HIGA = '比嘉西原', KINEN = '記念公園前', AIRPORT = '国内線旅客ターミナル前';
const WANT = {
  'bt-1': { 7: [MAE] },
  'bt-3': { 28: [KUWAE], 29: [KUWAE] },
  'bt-4': { 23: [HIGA] },
  'bt-8': { 346: [KOEN], 97: [YAMAKAWA] },
  'asahi-11': { 120: [KUWAE, ONNA], 20: [KUWAE, ONNA], 152: [RYCOM], 117: [KINEN] },
  'asahi-park': { 120: [AIRPORT], 99: [AIRPORT], 125: [AIRPORT], 190: [AIRPORT] },
  'kencho-kokusai': { 7: [MAE], 346: [KOEN], 97: [YAMAKAWA], 120: [KUWAE, ONNA], 20: [KUWAE, ONNA], 28: [KUWAE], 29: [KUWAE], 23: [HIGA], 190: [HIGA] },
  'kencho-bt': { 120: [AIRPORT], 99: [AIRPORT], 125: [AIRPORT], 190: [AIRPORT] },
  'collective-north': { 346: [KOEN], 97: [YAMAKAWA], 120: [KUWAE, ONNA], 20: [KUWAE, ONNA], 28: [KUWAE], 23: [HIGA], 190: [HIGA] },
  'collective-bt': { 120: [AIRPORT], 125: [AIRPORT], 190: [AIRPORT] },
  'makishi-north': { 346: [KOEN], 97: [YAMAKAWA], 120: [KUWAE, ONNA], 20: [KUWAE, ONNA], 28: [KUWAE], 23: [HIGA], 190: [HIGA] },
  'makishi-bt': { 120: [AIRPORT], 125: [AIRPORT], 190: [AIRPORT] }
};
const DAY = { Heijitsu: 'wd', Saturday: 'sa', Holiday: 'ho' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  await sleep(300); // 公式のサイトに負担をかけない
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
}
// 便の停留所の一覧：[{ name, min（その日の0時からの分）, fare }]
async function stops(sid, cg, day, time, daiya) {
  const html = await get(`${BASE}/RouteDetail?selectLang=ja&stationSid=${sid}&courseGroupSid=${cg}&timeTableTypeCode=${day}&selectedTime=${time}&parentCompanyCode=9000&DaiyaSid=${daiya}`);
  const rows = [];
  for (const tr of html.split(/<tr[^>]*>/).slice(1)) {
    const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => m[1].replace(/<[^>]*>/g, '').replace(/&nbsp;|\s+/g, ' ').trim());
    if (cells.length < 4 || !/^\d{2}:\d{2}$/.test(cells[2])) continue;
    rows.push({ name: cells[1], min: +cells[2].slice(0, 2) * 60 + +cells[2].slice(3), fare: parseInt(cells[3].replace(/,/g, ''), 10) || 0 });
  }
  return rows;
}

async function board(key) {
  const b = BOARDS[key], want = WANT[key];
  const html = JSON.parse(await get(`${BASE}/TimeTableAll?selectLang=ja&parentCompanyCode=9000&stationSid=${b.sid}&busStopCode=${b.code}&goalStationCode=`));
  const out = {};
  for (const block of html.split('viewTimeTableByKeito(').slice(1)) {
    const m = block.match(/\[(\d+)\]/);
    if (!m || !want[m[1]]) continue;
    const links = [...block.matchAll(/ShowRouteDetail\('([^']*)','([^']*)','(\w+)','(\d\d:\d\d)','\d+','([^']*)'\);?"?[^>]*>([^<]*)<\/a>/g)];
    if (!links.length) continue;
    // 便の種類ごとに1便だけ停留所の一覧を開き、降りる停留所を通るか・乗っている時間・運賃を調べる
    const [, sid, cg, day, time, daiya] = links[0];
    const list = await stops(sid, cg, day, time, daiya);
    const from = list.findIndex(s => s.name.startsWith(BOARD_NAME(key, list)));
    const r = out[m[1]] || (out[m[1]] = { wd: [], sa: [], ho: [], to: {}, sign: [], co: [] });
    const cos = [...block.split('凡例')[0].matchAll(/icon_bus\.png" alt="" \/>\s*([^<\r\n]+?)\s*</g)].map(x => x[1]);
    const sign = ((block.match(/<br \/>（([^<]*?)\s*行き）/) || [])[1] || '').replace(/（終点）|（[^）]*向け）/g, '').trim();
    let passes = false;
    for (const name of want[m[1]]) {
      const i = list.findIndex((s, j) => j > from && s.name.split('（')[0] === name);
      if (i < 0) continue;
      passes = true;
      const ride = list[i].min - list[from].min;
      const prev = r.to[name];
      // 便の種類で時間が違うときは、長いほうを書く（短く見せない）
      if (!prev || ride > prev.min) r.to[name] = { min: ride, fare: list[i].fare };
    }
    if (!passes) continue;
    if (sign && !r.sign.includes(sign)) r.sign.push(sign);
    for (const c of cos) if (!r.co.includes(c)) r.co.push(c);
    for (const [, , , d, t, , text] of links) {
      const mark = text.replace(/\d/g, '').trim();
      // 日祝の欄の「日」は日曜だけ、「祝」は祝日だけの便。ほかの記号は経由の違い
      r[DAY[d]].push(mark === '日' || mark === '祝' ? t + mark : t);
    }
  }
  for (const n in want) {
    if (!out[n] || !out[n].wd.length) throw new Error(`${key}: 系統${n}の時刻が見つかりません`);
    for (const name of want[n]) if (!out[n].to[name]) console.warn(`注意 ${key}: 系統${n}は${name}を通る便がありません`);
    for (const d of ['wd', 'sa', 'ho']) out[n][d] = [...new Set(out[n][d])].sort();
  }
  return out;
}
// 停留所の一覧の中の、乗る停留所の行（一覧の最初とは限らない）
function BOARD_NAME(key, list) {
  const code = BOARDS[key].code;
  const n = { '0501': '那覇バスターミナル', '4070': '旭橋・那覇バスターミナル', '0502': '県庁北口', '0503': 'ホテルコレクティブ前', '0504': '牧志' }[code.slice(0, 4)];
  return n;
}

async function holidays() {
  const res = await fetch('https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv');
  const text = new TextDecoder('shift_jis').decode(await res.arrayBuffer());
  const year = new Date().getFullYear();
  return text.split(/\r?\n/).map(l => l.split(',')[0]).filter(d => /^\d{4}\//.test(d) && +d.slice(0, 4) >= year)
    .map(d => d.split('/').map((x, i) => i ? x.padStart(2, '0') : x).join('-'));
}

const times = {};
for (const key of Object.keys(BOARDS)) {
  times[key] = await board(key);
  console.log(key, Object.entries(times[key]).map(([n, r]) => `${n}[${r.sign.join('/')}|${r.co.join('/')}](${r.wd.length}/${r.sa.length}/${r.ho.length} ${Object.entries(r.to).map(([s, v]) => s + v.min + '分' + v.fare + '円').join(' ')})`).join(' '));
}
const hol = await holidays();
const today = new Date().toISOString().slice(0, 10);
writeFileSync(new URL('../times.js', import.meta.url),
  `// 自動生成（scripts/fetch-times.mjs）。手で直さない。\n` +
  `// 出典：のりものNAVI沖縄 https://www.busnavi-okinawa.com/ の時刻表、内閣府「国民の祝日」。取り込んだ日：${today}\n` +
  `// TIMES[乗り場][系統] = { wd/sa/ho: 発車時刻（平日・土曜・日祝。末尾の「日」「祝」は日曜だけ・祝日だけの便）, sign: 行き先（のりものNAVIの表記）, co: 運行するバス会社, to: { 降りる停留所: { min: 乗っている分, fare: 運賃 } } }\n` +
  `// BOARD_SID：のりものNAVIの停留所のID（接近情報 https://www.busnavi-okinawa.com/top/Approach?sid= に使う）\n` +
  `var BOARD_SID = ${JSON.stringify(Object.fromEntries(Object.entries(BOARDS).map(([k, v]) => [k, v.sid])))};\n` +
  `var TIMES_UPDATED = '${today}';\nvar HOLIDAYS = ${JSON.stringify(hol)};\nvar TIMES = ${JSON.stringify(times)};\n`);
