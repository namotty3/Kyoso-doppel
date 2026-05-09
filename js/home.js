// HOME ページ専用: 最新動画・最新リリース表示

function renderLatestVideo() {
  const el = document.getElementById('home-video-content');
  if (!el) return;

  const id = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG.youtube_id : '';
  if (!id) {
    el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem">data/config.js に youtube_id を設定してください</p>';
    return;
  }

  const videoUrl = `https://www.youtube.com/watch?v=${id}`;
  const thumb    = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

  el.innerHTML = `
    <a href="${videoUrl}" target="_blank" rel="noopener" class="video-thumb fade-in" aria-label="YouTubeで動画を見る">
      <img src="${thumb}" alt="YouTube video thumbnail" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${id}/hqdefault.jpg'">
      <div class="video-thumb__play">
        <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M66.5 7.7c-.8-2.9-3-5.2-5.9-6C55.8 0 34 0 34 0S12.2 0 7.4 1.7c-2.9.8-5.1 3.1-5.9 6C0 12.5 0 24 0 24s0 11.5 1.5 16.3c.8 2.9 3 5.2 5.9 6C12.2 48 34 48 34 48s21.8 0 26.6-1.7c2.9-.8 5.1-3.1 5.9-6C68 35.5 68 24 68 24s0-11.5-1.5-16.3z" fill="#ff0000"/>
          <path d="M27 34l18-10-18-10v20z" fill="#fff"/>
        </svg>
      </div>
    </a>
    <div style="text-align:center;margin-top:2rem">
      <a href="https://www.youtube.com/@kyoso-doppel" target="_blank" rel="noopener" class="btn btn--outline">VIEW ALL VIDEOS</a>
    </div>`;

  el.querySelectorAll('.fade-in').forEach(e => {
    if (typeof observer !== 'undefined') observer.observe(e);
    else e.classList.add('visible');
  });
}

function renderLatestReleases() {
  const el = document.getElementById('home-discography-content');
  if (!el || typeof DISCOGRAPHY_DATA === 'undefined') return;

  const releases = [...DISCOGRAPHY_DATA.releases]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  if (!releases.length) {
    el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem">リリース情報は近日公開予定です</p>';
    return;
  }

  const cards = releases.map(r => {
    const d = new Date(r.date + 'T00:00:00');
    const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
    const cover = r.image
      ? `<img src="${r.image}" alt="${r.title}" loading="lazy">`
      : `<span class="release-card__cover-placeholder">JACKET</span>`;
    const tracks = (r.tracks ?? []).map(t =>
      `<div class="release-card__track-item"><span class="release-card__track-num">${t.number}.</span><span>${t.title}</span></div>`
    ).join('');
    const links = [
      r.purchase_url  ? `<a href="${r.purchase_url}"  target="_blank" rel="noopener" class="btn btn--accent"  style="font-size:0.68rem;padding:0.4em 1em;">購入</a>` : '',
      r.streaming_url ? `<a href="${r.streaming_url}" target="_blank" rel="noopener" class="btn btn--outline" style="font-size:0.68rem;padding:0.4em 1em;">試聴</a>` : '',
    ].filter(Boolean).join('');

    return `
<div class="release-card fade-in">
  <div class="release-card__cover">${cover}</div>
  <div class="release-card__body">
    ${r.label ? `<div class="release-card__type"><span class="release-card__label">${r.label}</span></div>` : ''}
    <div class="release-card__title">${r.title}</div>
    <div class="release-card__date">${dateStr}${r.catalog ? ' / ' + r.catalog : ''}</div>
    <div class="release-card__tracks">${tracks}</div>
    ${links ? `<div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap;">${links}</div>` : ''}
  </div>
</div>`;
  }).join('');

  el.innerHTML = `
    <div class="discography-grid">${cards}</div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="discography.html" class="btn btn--outline">VIEW ALL DISCOGRAPHY</a>
    </div>`;

  el.querySelectorAll('.fade-in').forEach(el => {
    if (typeof observer !== 'undefined') observer.observe(el);
    else el.classList.add('visible');
  });
}

renderLatestVideo();
renderLatestReleases();
