// HOME ページ専用: 最新動画・最新リリース表示

function renderLatestVideo() {
  const el = document.getElementById('home-video-content');
  if (!el) return;

  const cfg = (typeof SITE_CONFIG !== 'undefined') ? SITE_CONFIG : {};
  const ids = cfg.youtube_ids || (cfg.youtube_id ? [cfg.youtube_id] : []);

  if (!ids.length) {
    el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem">data/config.js に youtube_ids を設定してください</p>';
    return;
  }

  const slides = ids.map(id => `
<div class="video-slider__slide">
  <div class="video-embed fade-in">
    <iframe src="https://www.youtube.com/embed/${id}"
            title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>
</div>`).join('');

  const multi = ids.length > 1;

  el.innerHTML = `
<div class="video-slider">
  <div class="video-slider__track">${slides}</div>
  ${multi ? `
  <button class="video-slider__btn video-slider__btn--prev" aria-label="前へ">&#8249;</button>
  <button class="video-slider__btn video-slider__btn--next" aria-label="次へ">&#8250;</button>
  <div class="video-slider__dots">${ids.map((_, i) => `<span class="video-slider__dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
  ` : ''}
</div>
<div style="text-align:center;margin-top:2rem">
  <a href="https://www.youtube.com/@kyoso-doppel" target="_blank" rel="noopener" class="btn btn--outline">VIEW ALL VIDEOS</a>
</div>`;

  if (multi) {
    const track = el.querySelector('.video-slider__track');
    const dots  = el.querySelectorAll('.video-slider__dot');
    const btnP  = el.querySelector('.video-slider__btn--prev');
    const btnN  = el.querySelector('.video-slider__btn--next');
    let cur = 0;
    const total = ids.length;

    function goTo(idx) {
      cur = ((idx % total) + total) % total;
      track.style.transform = `translateX(-${cur * 100}%)`;
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
  }

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
    .slice(0, 4);

  if (!releases.length) {
    el.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem">リリース情報は近日公開予定です</p>';
    return;
  }

  const slides = releases.map(r => `<div class="dhs__slide">${releaseCardHTML(r)}</div>`).join('');
  const gridCards = releases.map(r => releaseCardHTML(r)).join('');

  el.innerHTML = `
    <div class="dhs">
      <div class="dhs__track">${slides}</div>
      <button class="dhs__btn dhs__btn--prev" aria-label="前へ">&#8249;</button>
      <button class="dhs__btn dhs__btn--next" aria-label="次へ">&#8250;</button>
      <div class="dhs__dots">${releases.map((_, i) => `<span class="dhs__dot${i === 0 ? ' active' : ''}"></span>`).join('')}</div>
    </div>
    <div class="discography-grid dhs__grid">${gridCards}</div>
    <div style="text-align:center;margin-top:2.5rem">
      <a href="discography.html" class="btn btn--outline">VIEW ALL DISCOGRAPHY</a>
    </div>`;

  const track = el.querySelector('.dhs__track');
  const dots  = el.querySelectorAll('.dhs__dot');
  const btnP  = el.querySelector('.dhs__btn--prev');
  const btnN  = el.querySelector('.dhs__btn--next');
  let cur = 0;
  const total = releases.length;

  function goTo(idx) {
    cur = ((idx % total) + total) % total;
    const slideW = track.parentElement.offsetWidth || window.innerWidth;
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

  el.querySelectorAll('.fade-in').forEach(e => {
    if (typeof observer !== 'undefined') observer.observe(e);
    else e.classList.add('visible');
  });

  attachDiscCardListeners(el);
}

renderLatestVideo();
renderLatestReleases();
