// 画面：言語・出発するバス停・行き先を選び、乗り方を大きく表示する。
// 状態はURL（?from=&to=&lang=）に持つ。QRコードは同じURLを入れるので、読み取った人のスマホに同じ案内が開く。
(function () {
  var LANGS = [
    { id: 'ja', label: '日本語', html: 'ja' },
    { id: 'en', label: 'English', html: 'en' },
    { id: 'zh', label: '简体中文', html: 'zh-Hans' },
    { id: 'tw', label: '繁體中文', html: 'zh-Hant' },
    { id: 'ko', label: '한국어', html: 'ko' }
  ];
  var UI = {
    contact: { ja: 'お問い合わせ：', en: 'Contact: ', zh: '联系方式：', tw: '聯絡方式：', ko: '문의: ' },
    title: { ja: '那覇から バスの乗り方', en: 'Getting around by bus from Naha', zh: '从那霸出发的巴士乘车指南', tw: '從那霸出發的公車搭乘指南', ko: '나하에서 버스 타는 법' },
    from: { ja: '出発するバス停', en: 'Starting from', zh: '出发车站', tw: '出發站牌', ko: '출발 정류장' },
    to: { ja: '行き先', en: 'Where to?', zh: '目的地', tw: '目的地', ko: '목적지' },
    fromShort: { ja: '出発', en: 'From', zh: '出发', tw: '出發', ko: '출발' },
    back: { ja: '← 行き先を選び直す', en: '← Choose another place', zh: '← 重新选择目的地', tw: '← 重新選擇目的地', ko: '← 목적지 다시 선택' },
    other: { ja: 'ほかの行き先には対応していません。Googleマップでお調べください。', en: 'Other destinations are not covered. Please search on Google Maps.', zh: '暂不支持其他目的地。请使用Google地图查询。', tw: '暫不支援其他目的地。請使用Google地圖查詢。', ko: '다른 목적지는 지원하지 않습니다. Google 지도에서 검색해 주세요.' },
    openMaps: { ja: 'Googleマップを開く', en: 'Open Google Maps', zh: '打开Google地图', tw: '開啟Google地圖', ko: 'Google 지도 열기' },
    take: { ja: '乗るもの', en: 'Take', zh: '乘坐', tw: '搭乘', ko: '타는 것' },
    board: { ja: '乗る場所', en: 'Where to get on', zh: '上车地点', tw: '上車地點', ko: '타는 곳' },
    alight: { ja: '降りる場所', en: 'Where to get off', zh: '下车地点', tw: '下車地點', ko: '내리는 곳' },
    steps: { ja: '行き方', en: 'Step by step', zh: '具体走法', tw: '具體走法', ko: '가는 방법' },
    fare: { ja: '運賃（大人）', en: 'Fare (adult)', zh: '票价（成人）', tw: '票價（成人）', ko: '요금(성인)' },
    time: { ja: '乗車時間', en: 'Ride time', zh: '乘车时间', tw: '乘車時間', ko: '승차 시간' },
    pay: { ja: '払い方', en: 'How to pay', zh: '付款方式', tw: '付款方式', ko: '결제 방법' },
    maps: { ja: 'Googleマップで経路と時刻を見る', en: 'See route and times on Google Maps', zh: '在Google地图查看路线和时刻', tw: '在Google地圖查看路線和時刻', ko: 'Google 지도에서 경로와 시간 보기' },
    qr: { ja: 'このQRコードを読み取ると、あなたのスマホで同じ案内が開きます。', en: 'Scan this QR code to open this guide on your phone.', zh: '扫描此二维码，即可在您的手机上打开本指南。', tw: '掃描此QR碼，即可在您的手機上開啟本指南。', ko: '이 QR 코드를 스캔하면 휴대폰에서 이 안내를 볼 수 있습니다.' },
    share: { ja: 'このQRコードを読み取ると、あなたのスマホでこのサービスを使えます。', en: 'Scan this QR code to use this service on your phone.', zh: '扫描此二维码，即可在您的手机上使用本服务。', tw: '掃描此QR碼，即可在您的手機上使用本服務。', ko: '이 QR 코드를 스캔하면 휴대폰에서 이 서비스를 이용할 수 있습니다.' },
    next: { ja: '次のバス', en: 'Next buses', zh: '下一班巴士', tw: '下一班公車', ko: '다음 버스' },
    inMin: { ja: 'あと{n}分', en: 'in {n} min', zh: '{n}分钟后', tw: '{n}分鐘後', ko: '{n}분 후' },
    late: { ja: '予定を{n}分過ぎ・まだ来ていなければ待ちましょう', en: '{n} min past schedule — wait if it has not come yet', zh: '已过预定时间{n}分钟・如果还没来请继续等', tw: '已過預定時間{n}分鐘・如果還沒來請繼續等', ko: '예정보다 {n}분 지남・아직 안 왔으면 기다리세요' },
    delay: { ja: '沖縄のバスは、時刻表より遅れることがあります。', en: 'Buses in Okinawa can run late.', zh: '冲绳的巴士有时会比时刻表晚。', tw: '沖繩的公車有時會比時刻表晚。', ko: '오키나와 버스는 시간표보다 늦을 수 있습니다.' },
    soon: { ja: 'まもなく', en: 'leaving now', zh: '即将发车', tw: '即將發車', ko: '곧 출발' },
    inHour: { ja: 'あと{h}時間{n}分', en: 'in {h} h {n} min', zh: '{h}小时{n}分钟后', tw: '{h}小時{n}分鐘後', ko: '{h}시간 {n}분 후' },
    noMore: { ja: '今日のバスは終わりました。', en: 'No more buses today.', zh: '今天的巴士已经结束。', tw: '今天的公車已經結束。', ko: '오늘 버스는 끝났습니다.' },
    tomorrow: { ja: '明日の最初のバス：', en: 'First bus tomorrow: ', zh: '明天首班车：', tw: '明天首班車：', ko: '내일 첫차: ' },
    rail: { ja: 'ゆいレール（モノレール）でも行けます', en: 'You can also take the Yui Rail (monorail)', zh: '也可以乘坐单轨电车（Yui Rail）', tw: '也可以搭乘單軌電車（Yui Rail）', ko: '유이레일(모노레일)로도 갈 수 있습니다' },
    src: { ja: '時刻：のりものNAVI沖縄（{d}時点）', en: 'Times: Norimono NAVI Okinawa (as of {d})', zh: '时刻：Norimono NAVI冲绳（{d}）', tw: '時刻：Norimono NAVI沖繩（{d}）', ko: '시각: 노리모노 NAVI 오키나와 ({d} 기준)' },
    bound: { ja: '{s} 行き', en: 'to {s}', zh: '开往 {s}', tw: '開往 {s}', ko: '{s} 행' },
    how: { ja: '乗り方', en: 'How to ride', zh: '乘车方法', tw: '搭乘方法', ko: '타는 방법' },
    share: { ja: 'このサービスを共有', en: 'Share this service', zh: '分享本服务', tw: '分享本服務', ko: '이 서비스 공유하기' },
    pending: { ja: 'この組み合わせの案内は準備中です。Googleマップで調べてください。', en: 'This guide is not ready yet. Please search on Google Maps.', zh: '此路线的指南正在准备中。请用Google地图查询。', tw: '此路線的指南正在準備中。請用Google地圖查詢。', ko: '이 경로의 안내는 준비 중입니다. Google 지도에서 검색해 주세요.' }
  };

  var state = { lang: 'ja', from: null, to: null, opt: 0 };
  var $app = document.getElementById('app');
  var $langs = document.getElementById('langs');

  function raw(o) { if (o == null) return ''; if (typeof o === 'string') return o; return o[state.lang] || o.en || o.ja || ''; }
  // 名前の「|」は、行き先のボタンで改行してよい位置。ほかの場所では消す
  function t(o) { return raw(o).replace(/\|/g, ''); }
  function btnName(o) { return esc(raw(o)).replace(/\|/g, '<wbr>'); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function readUrl() {
    var p = new URLSearchParams(location.search);
    var lang = p.get('lang') || load('obg-lang');
    if (!lang) {
      var nav = (navigator.language || 'ja').toLowerCase();
      lang = nav.indexOf('ja') === 0 ? 'ja' : nav.indexOf('ko') === 0 ? 'ko'
        : /^zh-(tw|hk|mo|hant)/.test(nav) ? 'tw' : nav.indexOf('zh') === 0 ? 'zh' : 'en';
    }
    state.lang = find(LANGS, lang) ? lang : 'ja';
    var from = p.get('from') || load('obg-from');
    state.from = find(STOPS, from) ? from : STOPS[0].id;
    var to = p.get('to');
    state.to = find(DESTS, to) ? to : null;
    state.opt = 0;
  }

  function url(abs) {
    var p = new URLSearchParams();
    p.set('lang', state.lang); p.set('from', state.from);
    if (state.to) p.set('to', state.to);
    var path = location.pathname + '?' + p.toString();
    return abs ? location.origin + path : path;
  }
  function push(replace) { history[replace ? 'replaceState' : 'pushState'](null, '', url(false)); }

  function mapsUrl(dest) {
    var stop = find(STOPS, state.from);
    var hl = { ja: 'ja', en: 'en', zh: 'zh-CN', tw: 'zh-TW', ko: 'ko' }[state.lang];
    var q = 'api=1&travelmode=transit&hl=' + hl + '&origin=' + encodeURIComponent(stop.maps);
    if (dest) q += '&destination=' + encodeURIComponent(dest.maps);
    return 'https://www.google.com/maps/dir/?' + q;
  }

  function topUrl() { return location.pathname + '?lang=' + state.lang + '&from=' + state.from; }
  // SNSで広めるためのボタン（サービスのトップを、選んでいる言語で共有する）
  var ICON = {
    share: '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>',
    x: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
    facebook: '<path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>'
  };
  function shareHtml() {
    var u = encodeURIComponent(location.origin + location.pathname + '?lang=' + state.lang);
    var tx = encodeURIComponent(t(UI.title));
    var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>'; };
    return '<div class="share"><span>' + esc(t(UI.share)) + '</span><div>' +
      (navigator.share ? '<button type="button" data-share aria-label="' + esc(t(UI.share)) + '">' + svg('share') + '</button>' : '') +
      '<a href="https://twitter.com/intent/tweet?url=' + u + '&text=' + tx + '" target="_blank" rel="noopener" aria-label="X">' + svg('x') + '</a>' +
      '<a href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener" aria-label="Facebook">' + svg('facebook') + '</a>' +
      '<a class="line" href="https://social-plugins.line.me/lineit/share?url=' + u + '" target="_blank" rel="noopener" aria-label="LINE">LINE</a>' +
      '</div></div>';
  }
  function renderLangs() {
    $langs.innerHTML = LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l.id + '" lang="' + l.html + '" aria-pressed="' + (l.id === state.lang) + '">' + l.label + '</button>';
    }).join('');
    document.documentElement.lang = find(LANGS, state.lang).html;
  }

  function renderSelect() {
    var stops = STOPS.map(function (s) {
      return '<button type="button" data-from="' + s.id + '" aria-pressed="' + (s.id === state.from) + '">' + esc(t(s.name)) + '</button>';
    }).join('');
    var dests = DESTS.map(function (d) {
      return '<button type="button" data-to="' + d.id + '"' + '>' + btnName(d.name) + (d.sub ? '<small>' + esc(t(d.sub)) + '</small>' : '') + '</button>';
    }).join('');
    $app.innerHTML =
      '<h1>' + esc(t(UI.title)) + '</h1>' +
      '<section><p class="label">' + esc(t(UI.from)) + '</p><div class="stops">' + stops + '</div></section>' +
      '<section><p class="label">' + esc(t(UI.to)) + '</p><div class="dests">' + dests +
      '<p class="other">' + esc(t(UI.other)).replace(/([。.]) ?(?=\S)/, '$1<br>') + '<br><a href="' + esc(mapsUrl(null)) + '" target="_blank" rel="noopener">' + esc(t(UI.openMaps)) + '</a></p>' +
      '</div></section>' +
      '<section class="card qr"><div id="qr"></div><p>' + esc(t(UI.share)) + '</p></section>';
    drawQr();
  }

  // 沖縄の今の日付・曜日・時刻（旅行者のスマホが別の時間帯でも、日本時間で数える）
  function nowJst() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { date: p.year + '-' + p.month + '-' + p.day, wday: p.weekday, min: +p.hour * 60 + +p.minute };
  }
  // 今日の発車時刻（「日」は日曜だけ・「祝」は祝日だけの便）
  function todayTimes(key, line, now) {
    var r = window.TIMES && TIMES[key] && TIMES[key][line];
    if (!r) return [];
    var hol = (window.HOLIDAYS || []).indexOf(now.date) >= 0, sun = now.wday === 'Sun';
    var list = hol || sun ? r.ho : now.wday === 'Sat' ? r.sa : r.wd;
    return list.filter(function (x) {
      var mark = x.slice(5);
      return !mark || (mark === '日' && sun) || (mark === '祝' && hol);
    }).map(function (x) { return +x.slice(0, 2) * 60 + +x.slice(3, 5); });
  }
  function wait(d) { return d === 0 ? t(UI.soon) : d < 60 ? t(UI.inMin).replace('{n}', d) : t(UI.inHour).replace('{h}', d / 60 | 0).replace('{n}', d % 60); }
  // 那覇バスの系統番号20未満（10・12を除く）は運賃前払い（那覇バス・琉球バス交通の「路線バスの乗り方」）
  function payBefore(line) { var n = +line; return n < 20 && n !== 10 && n !== 12; }
  var STEPS = {
    after: [
      { ja: 'バスの前に出ている番号をたしかめて乗ります。', en: 'Check the number on the front of the bus and get on.', zh: '确认车头显示的号码后上车。', tw: '確認車頭顯示的號碼後上車。', ko: '버스 앞에 표시된 번호를 확인하고 탑니다.' },
      { ja: '乗ったら整理券を取ります（OKICAならタッチ）。', en: 'Take a numbered ticket when you get on (or tap your OKICA card).', zh: '上车后取整理券（使用OKICA则刷卡）。', tw: '上車後取整理券（使用OKICA則刷卡）。', ko: '타면 정리권을 뽑습니다(OKICA는 터치).' },
      { ja: '降りる停留所が近づいたら、降車ボタンを押します。', en: 'Press the stop button before your stop.', zh: '快到下车站时，按下车铃。', tw: '快到下車站時，按下車鈴。', ko: '내릴 정류장이 가까워지면 하차 버튼을 누릅니다.' },
      { ja: '運賃を整理券と一緒に運賃箱に入れて降ります。お釣りは出ないので、先に車内で両替します。', en: 'Put the fare and the ticket into the fare box, then get off. No change is given, so change money on the bus first.', zh: '将车费和整理券一起投入收费箱后下车。不找零，请先在车内兑换零钱。', tw: '將車資和整理券一起投入收費箱後下車。不找零，請先在車內兌換零錢。', ko: '요금을 정리권과 함께 요금함에 넣고 내립니다. 거스름돈이 없으니 먼저 차내에서 환전하세요.' }
    ],
    before: [
      { ja: 'バスの前に出ている番号をたしかめて乗ります。', en: 'Check the number on the front of the bus and get on.', zh: '确认车头显示的号码后上车。', tw: '確認車頭顯示的號碼後上車。', ko: '버스 앞에 표시된 번호를 확인하고 탑니다.' },
      { ja: '乗るときに運賃を払います（現金・OKICA）。お釣りは出ないので、車内で両替します。', en: 'Pay the fare when you get on (cash or OKICA). No change is given; use the changer on the bus.', zh: '上车时付车费（现金或OKICA）。不找零，请在车内兑换零钱。', tw: '上車時付車資（現金或OKICA）。不找零，請在車內兌換零錢。', ko: '탈 때 요금을 냅니다(현금·OKICA). 거스름돈이 없으니 차내에서 환전하세요.' },
      { ja: '降りる停留所が近づいたら、降車ボタンを押します。', en: 'Press the stop button before your stop.', zh: '快到下车站时，按下车铃。', tw: '快到下車站時，按下車鈴。', ko: '내릴 정류장이 가까워지면 하차 버튼을 누릅니다.' },
      { ja: 'バスが止まったら、そのまま降ります。', en: 'Get off when the bus stops.', zh: '巴士停稳后下车。', tw: '公車停穩後下車。', ko: '버스가 서면 그대로 내립니다.' }
    ]
  };
  var RAIL_PAY = { ja: '切符か、Suicaなどの交通系ICカード', en: 'Ticket, or Suica / other transit IC cards', zh: '车票或Suica等交通IC卡', tw: '車票或Suica等交通IC卡', ko: '표 또는 Suica 등 교통카드' };
  // バスの前に出る行き先（のりものNAVIの表記。97番は「琉球大学」と出る：現地で確認）
  var SIGN_FIX = { '琉大北口駐車場下り着': '琉球大学' };
  function sign(b) {
    var x = TIMES[b.times][b.line].sign.map(function (v) { return SIGN_FIX[v] || v; });
    return x.length ? t(UI.bound).replace('{s}', x.join('・')) : '';
  }
  var CO = {
    '那覇バス': { en: 'Naha Bus', zh: '那霸巴士', tw: '那霸巴士', ko: '나하버스' },
    '琉球バス交通': { en: 'Ryukyu Bus', zh: '琉球巴士交通', tw: '琉球巴士交通', ko: '류큐버스교통' },
    '沖縄バス': { en: 'Okinawa Bus', zh: '冲绳巴士', tw: '沖繩巴士', ko: '오키나와버스' },
    '東陽バス': { en: 'Toyo Bus', zh: '东阳巴士', tw: '東陽巴士', ko: '도요버스' }
  };
  // バス会社（日本語以外は、車体の日本語の表記も添える）
  function company(b) {
    return TIMES[b.times][b.line].co.map(function (c) {
      return state.lang === 'ja' || !CO[c] ? c : CO[c][state.lang] + '（' + c + '）';
    }).join('・');
  }
  function hhmm(m) { return (m / 60 | 0) + ':' + ('0' + m % 60).slice(-2); }

  function renderRoute() {
    var dest = find(DESTS, state.to);
    var stop = find(STOPS, state.from);
    var r = dest.routes && dest.routes[state.from];
    var h = '<button type="button" class="back" data-back>' + esc(t(UI.back)) + '</button>' +
      '<div class="route-head"><span class="from">' + esc(t(UI.fromShort)) + '：' + esc(t(stop.name)) + '</span><h1>' + esc(t(dest.name)) + '</h1></div>';
    if (!r) {
      h += '<div class="pending">' + esc(t(UI.pending)) + '</div>';
      h += '<section class="card qr"><div id="qr"></div><p>' + esc(t(UI.qr)) + '</p></section>';
      h += '<a class="maps" href="' + esc(mapsUrl(dest)) + '" target="_blank" rel="noopener">' + esc(t(UI.maps)) + '</a>';
      $app.innerHTML = h; drawQr(); return;
    }
    var buses = r.buses || [];
    var oneBoard = buses.every(function (b) { return t(b.board) === t(buses[0].board); });
    var ownStop = buses.every(function (b) { return b.times.indexOf(state.from + '-') === 0; });
    if (r.note) h += '<div class="alert">' + esc(t(r.note)) + '</div>';

    // 次のバス（全系統をまとめて、発車の早い順に3本）
    var now = nowJst(), next = [];
    buses.forEach(function (b) {
      todayTimes(b.times, b.line, now).forEach(function (m) { if (m >= now.min - 10) next.push({ m: m, b: b }); });
    });
    next.sort(function (x, y) { return x.m - y.m; });
    h += '<section class="card next"><h2>' + esc(t(UI.next)) + '</h2>';
    if (!next.length) {
      // 明日の最初の便
      var d = new Date(now.date + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1);
      var tm = { date: d.toISOString().slice(0, 10), wday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()], min: 0 }, first = null;
      buses.forEach(function (b) { todayTimes(b.times, b.line, tm).forEach(function (m) { if (!first || m < first.m) first = { m: m, b: b }; }); });
      h += '<p class="none">' + esc(t(UI.noMore)) + '</p>';
      if (first) h += '<p class="tmr">' + esc(t(UI.tomorrow)) + '<span class="num">' + hhmm(first.m) + '</span> <span class="badge num">' + esc(first.b.line) + '</span></p>';
    }
    else h += '<ol>' + next.slice(0, 3).map(function (x) {
      return '<li><span class="t num">' + hhmm(x.m) + '</span><span class="badge num">' + esc(x.b.line) + '</span>' +
        '<span class="in' + (x.m < now.min ? ' late' : '') + '">' + esc(x.m < now.min ? t(UI.late).replace('{n}', now.min - x.m) : wait(x.m - now.min)) + '</span>' +
        '<span class="at">' + esc(company(x.b)) + '　<span class="nw">' + esc(sign(x.b)) + '</span></span>' +
        (oneBoard || ownStop ? '' : '<span class="at">' + esc(t(x.b.board)) + '</span>') + '</li>';
    }).join('') + '</ol>';
    h += '<p class="delay">' + esc(t(UI.delay)) + '</p></section>';

    // 乗る場所・降りる場所
    h += '<div class="big">';
    if (oneBoard && !ownStop) h += '<div class="row"><div class="k">' + esc(t(UI.board)) + '</div><div class="v">' + esc(t(buses[0].board)) + '</div></div>';
    var alights = [];
    buses.forEach(function (b) {
      var a = alights.filter(function (x) { return x.name === b.alight; })[0];
      if (a) a.lines.push(b.line); else alights.push({ name: b.alight, walk: b.walk, lines: [b.line] });
    });
    h += '<div class="row"><div class="k">' + esc(t(UI.alight)) + '</div>' + alights.map(function (a) {
      return '<div class="alight"><div class="v">' + (alights.length > 1 ? a.lines.map(function (n) { return '<span class="badge num">' + esc(n) + '</span>'; }).join('') : '') + esc(t(a.name)) + '</div><div class="s">' + esc(t(a.walk)) + '</div></div>';
    }).join('') + '</div>';
    h += '</div>';

    // 乗り方（運賃を乗るときに払うバスと、降りるときに払うバスで手順が違う）
    var kinds = { before: [], after: [] };
    buses.forEach(function (b) { var k = payBefore(b.line) ? 'before' : 'after'; if (kinds[k].indexOf(b.line) < 0) kinds[k].push(b.line); });
    h += '<section class="card"><h2>' + esc(t(UI.how)) + '</h2>';
    ['after', 'before'].forEach(function (k) {
      if (!kinds[k].length) return;
      if (kinds.before.length && kinds.after.length) h += '<p class="howfor">' + kinds[k].map(function (n) { return '<span class="badge num">' + esc(n) + '</span>'; }).join('') + '</p>';
      h += '<ol class="steps">' + STEPS[k].map(function (x) { return '<li>' + esc(t(x)) + '</li>'; }).join('') + '</ol>';
    });
    h += '</section>';

    // 運賃・乗っている時間（のりものNAVIの1便から）
    var info = buses.map(function (b) { return { line: b.line, to: TIMES[b.times][b.line].to[b.alight.ja] }; });
    var fares = info.map(function (x) { return x.to.fare; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    h += '<dl class="card facts"><dt>' + esc(t(UI.fare)) + '</dt><dd>' + (fares.length === 1 ? esc(t(YEN(fares[0]))) : info.map(function (x) { return esc(x.line) + '：' + esc(t(YEN(x.to.fare))); }).join('<br>')) + '</dd>' +
      '<dt>' + esc(t(UI.time)) + '</dt><dd>' + info.map(function (x) { return (info.length > 1 ? esc(x.line) + '：' : '') + esc(t(MIN(x.to.min))); }).join('<br>') + '</dd></dl>';

    // ゆいレール（バス停にいる人への案内なので、バスのあとに出す）
    if (r.rail) {
      var rl = r.rail;
      h += '<section class="card rail"><h2>' + esc(t(UI.rail)) + '</h2><dl class="facts">' +
        '<dt>' + esc(t(UI.board)) + '</dt><dd>' + esc(t(rl.board)) + '</dd>' +
        '<dt>' + esc(t(UI.alight)) + '</dt><dd>' + esc(t(rl.alight)) + '（' + esc(t(rl.walk)) + '）</dd>' +
        '<dt>' + esc(t(UI.fare)) + '</dt><dd>' + esc(t(rl.fare)) + '・' + esc(t(rl.ride)) + '・' + esc(t(RAIL_FREQ)) + '</dd>' +
        '<dt>' + esc(t(UI.pay)) + '</dt><dd>' + esc(t(RAIL_PAY)) + '</dd></dl></section>';
    }
    h += '<section class="card qr"><div id="qr"></div><p>' + esc(t(UI.qr)) + '</p></section>';
    if (window.TIMES_UPDATED) h += '<p class="src">' + esc(t(UI.src).replace('{d}', TIMES_UPDATED)) + '</p>';
    $app.innerHTML = h;
    drawQr();
  }
  // 案内の画面は、次のバスの「あと〇分」を進めるため30秒ごとに描き直す
  setInterval(function () { if (state.to && !document.hidden) render(); }, 30000);

  function drawQr() {
    var box = document.getElementById('qr');
    if (!box || typeof qrcode !== 'function') return;
    var q = qrcode(0, 'M');
    q.addData(url(true));
    q.make();
    box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  }

  function render() {
    renderLangs();
    if (state.to) renderRoute(); else renderSelect();
    // サイトの名前（どの画面からもトップへ）
    if (state.to) $app.insertAdjacentHTML('afterbegin', '<a class="home" href="' + esc(topUrl()) + '">' + esc(t(UI.title)) + '</a>');
    $app.insertAdjacentHTML('beforeend', '<footer class="foot">' + shareHtml() + esc(t(UI.contact)) + '<a href="mailto:info@lunaety.com">info@lunaety.com</a><br>© 2026 Lunaety</footer>');
  }

  $langs.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang]'); if (!b) return;
    state.lang = b.getAttribute('data-lang'); store('obg-lang', state.lang);
    push(true); render();
  });
  $app.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-share')) { navigator.share({ title: t(UI.title), url: location.origin + location.pathname + '?lang=' + state.lang }).catch(function () {}); return; }
    if (b.hasAttribute('data-from')) { state.from = b.getAttribute('data-from'); store('obg-from', state.from); push(true); render(); }
    else if (b.hasAttribute('data-to')) { state.to = b.getAttribute('data-to'); state.opt = 0; push(false); render(); window.scrollTo(0, 0); }
    else if (b.hasAttribute('data-opt')) { state.opt = +b.getAttribute('data-opt'); render(); }
    else if (b.hasAttribute('data-back')) { state.to = null; push(false); render(); }
  });
  window.addEventListener('popstate', function () { readUrl(); render(); });

  readUrl();
  push(true);
  render();
})();
