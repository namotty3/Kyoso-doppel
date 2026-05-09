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
