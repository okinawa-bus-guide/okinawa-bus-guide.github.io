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
    shareSvc: { ja: 'このサービスを共有する', en: 'Share this service', zh: '分享本服务', tw: '分享本服務', ko: '이 서비스 공유하기' },
    copy: { ja: 'リンクをコピー', en: 'Copy link', zh: '复制链接', tw: '複製連結', ko: '링크 복사' },
    copied: { ja: 'リンクをコピーしました。', en: 'Link copied.', zh: '链接已复制。', tw: '連結已複製。', ko: '링크를 복사했습니다.' },
    copiedWechat: { ja: 'リンクをコピーしました。WeChatに貼り付けて送ってください。', en: 'Link copied. Paste it in WeChat to send.', zh: '链接已复制，请粘贴到微信发送。', tw: '連結已複製，請貼到微信傳送。', ko: '링크를 복사했습니다. 위챗에 붙여넣어 보내세요.' },
    copiedKakao: { ja: 'リンクをコピーしました。KakaoTalkに貼り付けて送ってください。', en: 'Link copied. Paste it in KakaoTalk to send.', zh: '链接已复制，请粘贴到KakaoTalk发送。', tw: '連結已複製，請貼到KakaoTalk傳送。', ko: '링크를 복사했습니다. 카카오톡에 붙여넣어 보내세요.' },
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
    if (p.get('lang')) store('obg-lang', state.lang);
    var from = p.get('from');
    state.from = find(STOPS, from) ? from : null;
    var to = p.get('to');
    state.to = state.from && find(DESTS, to) ? to : null;
    state.opt = 0;
  }

  function url(abs) {
    var path = location.pathname;
    if (state.to) {
      var p = new URLSearchParams();
      p.set('lang', state.lang); p.set('from', state.from); p.set('to', state.to);
      path += '?' + p.toString();
    }
    return abs ? location.origin + path : path;
  }
  function push(replace) { history[replace ? 'replaceState' : 'pushState'](null, '', url(false)); }

  function mapsUrl(dest) {
    var stop = state.from ? find(STOPS, state.from) : null;
    var hl = { ja: 'ja', en: 'en', zh: 'zh-CN', tw: 'zh-TW', ko: 'ko' }[state.lang];
    var q = 'api=1&travelmode=transit&hl=' + hl + (stop ? '&origin=' + encodeURIComponent(stop.maps) : '');
    if (dest) q += '&destination=' + encodeURIComponent(dest.maps);
    return 'https://www.google.com/maps/dir/?' + q;
  }

  function topUrl() { return location.pathname; }
  // SNSで広めるためのボタン（サービスのトップを、選んでいる言語で共有する）。アイコンは simple-icons（CC0）。
  // 言語ごとに、その国・地域でよく使われるSNSを並べる。いちばんよく使われるメッセージのアプリを左端に置く。WeChatとKakaoTalkは共有用のURLが無いので、
  // WeChatとKakaoTalkは、リンクをコピーして貼ってもらう（KakaoTalkの共有の仕組みはアプリの登録が要る）。
  var ICON = {"kakaotalk": "<path d=\"M22.125 0H1.875C.8394 0 0 .8394 0 1.875v20.25C0 23.1606.8394 24 1.875 24h20.25C23.1606 24 24 23.1606 24 22.125V1.875C24 .8394 23.1606 0 22.125 0zM12 18.75c-.591 0-1.1697-.0413-1.7317-.1209-.5626.3965-3.813 2.6797-4.1198 2.7225 0 0-.1258.0489-.2328-.0141s-.0876-.2282-.0876-.2282c.0322-.2198.8426-3.0183.992-3.5333-2.7452-1.36-4.5701-3.7686-4.5701-6.5135C2.25 6.8168 6.6152 3.375 12 3.375s9.75 3.4418 9.75 7.6875c0 4.2457-4.3652 7.6875-9.75 7.6875zM8.0496 9.8672h-.8777v3.3417c0 .2963-.2523.5372-.5625.5372s-.5625-.2409-.5625-.5372V9.8672h-.8777c-.3044 0-.552-.2471-.552-.5508s.2477-.5508.552-.5508h2.8804c.3044 0 .552.2471.552.5508s-.2477.5508-.552.5508zm10.9879 2.9566a.558.558 0 0 1 .108.4167.5588.5588 0 0 1-.2183.371.5572.5572 0 0 1-.3383.1135.558.558 0 0 1-.4493-.2236l-1.3192-1.7479-.1952.1952v1.2273a.5635.5635 0 0 1-.5627.5628.563.563 0 0 1-.5625-.5625V9.3281c0-.3102.2523-.5625.5625-.5625s.5625.2523.5625.5625v1.209l1.5694-1.5694c.0807-.0807.1916-.1252.312-.1252.1404 0 .2814.0606.3871.1661.0985.0984.1573.2251.1654.3566.0082.1327-.036.2542-.1241.3425l-1.2818 1.2817 1.3845 1.8344zm-8.3502-3.5023c-.095-.2699-.3829-.5475-.7503-.5557-.3663.0083-.6542.2858-.749.5551l-1.3455 3.5415c-.1708.5305-.0217.7272.1333.7988a.8568.8568 0 0 0 .3576.0776c.2346 0 .4139-.0952.4678-.2481l.2787-.7297 1.7152.0001.2785.7292c.0541.1532.2335.2484.4681.2484a.8601.8601 0 0 0 .3576-.0775c.1551-.0713.3041-.2681.1329-.7999l-1.3449-3.5398zm-1.3116 2.4433l.5618-1.5961.5618 1.5961H9.3757zm5.9056 1.3836c0 .2843-.2418.5156-.5391.5156h-1.8047c-.2973 0-.5391-.2314-.5391-.5156V9.3281c0-.3102.2576-.5625.5742-.5625s.5742.2523.5742.5625v3.3047h1.1953c.2974 0 .5392.2314.5392.5156z\"/>", "x": "<path d=\"M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z\"/>", "facebook": "<path d=\"M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z\"/>", "whatsapp": "<path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z\"/>", "line": "<path d=\"M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314\"/>", "threads": "<path d=\"M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z\"/>", "sinaweibo": "<path d=\"M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.601l.014-.028zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.57-.18-.405-.615.375-.977.42-1.804 0-2.404-.781-1.112-2.915-1.053-5.364-.03 0 0-.766.331-.571-.271.376-1.217.315-2.224-.27-2.809-1.338-1.337-4.869.045-7.888 3.08C1.309 10.87 0 13.273 0 15.348c0 3.981 5.099 6.395 10.086 6.395 6.536 0 10.888-3.801 10.888-6.82 0-1.822-1.547-2.854-2.915-3.284v.01zm1.908-5.092c-.766-.856-1.908-1.187-2.96-.962-.436.09-.706.511-.616.932.09.42.511.691.932.602.511-.105 1.067.044 1.442.465.376.421.466.977.316 1.473-.136.406.089.856.51.992.405.119.857-.105.992-.512.33-1.021.12-2.178-.646-3.035l.03.045zm2.418-2.195c-1.576-1.757-3.905-2.419-6.054-1.968-.496.104-.812.587-.706 1.081.104.496.586.813 1.082.707 1.532-.331 3.185.15 4.296 1.383 1.112 1.246 1.429 2.943.947 4.416-.165.48.106 1.007.586 1.157.479.165.991-.104 1.157-.586.675-2.088.241-4.478-1.338-6.235l.03.045z\"/>", "wechat": "<path d=\"M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z\"/>", "share": "<path d=\"M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z\"/>", "copy": "<path d=\"M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z\"/>"};
  var SNS = { ja: ['line', 'x', 'facebook', 'threads'], en: ['whatsapp', 'x', 'facebook', 'threads'], zh: ['wechat', 'sinaweibo'], tw: ['line', 'x', 'facebook', 'threads'], ko: ['kakaotalk', 'x', 'facebook', 'threads'] };
  var SNS_NAME = { x: 'X', line: 'LINE', facebook: 'Facebook', threads: 'Threads', whatsapp: 'WhatsApp', sinaweibo: '微博', wechat: '微信', kakaotalk: 'KakaoTalk' };
  function shareUrl() { return location.origin + location.pathname; }
  function shareHtml() {
    var u = encodeURIComponent(shareUrl()), tx = encodeURIComponent(t(UI.title));
    var link = {
      x: 'https://twitter.com/intent/tweet?text=' + tx + '%0A' + u,
      line: 'https://social-plugins.line.me/lineit/share?url=' + u,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + u,
      threads: 'https://www.threads.net/intent/post?text=' + tx + '%0A' + u,
      whatsapp: 'https://wa.me/?text=' + tx + '%0A' + u,
      sinaweibo: 'https://service.weibo.com/share/share.php?url=' + u + '&title=' + tx
    };
    var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[k] + '</svg>'; };
    var h = '<div class="share"><span>' + esc(t(UI.shareSvc)) + '</span><div>';
    if (navigator.share) h += '<button type="button" data-share aria-label="' + esc(t(UI.shareSvc)) + '">' + svg('share') + '</button>';
    h += '<button type="button" data-copy aria-label="' + esc(t(UI.copy)) + '">' + svg('copy') + '</button>';
    SNS[state.lang].forEach(function (k) {
      h += k === 'wechat' || k === 'kakaotalk'
        ? '<button type="button" data-copy="' + k + '" class="sns-' + k + '" aria-label="' + SNS_NAME[k] + '">' + svg(k) + '</button>'
        : '<a class="sns-' + k + '" href="' + link[k] + '" target="_blank" rel="noopener" aria-label="' + SNS_NAME[k] + '">' + svg(k) + '</a>';
    });
    return h + '</div><p class="copied" id="copied" hidden></p></div>';
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
      return '<button type="button" data-to="' + d.id + '"' + (state.from ? '' : ' disabled') + '>' + btnName(d.name) + (d.sub ? '<small>' + esc(t(d.sub)) + '</small>' : '') + '</button>';
    }).join('');
    $app.innerHTML =
      '<h1><a class="title" href="' + esc(topUrl()) + '">' + esc(t(UI.title)) + '</a></h1>' +
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
  // 那覇バス・琉球バス交通「路線バスの乗り方」に合わせる（OKICAは乗るときに整理券発行器の横、降りるときに運賃箱の読取部にタッチ。両替はバスが止まっているときに）
  var STEPS = {
    after: [
      { ja: 'バスに乗ったら整理券を取ります（OKICAの場合は、タッチします）。', en: 'When you get on, take a numbered ticket (with OKICA, tap the card instead).', zh: '上车后取整理券（使用OKICA则刷卡）。', tw: '上車後取整理券（使用OKICA則刷卡）。', ko: '버스에 타면 정리권을 뽑습니다(OKICA는 카드를 터치합니다).' },
      { ja: '降りる停留所が近づいたら、降車ボタンを押します。', en: 'Press the stop button before your stop.', zh: '快到下车站时，按下车铃。', tw: '快到下車站時，按下車鈴。', ko: '내릴 정류장이 가까워지면 하차 버튼을 누릅니다.' },
      { ja: '降りるときに、運賃を整理券と一緒に運賃箱に入れます（OKICAの場合は、運賃箱の読取部にタッチします）。現金はお釣りが出ないので、バスが止まっているときに車内で両替しましょう。', en: 'When you get off, put the fare and the ticket into the fare box (with OKICA, tap the reader on the fare box). No change is given, so change money on the bus while it is stopped.', zh: '下车时，将车费和整理券一起投入收费箱（使用OKICA则在收费箱的读卡处刷卡）。现金不找零，请在巴士停车时于车内兑换零钱。', tw: '下車時，將車資和整理券一起投入收費箱（使用OKICA則在收費箱的讀卡處刷卡）。現金不找零，請在公車停車時於車內兌換零錢。', ko: '내릴 때 요금을 정리권과 함께 요금함에 넣습니다(OKICA는 요금함의 단말기에 터치합니다). 거스름돈이 없으니 버스가 서 있을 때 차내에서 환전하세요.' }
    ],
    before: [
      { ja: 'バスに乗るときに運賃を払います（OKICAの場合は、タッチします）。現金はお釣りが出ないので、車内で両替しましょう。', en: 'Pay the fare when you get on (with OKICA, tap the card). No change is given, so use the changer on the bus.', zh: '上车时付车费（使用OKICA则刷卡）。现金不找零，请在车内兑换零钱。', tw: '上車時付車資（使用OKICA則刷卡）。現金不找零，請在車內兌換零錢。', ko: '버스에 탈 때 요금을 냅니다(OKICA는 카드를 터치합니다). 거스름돈이 없으니 차내에서 환전하세요.' },
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
    if (b.hasAttribute('data-share')) { navigator.share({ title: t(UI.title), url: shareUrl() }).catch(function () {}); return; }
    if (b.hasAttribute('data-copy')) {
      var msg = { wechat: UI.copiedWechat, kakaotalk: UI.copiedKakao }[b.getAttribute('data-copy')] || UI.copied;
      var done = function () { var c = document.getElementById('copied'); if (c) { c.textContent = t(msg); c.hidden = false; } };
      // クリップボードが使えないブラウザ（アプリ内のブラウザなど）は、昔の方法でコピーする
      var legacy = function () {
        var ta = document.createElement('textarea'); ta.value = shareUrl(); ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done();
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(shareUrl()).then(done, legacy); else legacy();
      return;
    }
    if (b.hasAttribute('data-from')) { state.from = b.getAttribute('data-from'); push(true); render(); }
    else if (b.hasAttribute('data-to')) { state.to = b.getAttribute('data-to'); state.opt = 0; push(false); render(); window.scrollTo(0, 0); }
    else if (b.hasAttribute('data-opt')) { state.opt = +b.getAttribute('data-opt'); render(); }
    else if (b.hasAttribute('data-back')) { state.to = null; push(false); render(); }
  });
  window.addEventListener('popstate', function () { readUrl(); render(); });

  readUrl();
  push(true);
  render();
})();
