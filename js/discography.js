/* ========================================================
   discography.js — data/discography.js のデータをレンダリング

   リリース追加方法: data/discography.js の releases 配列に追記するだけ
   ======================================================== */

function getDiscography() {
  return (typeof DISCOGRAPHY_DATA !== 'undefined') ? DISCOGRAPHY_DATA.releases ?? [] : [];
}

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

  const links = [
    r.purchase_url  ? `<a href="${r.purchase_url}"  target="_blank" rel="noopener" class="btn btn--accent"  style="font-size:0.68rem;padding:0.4em 1em;">購入</a>` : '',
    r.streaming_url ? `<a href="${r.streaming_url}" target="_blank" rel="noopener" class="btn btn--outline" style="font-size:0.68rem;padding:0.4em 1em;">試聴</a>` : '',
  ].filter(Boolean).join('');

  return `
<div class="release-card fade-in" data-type="${r.type}">
  <div class="release-card__cover">${cover}</div>
  <div class="release-card__body">
    ${r.label ? `<div class="release-card__type"><span class="release-card__label">${r.label}</span></div>` : ''}
    <div class="release-card__title">${r.title}</div>
    <div class="release-card__date">${dateStr}${r.catalog ? ' / ' + r.catalog : ''}</div>
    <div class="release-card__tracks">${tracks}</div>
    ${links ? `<div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">${links}</div>` : ''}
  </div>
</div>`;
}

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
}

renderDiscography();
