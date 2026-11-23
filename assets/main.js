/* 2027 설악 원정대 — 모든 날짜 계산은 한국 시간(Asia/Seoul, UTC+9, 서머타임 없음) 기준.
   테스트: 주소 뒤에 ?date=2027-01-12 를 붙이면 그 날짜 기준으로 보입니다. */
(function () {
  'use strict';

  var KST = 9 * 3600 * 1000;
  var DAY = 24 * 3600 * 1000;
  var WD = ['일', '월', '화', '수', '목', '금', '토'];

  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 한국 시간 ---------- */
  function ymd(s) { var p = s.split('-').map(Number); return { y: p[0], m: p[1], d: p[2] }; }
  function kstMs(dateStr, hm) {
    var d = ymd(dateStr), t = (hm || '00:00').split(':').map(Number);
    return Date.UTC(d.y, d.m - 1, d.d, t[0], t[1] || 0) - KST;
  }

  var offset = 0;
  var testDate = new URLSearchParams(location.search).get('date');
  if (testDate && /^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
    var real = Date.now();
    var k = new Date(real + KST);
    var timeOfDay = ((k.getUTCHours() * 60 + k.getUTCMinutes()) * 60 + k.getUTCSeconds()) * 1000;
    offset = kstMs(testDate) + timeOfDay - real;
  } else {
    testDate = null;
  }
  function now() { return Date.now() + offset; }
  function today() {
    var k = new Date(now() + KST);
    return k.getUTCFullYear() + '-' + pad(k.getUTCMonth() + 1) + '-' + pad(k.getUTCDate());
  }
  function daysFrom(a, b) { return Math.round((kstMs(b) - kstMs(a)) / DAY); }
  function addDays(s, n) {
    var k = new Date(kstMs(s) + n * DAY + KST);
    return k.getUTCFullYear() + '-' + pad(k.getUTCMonth() + 1) + '-' + pad(k.getUTCDate());
  }
  function wd(s) { return WD[new Date(kstMs(s) + KST).getUTCDay()]; }
  function md(s) { var d = ymd(s); return d.m + '/' + d.d; }
  function mdw(s) { var d = ymd(s); return pad(d.m) + '.' + pad(d.d) + '(' + wd(s) + ')'; }
  function full(s) { var d = ymd(s); return d.y + '.' + pad(d.m) + '.' + pad(d.d) + '(' + wd(s) + ')'; }
  function dday(n) { return n > 0 ? 'D-' + n : n === 0 ? 'D-DAY' : 'D+' + (-n); }

  /* ---------- 상단 메뉴: 지금 보고 있는 섹션 표시 ---------- */
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.topnav-links a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    function mark(id) {
      links.forEach(function (a) {
        var on = a === byId[id];
        a.classList.toggle('is-current', on);
        if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-60px 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) { var el = $(id); if (el) io.observe(el); });
    var hero = $('top');
    if (hero) new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) mark(null);
    }, { rootMargin: '-60px 0px -55% 0px' }).observe(hero);
  })();

  /* ---------- 데이터 불러오기 ---------- */
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  Promise.all([getJSON('data/config.json'), getJSON('data/weeks.json')])
    .then(function (res) { render(res[0], res[1]); })
    .catch(function (err) {
      console.error(err);
      $('weekCard').innerHTML = '<p><b>데이터를 불러오지 못했습니다.</b></p>' +
        '<p class="muted small">파일을 더블클릭해서 열면 보이지 않습니다. README.md의 "내 컴퓨터에서 미리 보기"를 참고해 주세요.</p>';
    });

  function render(cfg, data) {
    var T = today();

    applyTheme(cfg);
    renderHero(cfg);
    startCountdown(cfg);
    renderWeekCard(cfg, data, T);
    renderMinimum(data);
    renderRace(cfg);
    renderTimeline(cfg, T);
    renderWeeksTable(data, T);
    renderRides(cfg, data, T);
    renderApply(cfg, T);

    if (testDate) {
      var b = document.createElement('div');
      b.className = 'tag';
      b.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:20;background:var(--ink);color:#fff;padding:6px 12px';
      b.textContent = '테스트 날짜: ' + full(testDate);
      document.body.appendChild(b);
    }
  }

  function applyTheme(cfg) {
    var colors = { A: '#ffffff', B: '#fbf8f2', C: '#f5f7f3', D: '#f4f6f8' };
    var t = colors[cfg.theme] ? cfg.theme : 'A';
    document.documentElement.setAttribute('data-theme', t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', colors[t]);
  }

  /* ---------- 1. 히어로 ---------- */
  function renderHero(cfg) {
    if (cfg.heroImage) {
      var img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.onload = function () {
        var media = $('heroMedia');
        media.innerHTML = '';
        media.appendChild(img);
        document.querySelector('.hero').classList.add('has-photo');
      };
      img.src = cfg.heroImage;
    }
    $('estimateTag').hidden = !cfg.raceDateIsEstimate;
    $('raceDateText').textContent = full(cfg.raceDate) + ' ' + cfg.raceStartTime + ' 출발 (그란폰도)' +
      (cfg.raceDateIsEstimate ? ' · 공식 요강 발표 전 예상일' : '');
  }

  function startCountdown(cfg) {
    var target = kstMs(cfg.raceDate, cfg.raceStartTime);
    var els = [$('cdD'), $('cdH'), $('cdM'), $('cdS')];
    function tick() {
      var diff = Math.max(0, target - now());
      var s = Math.floor(diff / 1000);
      var v = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
      for (var i = 0; i < 4; i++) els[i].textContent = i === 0 ? v[i] : pad(v[i]);
      if (diff === 0) {
        $('countdown').setAttribute('aria-label', '대회가 시작되었습니다');
        return;
      }
      setTimeout(tick, 1000 - (now() % 1000));
    }
    tick();
  }

  /* ---------- 2. 이번 주 훈련 ---------- */
  function renderWeekCard(cfg, data, T) {
    var card = $('weekCard');
    var weeks = data.weeks;
    var aw = data.afterWinter;
    var start = cfg.trainingStart || weeks[0].start;
    var html;

    var week = weeks.filter(function (w) { return w.start <= T && T <= w.end; })[0];

    if (T < start) {
      var n = daysFrom(T, start);
      html =
        '<p class="eyebrow">동계 훈련 시작 전</p>' +
        '<h3>동계 훈련 ' + ymd(start).m + '월 ' + ymd(start).d + '일(' + wd(start) + ') 시작</h3>' +
        '<p class="big-dday">' + dday(n) + '</p>' +
        '<p>시작 전에 로라와 공간을 점검하고, 아래 최소 기준을 미리 살펴보세요.</p>' +
        '<dl class="week-rows" style="margin-top:14px">' +
        row('첫 주 화요일', esc(weeks[0].point) + '<br><span class="muted small">' + md(weeks[0].pointDay) + '(' + wd(weeks[0].pointDay) + ')</span>', true) +
        '</dl>';
    } else if (week) {
      var pointIsThu = wd(week.pointDay) === '목';
      var badge = week.type === 'recovery' ? '<span class="tag">회복 주</span>' :
                  week.type === 'light' ? '<span class="tag">가볍게 가는 주</span>' : '';
      html =
        '<div class="week-head"><span class="week-no">' + week.week + '주차</span>' +
        '<span class="week-range">' + md(week.start) + '(월) ~ ' + md(week.end) + '(일) · 11주 중</span></div>' +
        '<div class="week-badges"><span class="tag">' + esc(week.phase) + ' 단계</span>' + badge + '</div>' +
        '<p class="week-topic">' + esc(week.cheerTopic) + '</p>' +
        '<dl class="week-rows">' +
        row(wd(week.pointDay) + '요일 포인트<br><span class="muted small">' + md(week.pointDay) + '</span>', esc(week.point), true) +
        (pointIsThu ? '' : row('목요일', esc(week.thursday))) +
        (week.event ? row('이번 주 일정', esc(week.event)) : '') +
        '</dl>' +
        (week.cheer ? '<p class="week-cheer">' + esc(week.cheer) + '</p>' : '');
    } else if (aw.prepWeek && aw.prepWeek.start <= T && T <= aw.prepWeek.end) {
      var first = aw.groupRides[0];
      html =
        '<p class="eyebrow">' + md(aw.prepWeek.start) + ' ~ ' + md(aw.prepWeek.end) + '</p>' +
        '<h3>첫 단체 훈련 준비 주간</h3>' +
        '<p class="big-dday">' + dday(daysFrom(T, first.date)) + '</p>' +
        '<dl class="week-rows">' +
        row('이번 주', esc(aw.prepWeek.text), true) +
        row(mdw(first.date), esc(first.title) + '<br><span class="muted small">' + esc(first.km) + 'km · 예상 ' + esc(first.hours) + '시간 · 집결지 ' + esc(cfg.firstRideMeetingPoint || '카페 공지 예정') + '</span>') +
        '</dl>' +
        '<p class="small" style="margin-top:12px"><a href="#first-ride">3/7 상세 보기</a></p>';
    } else if (T < cfg.raceDate) {
      var next = aw.groupRides.filter(function (r) { return r.date >= T; })[0];
      if (next) {
        var nd = daysFrom(T, next.date);
        var nextNote = (cfg.groupRideNotes || {})[next.date];
        html =
          '<p class="eyebrow">시즌 · 다음 단체 훈련</p>' +
          '<h3>' + mdw(next.date) + ' ' + esc(next.title) + '</h3>' +
          (nextNote ? '<p class="muted small">' + esc(nextNote) + '</p>' : '') +
          '<p class="big-dday">' + (nd === 0 ? '오늘' : dday(nd)) + '</p>' +
          '<dl class="week-rows">' +
          row('거리', esc(next.km) + 'km · 예상 ' + esc(next.hours) + '시간 (휴식 포함)', true) +
          row('평일', '로라 2회 유지 (화요일 포인트, 목요일 편하게)') +
          '</dl>' +
          '<p class="muted small" style="margin-top:12px">코스와 집결지는 출발 2주 전까지 카페에 공지합니다.</p>';
      } else {
        html =
          '<p class="eyebrow">대회 주간</p>' +
          '<h3>설악까지</h3>' +
          '<p class="big-dday">' + dday(daysFrom(T, cfg.raceDate)) + '</p>' +
          '<dl class="week-rows">' +
          row('지금은', '새로운 훈련보다 컨디션 조절. 잠을 충분히, 짧고 가볍게 타기', true) +
          row('대회', full(cfg.raceDate) + ' ' + esc(cfg.raceStartTime) + ' 출발' +
            (cfg.raceTravelNote ? '<br><span class="muted small">' + esc(cfg.raceTravelNote) + '</span>' : '')) +
          '</dl>';
      }
    } else if (T === cfg.raceDate) {
      html =
        '<p class="eyebrow">' + full(cfg.raceDate) + '</p>' +
        '<h3 class="big-dday" style="font-size:clamp(1.8rem,8vw,2.6rem)">오늘 설악을 넘습니다</h3>' +
        '<p>구룡령, 조침령, 쓰리재, 필례-한계령, 구룡령 역방향. 겨울 내내 준비한 그대로, 페이스 지키고 보급 챙기며 함께 넘어요.</p>';
    } else {
      var nextYear = ymd(cfg.raceDate).y + 1;
      html =
        '<p class="eyebrow">' + full(cfg.raceDate) + ' 설악그란폰도</p>' +
        '<h3 class="big-dday" style="font-size:clamp(1.8rem,8vw,2.6rem)">완주를 축하합니다</h3>' +
        '<p>겨울 로라부터 봄 200km까지, 함께해 주셔서 고맙습니다. ' + nextYear + ' 원정대 소식은 카페에서 다시 알려 드릴게요.</p>';
    }
    card.innerHTML = html;
  }

  function row(label, value, point) {
    return '<div class="week-row' + (point ? ' point' : '') + '"><dt>' + label + '</dt><dd>' + value + '</dd></div>';
  }

  function renderMinimum(data) {
    $('minimumList').innerHTML = data.minimum.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('optionalList').innerHTML = data.optional.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('principleList').innerHTML = data.principles.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('noTrainer').textContent = data.noTrainer || '';
    var g = data.glossary || {};
    $('glossary').innerHTML = Object.keys(g).map(function (k) {
      return '<b>' + esc(k) + '</b>: ' + esc(g[k]) + '. 파워미터·심박계 없이도 체감으로 따라 하면 됩니다.';
    }).join('<br>');
  }

  /* ---------- 3. 대회 ---------- */
  function renderRace(cfg) {
    var r = cfg.race;
    $('raceBasis').textContent = r.basisLabel;
    $('raceGrade').textContent = r.grade;

    var maxKm = Math.max.apply(null, r.climbs.map(function (c) { return c.km; }));
    var maxGain = Math.max.apply(null, r.climbs.map(function (c) { return c.gain; }));
    var maxGrade = Math.max.apply(null, r.climbs.map(function (c) { return c.grade; }));
    var MAX_H = 72;

    $('climbList').innerHTML = r.climbs.map(function (c, i) {
      var w = (c.km / maxKm * 100).toFixed(1);
      var h = Math.max(6, Math.round(c.gain / maxGain * MAX_H));
      var light = c.course !== '공통';
      return '<li>' +
        '<div class="climb-meta"><span class="idx">' + (i + 1) + '</span><b>' + esc(c.name) + '</b>' +
        '<span class="nums-txt">' + c.km + 'km · ' + c.gain + 'm · ' +
        (c.grade === maxGrade ? '<span class="steep">' + c.grade + '%</span>' : c.grade + '%') + '</span>' +
        '<span class="tag">' + esc(c.course) + '</span></div>' +
        '<div class="ramp-box" aria-hidden="true"><svg class="ramp' + (light ? ' light' : '') + '" viewBox="0 0 100 100" preserveAspectRatio="none" style="width:' + w + '%;height:' + h + 'px">' +
        '<polygon points="0,100 100,0 100,100"/></svg></div>' +
        '</li>';
    }).join('');

    $('courseCards').innerHTML = r.courses.map(function (c, i) {
      return '<article class="card course' + (i === 0 ? ' main' : '') + '">' +
        '<p class="eyebrow">' + esc(c.name) + '</p>' +
        '<p class="course-km">' + c.km + '<small>km</small></p>' +
        '<dl class="dl">' +
        '<div><dt>출발</dt><dd>' + esc(c.start) + '</dd></div>' +
        '<div><dt>제한 시간</dt><dd>' + esc(c.limit) + '</dd></div>' +
        '<div><dt>컷오프</dt><dd>' + esc(c.cutoff) + '</dd></div>' +
        '<div><dt>보급소</dt><dd>' + esc(c.feed) + '</dd></div>' +
        '<div><dt>고개</dt><dd>' + esc(c.climbs) + '</dd></div>' +
        '</dl></article>';
    }).join('');

    $('startFinish').textContent = '출발 ' + r.start + ' · 도착 ' + r.finish + ' · ' + r.basisLabel;
  }

  /* ---------- 4. 일정 ---------- */
  function renderTimeline(cfg, T) {
    var items = cfg.checkpoints;
    var nextFound = false;
    $('timeline').innerHTML = items.map(function (c, i) {
      var end = c.end === 'race' ? cfg.raceDate : c.end;
      var cls = [];
      if (end && T > end) cls.push('done');
      else if (!nextFound) { cls.push('next'); nextFound = true; }
      if (i === items.length - 1) cls.push('last');
      return '<li class="' + cls.join(' ') + '"' + (cls.indexOf('next') > -1 ? ' aria-current="step"' : '') + '>' +
        '<p class="tl-date">' + esc(c.date) + '</p>' +
        '<p class="tl-title">' + esc(c.title) + '</p>' +
        (c.note ? '<p class="tl-note">' + esc(c.note) + '</p>' : '') +
        '</li>';
    }).join('');
  }

  function renderWeeksTable(data, T) {
    $('weeksTable').querySelector('tbody').innerHTML = data.weeks.map(function (w) {
      var now = w.start <= T && T <= w.end;
      return '<tr' + (now ? ' class="is-now" aria-current="true"' : '') + '>' +
        '<td class="num"><b>' + w.week + '</b></td>' +
        '<td class="num">' + md(w.start) + ' ~ ' + md(w.end) + '</td>' +
        '<td><span class="muted small">' + md(w.pointDay) + '(' + wd(w.pointDay) + ')</span><br>' + esc(w.point) + '</td>' +
        '<td>' + esc(w.event) + '</td></tr>';
    }).join('');
  }

  function renderRides(cfg, data, T) {
    var notes = cfg.groupRideNotes || {};
    var rides = data.afterWinter.groupRides;
    var nextDate = (rides.filter(function (r) { return r.date >= T; })[0] || {}).date;
    var rows = rides.map(function (r) {
      var note = notes[r.date];
      return '<tr' + (r.date === nextDate ? ' class="is-now"' : '') + '>' +
        '<td class="num">' + mdw(r.date) + '</td>' +
        '<td>' + esc(r.title) + (note ? '<br><span class="muted small">' + esc(note) + '</span>' : '') + '</td>' +
        '<td class="num">' + esc(r.km) + 'km</td>' +
        '<td class="num">' + esc(r.hours) + '시간</td></tr>';
    });
    rows.push('<tr><td class="num"><b>' + mdw(cfg.raceDate) + '</b></td>' +
      '<td><b>' + ymd(cfg.raceDate).y + ' 설악그란폰도</b>' + (cfg.raceDateIsEstimate ? ' <span class="tag">예상일</span>' : '') +
      (cfg.raceTravelNote ? '<br><span class="muted small">' + esc(cfg.raceTravelNote) + '</span>' : '') + '</td>' +
      '<td class="num">208 / 105km</td><td class="num">제한 12 / 7시간</td></tr>');
    $('ridesTable').querySelector('tbody').innerHTML = rows.join('');

    $('meetPoint').textContent = cfg.firstRideMeetingPoint || '준비 중 (카페 공지)';
    $('meetTime').textContent = cfg.firstRideStartTime || '9~10시 권장';
  }

  /* ---------- 5. 신청 ---------- */
  function renderApply(cfg, T) {
    var dl = cfg.confirmDeadline;
    var n = daysFrom(T, dl);
    $('deadlineText').textContent = '참가 확정 마감 ' + full(dl);
    $('deadlineDday').textContent = n >= 0 ? dday(n) : '마감';

    var pending = false;
    [['formBtn', cfg.googleFormUrl], ['cafeBtn', cfg.cafePostUrl]].forEach(function (p) {
      var a = $(p[0]);
      if (p[1]) {
        a.href = p[1];
      } else {
        pending = true;
        a.classList.add('is-disabled');
        a.setAttribute('aria-disabled', 'true');
        a.removeAttribute('target');
        a.addEventListener('click', function (e) { e.preventDefault(); });
      }
    });
    $('applyPending').hidden = !pending;
    if (n < 0) {
      $('applyPending').hidden = false;
      $('applyPending').textContent = '확정 마감이 지났습니다. 추가 참가를 원하시면 카페 쪽지로 문의해 주세요.';
    }

    var cafe = cfg.cafeUrl || cfg.cafePostUrl;
    var link = $('cafeLink');
    if (cafe) { link.href = cafe; link.target = '_blank'; link.rel = 'noopener'; }
    else { link.replaceWith(document.createTextNode('카페 쪽지')); }
  }
})();
