/* ============================================================
   NUEFLASH — Interactive
   ============================================================ */
(function () {
  'use strict';

  // ---------- Mobile menu toggle ----------
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.nav__menu');
  const lang = document.querySelector('.nav__lang');
  if (burger) {
    burger.addEventListener('click', () => {
      menu && menu.classList.toggle('is-open');
      lang && lang.classList.toggle('is-open');
    });
  }

  // ---------- Reveal on scroll ----------
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
  }

  // ---------- Smooth-scroll for in-page nav ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' });
      if (menu && menu.classList.contains('is-open')) menu.classList.remove('is-open');
      if (lang && lang.classList.contains('is-open')) lang.classList.remove('is-open');
    });
  });

  // ---------- Mailto fallback: copy email to clipboard + toast ----------
  // Some users (esp. Mac users without default mail app) get nothing on mailto click.
  // We copy the email to clipboard and show a toast as a robust fallback.
  const showToast = (message, duration = 4500) => {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--in'));
    setTimeout(() => {
      el.classList.remove('toast--in');
      setTimeout(() => el.remove(), 400);
    }, duration);
  };

  const htmlLang = (document.documentElement.lang || 'ko').toLowerCase();
  const copyMsg = {
    ko: (e) => `이메일이 복사됐어요 <strong>${e}</strong><br/>메일 앱이 안 열리면 Gmail 웹에 붙여넣기 (⌘V) 하세요`,
    en: (e) => `Email copied <strong>${e}</strong><br/>If your mail app didn't open, paste it (⌘V / Ctrl+V) into Gmail`,
    zh: (e) => `邮箱已复制 <strong>${e}</strong><br/>如果邮件应用没打开,请粘贴 (⌘V) 至邮箱网页版`,
  };
  const getMsg = (email) => (copyMsg[htmlLang] || copyMsg.ko)(email);

  document.querySelectorAll('a[href^="mailto:"]').forEach((link) => {
    link.addEventListener('click', async () => {
      const href = link.getAttribute('href') || '';
      const m = href.match(/^mailto:([^?]+)/);
      if (!m) return;
      const email = decodeURIComponent(m[1]);
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback: use deprecated execCommand
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        showToast(getMsg(email));
      } catch (err) {
        // Silent fail — mailto will still try to fire
      }
      // Don't preventDefault — let mailto fire too (works if default mail app set)
    });
  });
})();
