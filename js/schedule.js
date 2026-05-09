/* ========================================================
   schedule.js — data/schedule.js のデータをレンダリング

   ライブ追加方法: data/schedule.js の schedule 配列に追記するだけ
   ======================================================== */

const MONTHS   = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getSchedule() {
  return (typeof SCHEDULE_DATA !== 'undefined') ? SCHEDULE_DATA.schedule ?? [] : [];
}

function parseDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    month:   MONTHS[d.getMonth()],
    day:     d.getDate(),
    weekday: WEEKDAYS[d.getDay()],
    full:    `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`,
    obj:     d,
  };
}

function isPast(dateStr) {
  return new Date(dateStr + 'T00:00:00') < new Date(new Date().toDateString());
}

function scheduleItemHTML(item, past) {
  const d    = parseDate(item.date);
  const adv  = item.advance ? `ADV ¥${item.advance.toLocaleString()}`  : '';
  const door = item.door    ? `DOOR ¥${item.door.toLocaleString()}`    : '';
  const price = [adv, door].filter(Boolean).join(' / ');

  return `
<div class="schedule-item${past ? ' past' : ''} fade-in">
  <div class="schedule-date">
    <div class="schedule-date__month">${d.month}</div>
    <div class="schedule-date__day">${d.day}</div>
    <div class="schedule-date__weekday">${d.weekday}</div>
  </div>
  <div class="schedule-info">
    ${item.title   ? `<div class="schedule-info__title">${item.title}</div>` : ''}
    <div class="schedule-info__venue">${item.venue} / ${item.place}</div>
    <div class="schedule-info__details">
      ${item.open  ? `<span>OPEN ${item.open}</span>`   : ''}
      ${item.start ? `<span>START ${item.start}</span>` : ''}
      ${item.info  ? `<span>${item.info}</span>`         : ''}
    </div>
    ${price ? `<div class="schedule-info__price">${price}</div>` : ''}
  </div>
  <div class="schedule-actions">
    ${item.flyer ? `<img src="${item.flyer}" alt="flyer" class="schedule-flyer">` : ''}
    <div class="schedule-actions__btns">
      ${item.ticket_url && !past
        ? `<a href="${item.ticket_url}" target="_blank" rel="noopener" class="btn btn--accent">TICKET</a>`
        : past ? `<span class="ended-label">ENDED</span>` : ''}
      ${item.streaming_url
        ? `<a href="${item.streaming_url}" target="_blank" rel="noopener" class="btn btn--outline">配信</a>`
        : ''}
    </div>
  </div>
</div>`;
}

function renderSchedulePage() {
  const upEl = document.getElementById('schedule-upcoming');
  const paEl = document.getElementById('schedule-past');
  if (!upEl) return;

  const all      = getSchedule();
  const upcoming = all.filter(s => !isPast(s.date)).sort((a,b) => new Date(a.date) - new Date(b.date));
  const past     = all.filter(s =>  isPast(s.date)).sort((a,b) => new Date(b.date) - new Date(a.date));

  upEl.innerHTML = upcoming.length
    ? upcoming.map(s => scheduleItemHTML(s, false)).join('')
    : '<div class="schedule-empty">現在予定されているライブはありません</div>';

  if (paEl) {
    paEl.innerHTML = past.length
      ? past.map(s => scheduleItemHTML(s, true)).join('')
      : '<div class="schedule-empty">過去のライブ情報はありません</div>';
  }

  document.querySelectorAll('.schedule-item.fade-in').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
    else el.classList.add('visible');
  });
}

function renderNextLive() {
  const el = document.getElementById('next-live-content');
  if (!el) return;

  const upcoming = getSchedule()
    .filter(s => !isPast(s.date))
    .sort((a,b) => new Date(a.date) - new Date(b.date));

  if (!upcoming.length) {
    el.innerHTML = '<div class="next-live__empty">ライブ情報は近日公開予定です</div>';
    return;
  }
  const n = upcoming[0];
  const d = parseDate(n.date);
  const price = [
    n.advance ? `ADV ¥${n.advance.toLocaleString()}`  : '',
    n.door    ? `DOOR ¥${n.door.toLocaleString()}`    : '',
  ].filter(Boolean).join(' / ');

  el.innerHTML = `
<div class="next-live__card fade-in">
  ${n.flyer ? `<img src="${n.flyer}" alt="flyer" class="schedule-flyer next-live__flyer">` : ''}
  <div class="next-live__date">${d.full} (${d.weekday})</div>
  ${n.title  ? `<div class="next-live__title">${n.title}</div>` : ''}
  <div class="next-live__venue">${n.venue} / ${n.place}</div>
  ${n.open   ? `<div style="margin-top:0.5rem;font-size:0.82rem;color:var(--color-text-muted)">OPEN ${n.open} / START ${n.start}</div>` : ''}
  ${price    ? `<div style="margin-top:0.3rem;font-size:0.82rem;color:var(--color-text-muted)">${price}</div>` : ''}
  ${(n.ticket_url || n.streaming_url) ? `
  <div style="margin-top:1.2rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
    ${n.ticket_url    ? `<a href="${n.ticket_url}"    target="_blank" rel="noopener" class="btn btn--accent">TICKET</a>` : ''}
    ${n.streaming_url ? `<a href="${n.streaming_url}" target="_blank" rel="noopener" class="btn btn--outline">配信</a>` : ''}
  </div>` : ''}
</div>`;

  document.querySelectorAll('#next-live-content .fade-in').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
    else el.classList.add('visible');
  });
}

renderSchedulePage();
renderNextLive();

// フライヤー拡大表示
(function () {
  const lb     = document.getElementById('lightbox');
  const lbImg  = document.getElementById('lightbox-img');
  const lbClose = document.getElementById('lightbox-close');
  if (!lb) return;

  function open(src) {
    lbImg.src = src;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  // フライヤーをクリックで開く（動的生成後も対応）
  document.addEventListener('click', e => {
    if (e.target.classList.contains('schedule-flyer')) open(e.target.src);
  });

  // オーバーレイ・閉じるボタン・Escで閉じる
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbClose.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
