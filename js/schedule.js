/* ========================================================
   schedule.js — data/schedule.js のデータをレンダリング

   ライブ追加方法: data/schedule.js の schedule 配列に追記するだけ
   ======================================================== */

const MONTHS   = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const WEEKDAYS = ['日','月','火','水','木','金','土'];

function getSchedule() {
  return (typeof SCHEDULE_DATA !== 'undefined') ? SCHEDULE_DATA.schedule ?? [] : [];
}

function parseDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    year:    d.getFullYear(),
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

/* 年ごとにグループ化して HTML を生成 */
function renderByYear(items, past) {
  if (!items.length) return '';
  const groups = {};
  items.forEach(s => {
    const y = new Date(s.date + 'T00:00:00').getFullYear();
    if (!groups[y]) groups[y] = [];
    groups[y].push(s);
  });
  const years = Object.keys(groups).map(Number).sort((a, b) => past ? b - a : a - b);
  return years.map(y =>
    `<div class="schedule-year">${y}</div>` +
    groups[y].map(s => scheduleItemHTML(s, past)).join('')
  ).join('');
}

function scheduleItemHTML(item, past) {
  const d    = parseDate(item.date);
  const adv      = item.advance         ? `ADV ¥${item.advance.toLocaleString()}`                : '';
  const door     = item.door            ? `DOOR ¥${item.door.toLocaleString()}`                   : '';
  const streaming = item.streaming_price ? `配信 ¥${item.streaming_price.toLocaleString()}` : '';
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
      ${(item.open || item.start) ? `<span>${[item.open ? `OPEN ${item.open}` : '', item.start ? `START ${item.start}` : ''].filter(Boolean).join(' / ')}</span>` : ''}
      ${item.feat  ? `<span>${item.feat}</span>` : ''}
    </div>
    ${item.info ? `<div class="schedule-info__note">${item.info}</div>` : ''}
    ${price || streaming ? `<div class="schedule-info__price">${[price, streaming].filter(Boolean).join(' / ')}</div>` : ''}
    ${price ? `<div class="schedule-info__drink">※別途ドリンク代が必要</div>` : ''}
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
    ? renderByYear(upcoming, false)
    : '<div class="schedule-empty">現在予定されているライブはありません</div>';

  if (paEl) {
    paEl.innerHTML = past.length
      ? renderByYear(past, true)
      : '<div class="schedule-empty">過去のライブ情報はありません</div>';
  }

  document.querySelectorAll('.schedule-item.fade-in').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
    else el.classList.add('visible');
  });
}

function nextLiveCardHTML(n) {
  const d = parseDate(n.date);
  const price = [
    n.advance         ? `ADV ¥${n.advance.toLocaleString()}`         : '',
    n.door            ? `DOOR ¥${n.door.toLocaleString()}`            : '',
    n.streaming_price ? `配信 ¥${n.streaming_price.toLocaleString()}` : '',
  ].filter(Boolean).join(' / ');
  return `
<div class="next-live__card fade-in">
  ${n.flyer ? `<div class="next-live__flyer-wrap"><img src="${n.flyer}" alt="flyer" class="schedule-flyer" style="width:100%;max-width:260px;height:auto;display:block;margin:0 auto;"></div>` : ''}
  <div class="next-live__date">${d.full} (${d.weekday})</div>
  ${n.title ? `<div class="next-live__title">${n.title}</div>` : ''}
  <div class="next-live__venue">${n.venue} / ${n.place}</div>
  ${n.open  ? `<div style="margin-top:0.5rem;font-size:0.82rem;color:var(--color-text-muted)">OPEN ${n.open} / START ${n.start}</div>` : ''}
  ${price   ? `<div style="margin-top:0.3rem;font-size:0.82rem;color:var(--color-text-muted)">${price}</div>` : ''}
  ${(n.ticket_url || n.streaming_url) ? `
  <div style="margin-top:1.2rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
    ${n.ticket_url    ? `<a href="${n.ticket_url}"    target="_blank" rel="noopener" class="btn btn--accent">TICKET</a>` : ''}
    ${n.streaming_url ? `<a href="${n.streaming_url}" target="_blank" rel="noopener" class="btn btn--outline">配信</a>` : ''}
  </div>` : ''}
</div>`;
}

function renderNextLive() {
  const el = document.getElementById('next-live-content');
  if (!el) return;

  const upcoming = getSchedule()
    .filter(s => !isPast(s.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (!upcoming.length) {
    el.innerHTML = '<div class="next-live__empty">ライブ情報は近日公開予定です</div>';
    return;
  }

  const cards = upcoming.map(n => nextLiveCardHTML(n)).join('');
  const multi = upcoming.length > 1;

  el.innerHTML = `
<div class="nl-slider">
  <div class="nl-slider__track">${cards}</div>
  ${multi ? `
  <button class="nl-slider__btn nl-slider__btn--prev" aria-label="前へ">&#8249;</button>
  <button class="nl-slider__btn nl-slider__btn--next" aria-label="次へ">&#8250;</button>
  <div class="nl-slider__dots">${upcoming.map((_, i) => `<span class="nl-slider__dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
  ` : ''}
</div>`;

  if (multi) {
    const track  = el.querySelector('.nl-slider__track');
    const slider = el.querySelector('.nl-slider');
    const dots   = el.querySelectorAll('.nl-slider__dot');
    const btnP   = el.querySelector('.nl-slider__btn--prev');
    const btnN   = el.querySelector('.nl-slider__btn--next');
    let cur = 0;
    const total = upcoming.length;

    requestAnimationFrame(() => {
      const slideW = slider.offsetWidth;
      track.querySelectorAll('.next-live__card').forEach(c => {
        c.style.minWidth = slideW + 'px';
        c.style.width    = slideW + 'px';
      });

      function goTo(idx) {
        cur = ((idx % total) + total) % total;
        track.style.transform = `translateX(-${cur * slideW}px)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === cur));
      }

      btnP.addEventListener('click', () => goTo(cur - 1));
      btnN.addEventListener('click', () => goTo(cur + 1));

      let sx = 0;
      track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend',   e => {
        const dx = e.changedTouches[0].clientX - sx;
        if (dx < -50) goTo(cur + 1);
        else if (dx > 50) goTo(cur - 1);
      });

      goTo(0);
    });
  }

  el.querySelectorAll('.fade-in').forEach(e => {
    if (typeof observer !== 'undefined') observer.observe(e);
    else e.classList.add('visible');
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

  document.addEventListener('click', e => {
    if (e.target.classList.contains('schedule-flyer')) open(e.target.src);
  });

  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbClose.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
