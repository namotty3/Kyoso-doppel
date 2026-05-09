/* ========================================================
   discography.js — data/discography.js のデータをレンダリング
   リリース追加方法: data/discography.js の releases 配列に追記するだけ
   ======================================================== */

function getDiscography() {
  return (typeof DISCOGRAPHY_DATA !== 'undefined') ? DISCOGRAPHY_DATA.releases ?? [] : [];
}

/* id → release のマップ（モーダルで参照） */
var DISCOGRAPHY_MAP = {};
function buildDiscMap() {
  getDiscography().forEach(r => { DISCOGRAPHY_MAP[r.id] = r; });
}

/* ---- カード HTML ---- */
function releaseCardHTML(r) {
  const d = new Date(r.date + 'T00:00:00');
  const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;

  const tracks = (r.tracks ?? []).map(t => `
    <div class="release-card__track-item">
      <span class="release-card__track-num">${t.number}.</span>
      <span>${t.title}</span>
    </div>`).join('');

  const cover = r.image
    ? `<img src="${r.image}" alt="${r.title}" loading="lazy">`
    : `<span class="release-card__cover-placeholder">JACKET</span>`;

  return `
<div class="release-card fade-in" data-type="${r.type}" data-release-id="${r.id}">
  <div class="release-card__cover">${cover}</div>
  <div class="release-card__body">
    ${r.label ? `<div class="release-card__type"><span class="release-card__label">${r.label}</span></div>` : ''}
    <div class="release-card__title">${r.title}</div>
    <div class="release-card__date">${dateStr}${r.catalog ? ' / ' + r.catalog : ''}</div>
    <div class="release-card__tracks">${tracks}</div>
  </div>
</div>`;
}

/* ---- モーダル ---- */
function injectDiscModal() {
  if (document.getElementById('disc-modal')) return;
  const el = document.createElement('div');
  el.innerHTML = `
<div class="disc-modal" id="disc-modal" role="dialog" aria-modal="true" aria-label="リリース詳細">
  <div class="disc-modal__overlay" id="disc-modal-overlay"></div>
  <div class="disc-modal__box">
    <button class="disc-modal__close" id="disc-modal-close" aria-label="閉じる">&times;</button>
    <div class="disc-modal__inner">
      <div class="disc-modal__cover" id="disc-modal-cover"></div>
      <div class="disc-modal__info">
        <div class="disc-modal__label" id="disc-modal-label"></div>
        <h2 class="disc-modal__title" id="disc-modal-title"></h2>
        <div class="disc-modal__meta"  id="disc-modal-meta"></div>
        <div class="disc-modal__tracks"  id="disc-modal-tracks"></div>
        <div class="disc-modal__comment" id="disc-modal-comment"></div>
        <div class="disc-modal__links"   id="disc-modal-links"></div>
      </div>
    </div>
  </div>
</div>`;
  document.body.appendChild(el.firstElementChild);

  document.getElementById('disc-modal-overlay').addEventListener('click', closeDiscModal);
  document.getElementById('disc-modal-close').addEventListener('click', closeDiscModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDiscModal(); });
}

function openDiscModal(r) {
  const modal = document.getElementById('disc-modal');
  if (!modal) return;

  const d = new Date(r.date + 'T00:00:00');
  const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;

  const labelParts = [r.label, r.type].filter(Boolean).join(' / ');
  document.getElementById('disc-modal-label').textContent = labelParts;
  document.getElementById('disc-modal-title').textContent = r.title;
  document.getElementById('disc-modal-meta').textContent  = [dateStr, r.catalog].filter(Boolean).join(' / ');

  document.getElementById('disc-modal-cover').innerHTML = r.image
    ? `<img src="${r.image}" alt="${r.title}">`
    : `<div class="disc-modal__cover-ph">JACKET</div>`;

  document.getElementById('disc-modal-tracks').innerHTML = (r.tracks ?? []).map(t =>
    `<div class="disc-modal__track-item"><span class="disc-modal__track-num">${t.number}.</span><span>${t.title}</span></div>`
  ).join('');

  const commentEl = document.getElementById('disc-modal-comment');
  commentEl.textContent = r.comment ?? '';
  commentEl.style.display = r.comment ? '' : 'none';

  document.getElementById('disc-modal-links').innerHTML = [
    r.purchase_url  ? `<a href="${r.purchase_url}"  target="_blank" rel="noopener" class="btn btn--accent"  style="font-size:0.75rem;padding:0.5em 1.4em;">購入</a>` : '',
    r.streaming_url ? `<a href="${r.streaming_url}" target="_blank" rel="noopener" class="btn btn--outline" style="font-size:0.75rem;padding:0.5em 1.4em;">試聴 / 配信</a>` : '',
  ].filter(Boolean).join('');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDiscModal() {
  const modal = document.getElementById('disc-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

/* クリックリスナーをカードに付与 */
function attachDiscCardListeners(container) {
  (container || document).querySelectorAll('.release-card[data-release-id]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const r = DISCOGRAPHY_MAP[parseInt(card.dataset.releaseId, 10)];
      if (r) openDiscModal(r);
    });
  });
}

/* ---- メインレンダリング ---- */
function renderDiscography() {
  const grid      = document.getElementById('discography-grid');
  const filterBox = document.getElementById('discography-filter');
  if (!grid) return;

  const releases = getDiscography();

  if (!releases.length) {
    grid.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:3rem;grid-column:1/-1">リリース情報は近日公開予定です</p>';
    return;
  }

  releases.sort((a, b) => new Date(b.date) - new Date(a.date));
  grid.innerHTML = releases.map(releaseCardHTML).join('');

  if (filterBox) {
    const types = ['ALL', ...new Set(releases.map(r => r.type))];
    filterBox.innerHTML = types.map((t, i) =>
      `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${t}">${t}</button>`
    ).join('');

    filterBox.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBox.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      grid.querySelectorAll('.release-card').forEach(card => {
        card.style.display = (f === 'ALL' || card.dataset.type === f) ? '' : 'none';
      });
    });
  }

  grid.querySelectorAll('.fade-in').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
    else el.classList.add('visible');
  });

  attachDiscCardListeners(grid);
}

buildDiscMap();
injectDiscModal();
renderDiscography();
