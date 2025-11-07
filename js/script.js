(() => {
  'use strict';

  // Tiny helpers
  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  // Progressive enhancement
  document.body.classList.remove('no-js');
  const introSplash = $('#introSplash');
  const introVideo = $('#introVideo');
  const skipIntroBtn = $('#skipIntro');
  const introOverlay = $('.intro-overlay');

  if (introSplash) {
    document.body.classList.add('intro-active');
    let finished = false;
    let autoCloseTimer = 0;
    let fadeTimer = 0;
    let revealTimer = 0;

    const finalize = () => {
      if (!introSplash.isConnected) return;
      if (fadeTimer) {
        window.clearTimeout(fadeTimer);
        fadeTimer = 0;
      }
      if (revealTimer) {
        window.clearTimeout(revealTimer);
        revealTimer = 0;
      }
      document.body.classList.remove('intro-active');
      introSplash.remove();
    };

    const teardown = () => {
      if (finished) return;
      finished = true;
      if (autoCloseTimer) window.clearTimeout(autoCloseTimer);
      introVideo?.pause();
      introSplash.setAttribute('aria-hidden', 'true');
      introSplash.removeAttribute('aria-modal');
      introSplash.classList.add('hidden');
      introOverlay?.classList.remove('is-visible');

      if (!revealTimer) {
        revealTimer = window.setTimeout(() => {
          document.body.classList.remove('intro-active');
          revealTimer = 0;
        }, 150);
      }

      const onFadeOut = (event) => {
        if (event.target === introSplash && event.propertyName === 'opacity') {
          introSplash.removeEventListener('transitionend', onFadeOut);
          finalize();
        }
      };
      introSplash.addEventListener('transitionend', onFadeOut);
      fadeTimer = window.setTimeout(() => {
        introSplash.removeEventListener('transitionend', onFadeOut);
        finalize();
      }, 1200);
    };

    skipIntroBtn?.addEventListener('click', teardown);
    introVideo?.addEventListener('ended', teardown, { once: true });
    introVideo?.addEventListener('error', teardown, { once: true });

    const ensurePlayback = () => {
      if (!introVideo) return;
      const attempt = introVideo.play();
      if (attempt && attempt.catch) attempt.catch(() => teardown());
    };

    autoCloseTimer = window.setTimeout(teardown, 15000);
    if (introVideo?.readyState >= 2) ensurePlayback();
    else introVideo?.addEventListener('canplay', ensurePlayback, { once: true });

    window.requestAnimationFrame(() => {
      introOverlay?.classList.add('is-visible');
      window.requestAnimationFrame(() => skipIntroBtn?.focus());
    });
  }

  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Local ISO date -> Date (avoid off-by-one)
  const parseISODateLocal = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Theme toggle (dark default)
  const root = document.documentElement;
  const tgl  = $('#themeToggle');
  const saved = localStorage.getItem('theme_gsap') ?? localStorage.getItem('theme');
  if (saved === 'light') root.classList.add('light');
  const setThemeLabel = () => { if (tgl) tgl.textContent = root.classList.contains('light') ? '🌙 Dark' : '☀️ Light'; };
  setThemeLabel();
  tgl?.addEventListener('click', () => {
    const isLight = root.classList.toggle('light');
    localStorage.setItem('theme_gsap', isLight ? 'light' : 'dark');
    setThemeLabel();
  });

  // Mobile drawer with slide/fade
  const mobileToggle = $('#mobileToggle');
  const mobileMenu   = $('#mobileMenu');
  const mobileClose  = $('#mobileClose');
  const mobileSheet  = mobileMenu?.querySelector('.mobile-sheet');

  const openMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.hidden = false;
    void mobileMenu.offsetWidth;                 // reflow to enable transition
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
    mobileToggle?.setAttribute('aria-expanded','true');
    // focus first focusable
    const first = mobileMenu.querySelector('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    first?.focus();
  };
  const closeMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    const finish = () => {
      mobileMenu.hidden = true;
      document.body.style.overflow = '';
      mobileToggle?.setAttribute('aria-expanded','false');
      mobileToggle?.focus();
      mobileSheet?.removeEventListener('transitionend', onEnd);
    };
    const onEnd = (e) => { if (e.target === mobileSheet && e.propertyName === 'transform') finish(); };
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && mobileSheet) {
      mobileSheet.addEventListener('transitionend', onEnd, { once:false });
    } else finish();
  };

  // Toggle / backdrop / ESC / close-on-link
  mobileToggle?.addEventListener('click', () => { const isOpen = mobileMenu && !mobileMenu.hidden; isOpen ? closeMenu() : openMenu(); });
  mobileClose?.addEventListener('click', closeMenu);
  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) return closeMenu();      // click backdrop
    const link = e.target.closest('a'); if (link) closeMenu(); // any link
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && mobileMenu && !mobileMenu.hidden) closeMenu(); });

  // Data
  const shows = [
    { date: '2025-10-03', city: 'New York, NY', venue: 'Comedy In Harlem', tickets: '#' },
    { date: '2025-10-17', city: 'New York, NY', venue: 'Miracle Revival Fellowship Tabernacle', tickets: '#' },
    { date: '2025-10-25', city: 'New York, NY', venue: 'Smokes&amp;Jokes Comedy Show', tickets: '#' },
  ];
  const flyers = [
    'https://www.dreadarchiejr.com/assets/imgs/flyer1.jpg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer2.png',
    'https://www.dreadarchiejr.com/assets/imgs/flyer3.jpeg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer4.png',
    'https://www.dreadarchiejr.com/assets/imgs/flyer5.jpeg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer6.jpg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer7.jpg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer8.jpg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer9.jpeg',
    'https://www.dreadarchiejr.com/assets/imgs/flyer10.png'
  ];
  const videos = [
    { type: 'iframe', src: 'https://www.youtube.com/embed/T03FJHbVnvY', caption: 'Clip: Acting Reel' },
    { type: 'iframe', src: 'https://www.youtube.com/embed/_SI-rF0-pjU?start=277', caption: 'Acting: Rhonda MD S1 Ep1 - Private Parts' },
    { type: 'iframe', src: 'https://www.youtube.com/embed/AZwp3xQbf1k?start=30&end=169', caption: 'Standup: Special Ed' },
    { type: 'iframe', src: 'https://www.youtube.com/embed/z0C7y0Ff7F4', caption: 'Commerical work: Wrigleys Winterfresh' },
    { type: 'iframe', src: 'https://www.youtube.com/embed/r0yEOXY7X-o', caption: 'Clip: Breath Control: The History of the Human Beatbox (Trailer)' },
    { type: 'iframe', src: 'https://www.youtube.com/embed/-Lqw879_CS8?start=286&end=340', caption: 'Standup: First show at Danagerfields' }
  ];


  const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  // Shows
  function renderShows(list){
    const wrap = $('#showsWrap'); if (!wrap) return;
    wrap.innerHTML = '';
    list.slice().sort((a,b)=>parseISODateLocal(a.date)-parseISODateLocal(b.date)).forEach(s=>{
      const d = parseISODateLocal(s.date);
      const el = document.createElement('article');
      el.className = 'card show';
      el.innerHTML = `  
        <div class="date"><div>${MONTHS[d.getMonth()]}<small>${d.getDate()}</small></div></div>
        <div class="meta">
          <strong>${s.venue}</strong>
          <span class="where">${s.city} • ${d.getFullYear()}</span>
        </div>`;
      wrap.appendChild(el);
    });
  }
  function filterSoon(days=60){
    const now = new Date(); const lim = new Date(now.getTime()+days*24*3600*1000);
    return shows.filter(s => { const d = parseISODateLocal(s.date); return d>=now && d<=lim; });
  }

  // Flyers
  function renderTicker(){
    const t = $('#ticker'); if (!t) return;
    t.innerHTML = '';
    [...flyers, ...flyers].forEach(u => { const img = document.createElement('img'); img.src=u; img.alt='Event flyer'; t.appendChild(img); });
  }

  // Videos
  function renderVideos(){
    const grid = $('#videoGrid'); if (!grid) return;
    grid.innerHTML = '';
    videos.forEach(v=>{
      const card = document.createElement('article'); card.className='video-card';
      card.innerHTML = v.type==='iframe'
        ? `<iframe src="${v.src}" title="Video clip" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`
        : `<video src="${v.src}" controls preload="metadata"></video>`;
      const cap = document.createElement('div'); cap.className='caption'; cap.textContent=v.caption;
      card.appendChild(cap); grid.appendChild(card);
    });
  }

  // Initial render
  renderShows(shows);
  renderTicker();
  renderVideos();

  // Filters
  const filterAllBtn  = $('#filterAll');
  const filterSoonBtn = $('#filterSoon');
  const setPressed = (el, pressed) => el?.setAttribute('aria-pressed', String(pressed));
  let setupShowReveals = () => {};

  filterAllBtn?.addEventListener('click', () => { renderShows(shows); setPressed(filterAllBtn,true); setPressed(filterSoonBtn,false); setupShowReveals(); });
  filterSoonBtn?.addEventListener('click', () => { renderShows(filterSoon()); setPressed(filterAllBtn,false); setPressed(filterSoonBtn,true); setupShowReveals(); });

  // GSAP animations (if available + motion allowed)
  const motionOk = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  if (motionOk && window.gsap) {
    const gs = window.gsap;
    if (window.ScrollTrigger) gs.registerPlugin(window.ScrollTrigger);

    $$('.layer,[data-depth]').forEach(el=>{
      const depth = parseFloat(el.getAttribute('data-depth') ?? el.dataset.depth ?? 0.1);
      gs.to(el, { yPercent: depth*-40, ease:'none', scrollTrigger:{ trigger:'#top', start:'top top', end:'bottom top', scrub:true } });
    });

    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({ trigger:'#top', start:'top top', end:'+=60%', pin:true, pinSpacing:true });
    }
    gs.from('.poster',{ yPercent:18, rotate:-8, ease:'none', scrollTrigger:{ trigger:'#top', start:'top top', end:'+=60%', scrub:true } });
    gs.from('.hero-content h1',{ y:40, opacity:0, duration:.8, ease:'power3.out' });
    gs.from('.hero-content .lead',{ y:30, opacity:0, duration:.8, delay:.1, ease:'power3.out' });
    gs.from('.hero-content .btn',{ y:20, opacity:0, duration:.7, delay:.2, stagger:.06, ease:'power3.out' });

    const reveal = (selector) => {
      gs.utils.toArray(selector).forEach(el=>{
        gs.from(el,{ y:30, opacity:0, duration:.8, ease:'power3.out', scrollTrigger:{ trigger:el, start:'top 80%' } });
      });
    };
    reveal('.section-head, .bio .tile, .bio .content, #flyers .ticker-shell');

    setupShowReveals = () => {
      if (!window.ScrollTrigger) return;
      window.ScrollTrigger.getAll().forEach(st => { if (st.vars?.id?.startsWith?.('show-')) st.kill(); });
      gs.utils.toArray('#showsWrap .show').forEach((card,i)=>{
        gs.from(card,{ y:40, opacity:0, duration:.7, ease:'power2.out', scrollTrigger:{ id:`show-${i}`, trigger:card, start:'top 85%' } });
        gs.to(card,{ y:-8, ease:'none', scrollTrigger:{ trigger:card, start:'top bottom', end:'bottom top', scrub:true } });
      });
    };
    setupShowReveals();

    // Ticker animation after images load
    const ticker = $('#ticker');
    const totalWidth = () => Array.from(ticker?.children ?? []).reduce((w,el)=>w+el.offsetWidth+16,0);
    const waitForImages = (container)=>new Promise(resolve=>{
      const imgs = $$('img', container); if(!imgs.length) return resolve();
      let done = 0; const check = ()=>{ if(++done===imgs.length) resolve(); };
      imgs.forEach(img => img.complete ? check() : img.addEventListener('load', check, { once:true }));
    });
    const startMarquee = async () => {
      if (!ticker) return;
      await waitForImages(ticker);
      const w = Math.max(1,totalWidth());
      gs.set(ticker,{ x:0 });
      const tl = gs.timeline({ repeat:-1, defaults:{ ease:'none' } });
      tl.to(ticker,{ duration:30, x:-w/2 });
      ticker.addEventListener('mouseenter', ()=>tl.pause());
      ticker.addEventListener('mouseleave', ()=>tl.resume());
    };
    startMarquee();

    // Videos: reveal + subtle tilt
    gs.utils.toArray('.video-card').forEach((v,i)=>{
      gs.from(v,{ y:40, opacity:0, duration:.8, ease:'power3.out', scrollTrigger:{ trigger:v, start:'top 85%' } });
      gs.to(v,{ rotate:i%2?-1.2:1.2, y:-6, ease:'none', scrollTrigger:{ trigger:v, start:'top bottom', end:'bottom top', scrub:true } });
    });
  }

  // Mailing list form
  const mailingForm = $('#mailingForm');
  if (mailingForm) {
    const statusEl = $('#mailingStatus');
    const submitBtn = mailingForm.querySelector('button[type="submit"]');
    const setStatus = (message, type) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.remove('success', 'error');
      if (type) statusEl.classList.add(type);
    };
    mailingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!mailingForm.checkValidity()) {
        mailingForm.reportValidity?.();
        return;
      }
      if (!mailingForm.action || mailingForm.action.includes('your-mailing-list-id')) {
        setStatus('Update the form action with your mailing list endpoint to start collecting signups.', 'error');
        return;
      }
      const originalLabel = submitBtn?.textContent;
      submitBtn?.setAttribute('disabled', 'true');
      if (submitBtn) submitBtn.textContent = 'Joining...';
      setStatus('Signing you up...', '');
      try {
        const formData = new FormData(mailingForm);
        const response = await fetch(mailingForm.action, {
          method: mailingForm.method || 'POST',
          body: formData,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        setStatus('Thanks! Check your inbox to confirm your subscription.', 'success');
        mailingForm.reset();
      } catch (error) {
        console.error(error);
        setStatus('Unable to subscribe right now. Please try again or email info@dreadarchiejr.com.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel ?? 'Join the List';
        }
      }
    });
  }
})();
