// HOME ページ専用: 最新動画・最新リリース表示

function renderLatestVideo() {
  const el = document.getElementById('home-video-content');
  if (!el) return;

  const id = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG.youtube_id : '';
  if (!id) {
    el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem">data/config.js に youtube_id を設定してください</p>';
    return;
  }

  const embedUrl = `https://www.youtube.com/embed/${id}?si=DKlhYwMA0T17i5Uy`;

  el.innerHTML = `
    <div class="video-embed fade-in">
      <iframe src="${embedUrl}"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen></iframe>
    </div>
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

  /* releaseCardHTML は js/discography.js で定義 */
  const cards = releases.map(r => releaseCardHTML(r)).join('');

  el.innerHTML = `
    <div class="discography-grid">${cards}</div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="discography.html" class="btn btn--outline">VIEW ALL DISCOGRAPHY</a>
    </div>`;

  el.querySelectorAll('.fade-in').forEach(e => {
    if (typeof observer !== 'undefined') observer.observe(e);
    else e.classList.add('visible');
  });

  /* モーダルリスナーを付与（attachDiscCardListeners は discography.js で定義） */
  attachDiscCardListeners(el);
}

renderLatestVideo();
renderLatestReleases();
