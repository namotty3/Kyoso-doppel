// Navigation: scroll → add .scrolled class
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu
const navToggle = document.querySelector('.nav__toggle');
const navOverlay = document.getElementById('nav-overlay');

if (navToggle && navOverlay) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('active');
    navOverlay.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navOverlay.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Active nav: highlight current page link
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav__link[href]').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

// Theme switcher
const themeSheet = document.getElementById('theme-stylesheet');
const themes = {
  gothic:  'css/theme-gothic.css',
  cyber:   'css/theme-cyber.css',
  elegant: 'css/theme-elegant.css',
};

function applyTheme(name) {
  if (!themeSheet || !themes[name]) return;
  themeSheet.href = themes[name];
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === name));
  localStorage.setItem('kyoso-theme', name);
}

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
});

// Restore saved theme on load
const savedTheme = localStorage.getItem('kyoso-theme');
if (savedTheme && themes[savedTheme]) {
  applyTheme(savedTheme);
} else {
  document.querySelector('.theme-btn--gothic')?.classList.add('active');
}

// Fade-in on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
