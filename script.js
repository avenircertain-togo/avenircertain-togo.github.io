/* ============================================================
   EPAC — script.js
   Loads ALL content from content/site.json, renders every section,
   and wires up modern interactions. Pure vanilla JavaScript.
   v3.0 — Enhanced with Projets, Donation, Blog & Button Navigation
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  }

  /** Generate an SVG placeholder data-URL for missing or broken images */
  function placeholderSVG(w, h, label) {
    const text = label || 'Image';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="%23EBE7DE"/>
          <stop offset="100%" stop-color="%23DBD5C8"/>
        </linearGradient>
      </defs>
      <rect fill="url(%23g)" width="${w}" height="${h}"/>
      <circle cx="${w / 2}" cy="${h / 2 - 18}" r="22" fill="%23C8A84E" opacity="0.4"/>
      <text x="50%" y="${h / 2 + 20}" dominant-baseline="middle" text-anchor="middle"
            font-family="Inter,system-ui,sans-serif" font-weight="600" font-size="14" fill="%23141B2D"
            letter-spacing=".5">${text}</text>
    </svg>`;
    return `data:image/svg+xml,${svg}`;
  }

  /** Attach onerror fallback to an image element */
  function withFallback(img, label) {
    img.onerror = function () {
      this.onerror = null;
      this.src = placeholderSVG(
        this.width || 600,
        this.height || 400,
        label || 'EPAC Togo'
      );
      this.classList.add('img-placeholder');
    };
  }

  /* SVG icons (inline to avoid external dependencies) */
  const ICONS = {
    facebook: `<svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.7.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.63-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19 31.7 31.7 0 000 12a31.7 31.7 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.7 31.7 0 0024 12a31.7 31.7 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.7 4.58v-7.1a8.16 8.16 0 004.74 1.52v-3.45a4.85 4.85 0 01-1-.06z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24"><path d="M17.47 14.38c-.29-.14-1.7-.84-1.96-.93-.27-.1-.46-.14-.66.14-.2.29-.76.93-.93 1.12-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.33-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.44.13-.59.13-.13.29-.34.43-.51.15-.17.2-.29.29-.49.1-.2.05-.36-.02-.51-.07-.14-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.36s-1.02 1-1.02 2.44 1.05 2.83 1.19 3.02c.15.2 2.06 3.14 4.98 4.41.7.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.27-.19-.56-.34z"/><path d="M20.52 3.48A11.93 11.93 0 0012.05 0C5.49 0 .13 5.35.13 11.93a11.88 11.88 0 001.6 5.96L0 24l6.3-1.65a11.9 11.9 0 005.74 1.46h.01c6.55 0 11.92-5.35 11.93-11.93a11.87 11.87 0 00-3.46-8.4zM12.05 21.78a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.88 9.88 0 01-1.51-5.24c0-5.46 4.44-9.9 9.9-9.9a9.83 9.83 0 017 2.9 9.83 9.83 0 012.89 7c-.01 5.46-4.45 9.9-9.91 9.9z"/></svg>`
  };

  /* ---------- Fetch Data & Bootstrap ---------- */
  fetch('content/site.json')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(data => {
      render(data);
      initInteractions();
      hideLoader();
    })
    .catch(err => {
      console.error('Erreur de chargement du site :', err);
      hideLoader();
      document.body.innerHTML = `
        <div style="padding:4rem 2rem;text-align:center;font-family:Inter,sans-serif;max-width:540px;margin:auto;">
          <p style="font-size:3.5rem;margin-bottom:1rem;">⚠️</p>
          <h1 style="font-size:1.6rem;margin-bottom:.5rem;color:#141B2D;">Contenu en cours de chargement</h1>
          <p style="color:#6B6560;line-height:1.6;">Vérifiez que le fichier <code>content/site.json</code> est bien accessible sur votre serveur.</p>
        </div>`;
    });

  /* ============================================================
     RENDER
     ============================================================ */
  function render(data) {
    const { site, hero, stats, mission, programmes, projets, donation, articles, blog, videos, downloads, testimonials, contact, footer } = data;

    /* --- Site / Header / Brand --- */
    const logoImg = $('#header-logo');
    if (logoImg && site.logo) {
      logoImg.src = site.logo;
      logoImg.alt = site.name;
      withFallback(logoImg, 'EPAC');
    }

    const headerName = $('#header-name');
    if (headerName) {
      headerName.textContent = site.name;
    }

    // Navigation buttons (Desktop >= 1160px & Mobile Drawer)
    const navList = $('#nav-list');
    const mobileNavList = $('#mobile-nav-list');
    const NAV_ICONS = {
      '#accueil': '🏠',
      '#mission': '🎯',
      '#programmes': '📚',
      '#projets': '🏗️',
      '#articles': '📰',
      '#blog': '✍️',
      '#donation': '💛',
      '#contact': '✉️'
    };

    if (site.nav) {
      if (navList) {
        navList.innerHTML = '';
        site.nav.forEach(item => {
          const li = document.createElement('li');
          li.className = 'header__nav-item' + (item.isCta ? ' header__nav-item--cta' : '');

          if (item.isCta) {
            li.innerHTML = `
              <a href="${item.href}" class="nav-btn nav-btn--donate">
                <span class="nav-btn__heart">💛</span>
                <span>${item.label}</span>
              </a>`;
          } else {
            li.innerHTML = `<a href="${item.href}" class="nav-btn">${item.label}</a>`;
          }
          navList.appendChild(li);
        });
      }

      if (mobileNavList) {
        mobileNavList.innerHTML = '';
        site.nav.forEach(item => {
          const li = document.createElement('li');
          li.className = 'mobile-drawer__item';
          const icon = NAV_ICONS[item.href] || '•';

          if (item.isCta) {
            li.innerHTML = `
              <a href="${item.href}" class="mobile-drawer__btn mobile-drawer__btn--donate">
                <span class="nav-btn__heart">💛</span>
                <span>${item.label}</span>
                <span style="margin-left:auto;font-size:0.7rem;padding:2px 8px;border-radius:10px;background:rgba(20,27,45,0.14);font-weight:700;">Priorité</span>
              </a>`;
          } else {
            li.innerHTML = `
              <a href="${item.href}" class="mobile-drawer__btn">
                <span class="mobile-drawer__icon">${icon}</span>
                <span>${item.label}</span>
                <span style="margin-left:auto;opacity:0.35;font-size:0.85rem;">&rarr;</span>
              </a>`;
          }
          mobileNavList.appendChild(li);
        });
      }
    }

    document.title = site.name + ' — ' + (site.tagline || 'Togo');

    /* --- Hero --- */
    if (hero) {
      const heroImg = $('#hero-img');
      if (heroImg) {
        heroImg.src = hero.image;
        heroImg.alt = hero.imageAlt || 'EPAC Togo';
        withFallback(heroImg, 'Enfants du Togo — EPAC');
      }
      if ($('#hero-headline')) $('#hero-headline').textContent = hero.headline;
      if ($('#hero-sub')) $('#hero-sub').textContent = hero.subheadline;

      const ctaEl = $('#hero-cta');
      if (ctaEl && hero.cta) {
        ctaEl.href = hero.cta.href;
        if ($('#hero-cta-text')) $('#hero-cta-text').textContent = hero.cta.text;
      }
      const cta2El = $('#hero-cta2');
      if (cta2El && hero.ctaSecondary) {
        cta2El.textContent = hero.ctaSecondary.text;
        cta2El.href = hero.ctaSecondary.href;
      }
    }

    /* --- Stats --- */
    const statsRibbon = $('#stats-ribbon');
    if (statsRibbon && stats) {
      statsRibbon.innerHTML = '';
      stats.forEach(s => {
        const div = document.createElement('div');
        div.className = 'stat reveal';
        div.innerHTML = `
          <span class="stat__value" data-target="${s.value}" data-suffix="${s.suffix || ''}">0${s.suffix || ''}</span>
          <span class="stat__label">${s.label}</span>`;
        statsRibbon.appendChild(div);
      });
    }

    /* --- Mission --- */
    if (mission) {
      if ($('#mission-title')) $('#mission-title').textContent = mission.title;
      if ($('#mission-verse')) $('#mission-verse').textContent = mission.verse;
      const mBlocks = $('#mission-blocks');
      if (mBlocks && mission.blocks) {
        mBlocks.innerHTML = '';
        mission.blocks.forEach(b => {
          const div = document.createElement('div');
          div.className = 'mission__block reveal';
          const img = document.createElement('img');
          img.src = b.image;
          img.alt = b.imageAlt || b.title;
          img.loading = 'lazy';
          withFallback(img, b.title);

          div.innerHTML = `
            <div class="mission__block-img"></div>
            <div class="mission__block-text">
              <span class="mission__block-badge">Pilier d'action</span>
              <h3>${b.title}</h3>
              <p>${b.text}</p>
            </div>`;
          div.querySelector('.mission__block-img').appendChild(img);
          mBlocks.appendChild(div);
        });
      }
    }

    /* --- Programmes (Bento Grid) --- */
    if (programmes) {
      if ($('#prog-title')) $('#prog-title').textContent = programmes.title;
      if ($('#prog-sub')) $('#prog-sub').textContent = programmes.subtitle;
      const bento = $('#prog-grid');
      if (bento && programmes.items) {
        bento.innerHTML = '';
        programmes.items.forEach(p => {
          const div = document.createElement('div');
          let sizeClass = '';
          if (p.size === 'large')  sizeClass = ' bento__tile--large';
          if (p.size === 'medium') sizeClass = ' bento__tile--medium';
          div.className = `bento__tile${sizeClass} reveal`;
          div.innerHTML = `
            <span class="bento__icon">${p.icon}</span>
            <h3>${p.title}</h3>
            <p>${p.text}</p>`;
          bento.appendChild(div);
        });
      }
    }

    /* --- Projets Phares --- */
    if (projets) {
      if ($('#proj-title')) $('#proj-title').textContent = projets.title;
      if ($('#proj-sub')) $('#proj-sub').textContent = projets.subtitle;
      const projGrid = $('#proj-grid');
      if (projGrid && projets.items) {
        projGrid.innerHTML = '';
        projets.items.forEach(item => {
          const card = document.createElement('div');
          card.className = 'project-card reveal';
          const img = document.createElement('img');
          img.className = 'project-card__img';
          img.src = item.image;
          img.alt = item.imageAlt || item.title;
          img.loading = 'lazy';
          withFallback(img, item.title);

          card.innerHTML = `
            <div class="project-card__media">
              <span class="project-card__tag">${item.category}</span>
            </div>
            <div class="project-card__body">
              <div class="project-card__status">
                <span class="status-dot"></span>
                <span>${item.status}</span>
              </div>
              <h3 class="project-card__title">${item.title}</h3>
              <p class="project-card__desc">${item.description}</p>
              
              <div class="project-card__progress-wrap">
                <div class="project-card__progress-bar">
                  <div class="project-card__progress-fill" style="width: ${item.progress}%"></div>
                </div>
                <div class="project-card__meta">
                  <span><strong>${item.raised}</strong></span>
                  <span>Objectif : ${item.target}</span>
                </div>
              </div>
              <a href="#donation" class="btn btn--outline btn--sm btn--full" style="margin-top:1rem;">
                Participer à ce projet &rarr;
              </a>
            </div>`;
          card.querySelector('.project-card__media').appendChild(img);
          projGrid.appendChild(card);
        });
      }
    }

    /* --- Donation Section --- */
    if (donation) {
      const donImg = $('#don-img');
      if (donImg && donation.image) {
        donImg.src = donation.image;
        donImg.alt = donation.imageAlt || 'Donation EPAC Togo';
        withFallback(donImg, 'EPAC Togo — Donation');
      }
      if ($('#don-title')) $('#don-title').textContent = donation.title;
      if ($('#don-sub')) $('#don-sub').textContent = donation.subtitle;
      if ($('#don-verse')) $('#don-verse').textContent = donation.verse;

      const tiersGrid = $('#don-tiers');
      if (tiersGrid && donation.tiers) {
        tiersGrid.innerHTML = '';
        donation.tiers.forEach((t, i) => {
          const card = document.createElement('div');
          card.className = 'donation-tier reveal';
          card.innerHTML = `
            <div class="donation-tier__amount">
              <span class="donation-tier__val">${t.amount}</span>
              <span class="donation-tier__fcfa">${t.fcfa}</span>
            </div>
            <p class="donation-tier__impact">${t.impact}</p>
            <a href="#contact" class="btn btn--primary btn--sm btn--full" style="margin-top:auto;">
              Donner ${t.amount}
            </a>`;
          tiersGrid.appendChild(card);
        });
      }

      const methodsList = $('#don-methods');
      if (methodsList && donation.methods) {
        methodsList.innerHTML = '';
        donation.methods.forEach(m => {
          const div = document.createElement('div');
          div.className = 'donation-method';
          div.innerHTML = `
            <span class="donation-method__icon">${m.icon}</span>
            <div class="donation-method__content">
              <strong>${m.name}</strong>
              <p>${m.details}</p>
            </div>`;
          methodsList.appendChild(div);
        });
      }
    }

    /* --- Testimonials --- */
    if (testimonials) {
      const tTrack = $('#testimonial-track');
      const tDots  = $('#testimonial-dots');
      if (tTrack && tDots) {
        tTrack.innerHTML = '';
        tDots.innerHTML = '';
        testimonials.forEach((t, i) => {
          const div = document.createElement('div');
          div.className = 'testimonial';
          div.innerHTML = `
            <p class="testimonial__quote">${t.quote}</p>
            <span class="testimonial__author">${t.author}</span>
            <span class="testimonial__role">${t.role}</span>`;
          tTrack.appendChild(div);

          const dot = document.createElement('button');
          dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
          dot.setAttribute('aria-label', `Témoignage ${i + 1}`);
          dot.dataset.index = i;
          tDots.appendChild(dot);
        });
      }
    }

    /* --- Articles (Actualités) --- */
    if (articles) {
      if ($('#art-title')) $('#art-title').textContent = articles.title;
      if ($('#art-sub')) $('#art-sub').textContent = articles.subtitle;
      const artList = $('#art-list');
      if (artList && articles.items) {
        artList.innerHTML = '';
        articles.items.forEach(a => {
          const div = document.createElement('div');
          div.className = 'article-card reveal';
          const img = document.createElement('img');
          img.className = 'article-card__img';
          img.src = a.image;
          img.alt = a.imageAlt || a.title;
          img.loading = 'lazy';
          withFallback(img, 'EPAC Actualité');

          div.innerHTML = `
            <div class="article-card__body">
              <span class="article-card__date">${formatDate(a.date)}</span>
              <h3 class="article-card__title">${a.title}</h3>
              <p class="article-card__excerpt">${a.excerpt}</p>
            </div>`;
          div.insertBefore(img, div.firstChild);
          artList.appendChild(div);
        });
      }
    }

    /* --- Blog (Réflexions) --- */
    if (blog) {
      if ($('#blog-title')) $('#blog-title').textContent = blog.title;
      if ($('#blog-sub')) $('#blog-sub').textContent = blog.subtitle;
      const blogGrid = $('#blog-grid');
      if (blogGrid && blog.items) {
        blogGrid.innerHTML = '';
        blog.items.forEach(b => {
          const card = document.createElement('article');
          card.className = 'blog-card reveal';
          const img = document.createElement('img');
          img.className = 'blog-card__img';
          img.src = b.image;
          img.alt = b.imageAlt || b.title;
          img.loading = 'lazy';
          withFallback(img, b.title);

          card.innerHTML = `
            <div class="blog-card__media"></div>
            <div class="blog-card__body">
              <div class="blog-card__meta">
                <span class="blog-card__cat">${b.category}</span>
                <span class="blog-card__date">${formatDate(b.date)}</span>
              </div>
              <h3 class="blog-card__title">${b.title}</h3>
              <p class="blog-card__excerpt">${b.excerpt}</p>
              <div class="blog-card__author">
                <span>✍️ ${b.author}</span>
              </div>
            </div>`;
          card.querySelector('.blog-card__media').appendChild(img);
          blogGrid.appendChild(card);
        });
      }
    }

    /* --- Vidéos --- */
    if (videos) {
      if ($('#vid-title')) $('#vid-title').textContent = videos.title;
      if ($('#vid-sub')) $('#vid-sub').textContent = videos.subtitle;
      const vidScroll = $('#vid-scroll');
      if (vidScroll && videos.items) {
        vidScroll.innerHTML = '';
        videos.items.forEach(v => {
          const div = document.createElement('div');
          div.className = 'media-card reveal';
          const thumbImg = document.createElement('img');
          thumbImg.src = v.thumbnail;
          thumbImg.alt = v.title;
          thumbImg.loading = 'lazy';
          withFallback(thumbImg, '🎬 EPAC Togo');

          div.innerHTML = `
            <div class="media-card__video">
              <div class="media-card__play" data-embed="${v.embedUrl}" role="button" aria-label="Lire la vidéo : ${v.title}">
                <div class="media-card__play-circle">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
            <p class="media-card__title">${v.title}</p>`;
          const videoWrap = div.querySelector('.media-card__video');
          videoWrap.insertBefore(thumbImg, videoWrap.firstChild);
          vidScroll.appendChild(div);
        });
      }
    }

    /* --- Downloads --- */
    if (downloads) {
      if ($('#dl-title')) $('#dl-title').textContent = downloads.title;
      const dlList = $('#dl-list');
      if (dlList && downloads.items) {
        dlList.innerHTML = '';
        downloads.items.forEach(d => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a href="${d.file}" class="download-item reveal" download>
              <div class="download-item__icon">${d.type}</div>
              <div class="download-item__info">
                <h4>${d.title}</h4>
                <p>${d.description}</p>
              </div>
              <span class="download-item__meta">${d.size}</span>
            </a>`;
          dlList.appendChild(li);
        });
      }
    }

    /* --- Contact --- */
    if (contact) {
      if ($('#ct-title')) $('#ct-title').textContent = contact.title;
      if ($('#ct-sub')) $('#ct-sub').textContent = contact.subtitle;
      const ctDetails = $('#ct-details');
      if (ctDetails) {
        ctDetails.innerHTML = `
          <div class="contact__detail-row">
            <span class="contact__detail-icon">📧</span>
            <a href="mailto:${contact.email}">${contact.email}</a>
          </div>
          <div class="contact__detail-row">
            <span class="contact__detail-icon">📞</span>
            <a href="tel:${contact.phone.replace(/[^0-9+]/g, '')}">${contact.phone}</a>
          </div>
          <div class="contact__detail-row">
            <span class="contact__detail-icon">📍</span>
            <span>${contact.address}</span>
          </div>`;
      }

      const ctSocials = $('#ct-socials');
      if (ctSocials && contact.socials) {
        ctSocials.innerHTML = '';
        contact.socials.forEach(s => {
          const a = document.createElement('a');
          a.href = s.url;
          a.className = 'contact__social-link';
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.setAttribute('aria-label', s.platform);
          a.innerHTML = ICONS[s.icon] || s.platform;
          ctSocials.appendChild(a);
        });
      }
    }

    /* --- Footer --- */
    if (footer) {
      const footerLogo = $('#footer-logo');
      if (footerLogo && site.logo) {
        footerLogo.src = site.logo;
        footerLogo.alt = site.name;
        withFallback(footerLogo, 'EPAC');
      }
      if ($('#footer-verse')) $('#footer-verse').textContent = footer.verse;
      if ($('#footer-copy')) $('#footer-copy').textContent = footer.copyright;

      const fLinks = $('#footer-links');
      if (fLinks && site.nav) {
        fLinks.innerHTML = '';
        site.nav.forEach(item => {
          const a = document.createElement('a');
          a.href = item.href;
          a.textContent = item.label;
          fLinks.appendChild(a);
        });
      }
    }
  }

  /* ============================================================
     INTERACTIONS & ACCESSIBILITY
     ============================================================ */
  function initInteractions() {
    /* --- Mobile Drawer & Burger Interactions --- */
    const burger        = $('#burger');
    const bottomMenuBtn = $('#mobile-bottom-menu-btn');
    const drawer        = $('#mobile-drawer');
    const closeBtn      = $('#mobile-close');
    const overlay       = $('#overlay');

    function openMenu() {
      if (drawer) {
        drawer.classList.add('is-open');
        drawer.setAttribute('aria-hidden', 'false');
      }
      if (overlay) overlay.classList.add('is-visible');
      if (burger) {
        burger.classList.add('is-active');
        burger.setAttribute('aria-expanded', 'true');
      }
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      if (drawer) {
        drawer.classList.remove('is-open');
        drawer.setAttribute('aria-hidden', 'true');
      }
      if (overlay) overlay.classList.remove('is-visible');
      if (burger) {
        burger.classList.remove('is-active');
        burger.setAttribute('aria-expanded', 'false');
      }
      document.body.classList.remove('no-scroll');
    }

    if (burger) {
      burger.addEventListener('click', () => {
        const isOpen = drawer && drawer.classList.contains('is-open');
        isOpen ? closeMenu() : openMenu();
      });
    }

    if (bottomMenuBtn) {
      bottomMenuBtn.addEventListener('click', openMenu);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Close drawer when clicking any link inside it
    if (drawer) {
      $$('.mobile-drawer__btn, .mobile-drawer__foot a', drawer).forEach(a => {
        a.addEventListener('click', closeMenu);
      });
    }

    /* --- Header shadow on scroll & Back-to-top button --- */
    const header    = $('#header');
    const backToTop = $('#back-to-top');
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const top = window.scrollY;
          if (header) {
            header.classList.toggle('is-scrolled', top > 30);
          }
          if (backToTop) {
            backToTop.classList.toggle('is-visible', top > 400);
          }
          highlightNav();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* --- Active Navigation link on scroll (Desktop, Drawer & Mobile Bottom Bar) --- */
    const navLinks       = $$('.nav-btn');
    const bottomNavItems = $$('.mobile-bottom-bar__item[data-section]');
    const drawerLinks    = $$('.mobile-drawer__btn');
    const sections       = $$('section[id], header[id]');

    function highlightNav() {
      const scrollY = window.scrollY + 130;
      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          // Desktop buttons
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('is-active');
            } else if (!link.classList.contains('nav-btn--donate')) {
              link.classList.remove('is-active');
            }
          });
          // Mobile bottom bar items
          bottomNavItems.forEach(item => {
            const section = item.dataset.section;
            if (section === id) {
              item.classList.add('is-active');
            } else {
              item.classList.remove('is-active');
            }
          });
          // Drawer items
          drawerLinks.forEach(item => {
            const href = item.getAttribute('href');
            if (href === '#' + id) {
              item.classList.add('is-active');
            } else if (!item.classList.contains('mobile-drawer__btn--donate')) {
              item.classList.remove('is-active');
            }
          });
        }
      });
    }

    /* --- Scroll Reveal Animations --- */
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

      reveals.forEach(el => obs.observe(el));
    } else {
      reveals.forEach(el => el.classList.add('is-revealed'));
    }

    /* --- Animated Numbers (Stats) --- */
    const statValues = $$('.stat__value');
    if ('IntersectionObserver' in window && statValues.length) {
      let statsDone = false;
      const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !statsDone) {
            statsDone = true;
            statValues.forEach(el => animateValue(el));
            statsObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });

      const statsSection = $('#stats-ribbon');
      if (statsSection) statsObserver.observe(statsSection);
    }

    function animateValue(el) {
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      if (isNaN(target)) return;
      const duration = 1600;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = current.toLocaleString('fr-FR') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    /* --- Testimonials Carousel --- */
    const track = $('#testimonial-track');
    const dots  = $$('.testimonials__dot');
    const prevBtn = $('#testi-prev');
    const nextBtn = $('#testi-next');
    let currentIdx = 0;
    const totalSlides = dots.length;
    let autoplayTimer = null;

    function goToSlide(idx) {
      if (!track || totalSlides === 0) return;
      currentIdx = (idx + totalSlides) % totalSlides;
      track.style.transform = `translateX(-${currentIdx * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIdx));
    }

    function startAutoplay() {
      stopAutoplay();
      autoplayTimer = setInterval(() => goToSlide(currentIdx + 1), 6000);
    }
    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    if (totalSlides > 1) {
      dots.forEach(d => {
        d.addEventListener('click', () => {
          goToSlide(parseInt(d.dataset.index, 10));
          startAutoplay();
        });
      });

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          goToSlide(currentIdx - 1);
          startAutoplay();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          goToSlide(currentIdx + 1);
          startAutoplay();
        });
      }

      const carouselEl = $('#testimonials');
      if (carouselEl) {
        carouselEl.addEventListener('mouseenter', stopAutoplay);
        carouselEl.addEventListener('mouseleave', startAutoplay);

        // Touch swipe support
        let startX = 0;
        let diffX  = 0;
        carouselEl.addEventListener('touchstart', e => {
          startX = e.touches[0].clientX;
          diffX = 0;
          stopAutoplay();
        }, { passive: true });

        carouselEl.addEventListener('touchmove', e => {
          diffX = e.touches[0].clientX - startX;
        }, { passive: true });

        carouselEl.addEventListener('touchend', () => {
          if (Math.abs(diffX) > 40) {
            diffX < 0 ? goToSlide(currentIdx + 1) : goToSlide(currentIdx - 1);
          }
          startAutoplay();
        });
      }

      startAutoplay();
    }

    /* --- Video Play / Embed On-Demand --- */
    $$('.media-card__play').forEach(btn => {
      btn.addEventListener('click', function () {
        const embedUrl = this.dataset.embed;
        if (!embedUrl) return;
        const parent = this.closest('.media-card__video');
        if (!parent) return;

        const iframe = document.createElement('iframe');
        iframe.src = embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1';
        iframe.title = 'Lecteur vidéo';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.className = 'media-card__iframe';

        parent.innerHTML = '';
        parent.appendChild(iframe);
      });
    });

    /* --- Contact Form submission --- */
    const form = $('#contact-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn.textContent;
        btn.textContent = 'Envoi en cours…';
        btn.disabled = true;

        setTimeout(() => {
          form.innerHTML = `
            <div style="text-align:center;padding:2.5rem 1rem;">
              <span style="font-size:3rem;display:block;margin-bottom:1rem;">🙏</span>
              <h3 style="font-family:var(--ff-heading);font-size:1.4rem;color:var(--c-secondary);margin-bottom:.5rem;">
                Merci pour votre précieux message !
              </h3>
              <p style="color:var(--c-gray-600);line-height:1.6;">
                L'équipe d'Ensemble Pour un Avenir Certain (EPAC) vous répondra avec joie dans les meilleurs délais.
              </p>
            </div>`;
        }, 900);
      });
    }
  }

  /* ---------- Loader ---------- */
  function hideLoader() {
    const l = $('#loader');
    if (!l) return;
    l.classList.add('is-hidden');
    setTimeout(() => l.remove(), 400);
  }

})();
