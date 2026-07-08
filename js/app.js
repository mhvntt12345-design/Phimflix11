// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Check local storage init data first
    db.init();

    // Theme toggle
    setupThemeToggle();

    // Init routing & listen for hash changes
    window.addEventListener('hashchange', router);
    router();

    // Auth Form Toggles
    setupAuthFormToggles();

    // Register Forms
    setupAuthSubmissions();
    
    // Update login state button
    updateHeaderUserBtn();
});

// ---------------- HEADER USER STATE BUTTON ----------------
function updateHeaderUserBtn() {
    const userBtn = document.getElementById('loginBtn');
    if (!userBtn) return;

    const currentUser = db.getCurrentUser();
    if (currentUser) {
        userBtn.innerHTML = "<i class='bx bx-user-circle' style='color: var(--accent-primary)'></i>";
        userBtn.href = "#profile";
    } else {
        userBtn.innerHTML = "<i class='bx bx-user'></i>";
        userBtn.href = "#auth";
    }
}

// ---------------- THEME TOGGLE ----------------
function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');
    
    const savedTheme = localStorage.getItem('pf_theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    icon.className = savedTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';

    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('pf_theme', newTheme);
        icon.className = newTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    });
}

// ---------------- SPA ROUTER ----------------
let currentMovie = null;
let currentEp = null;

function formatNumber(num) {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function router() {
    const hash = window.location.hash || '#home';
    const views = document.querySelectorAll('.page-view');
    views.forEach(v => v.classList.remove('active'));

    // Scroll to top on navigation (instant, not smooth — smooth scroll causes jank)
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Pause player if leaving watch page
    const video = document.getElementById('mainVideo');
    if (video && !hash.startsWith('#watch')) {
        try {
            if (!video.paused) {
                video.pause();
            }
        } catch(e) {
            console.error(e);
        }
    }

    // Highlight nav link
    const navItems = document.querySelectorAll('.nav-link-item');
    navItems.forEach(item => item.classList.remove('active'));

    if (hash === '#home') {
        document.getElementById('home-view').classList.add('active');
        document.querySelector('.nav-link-item[href="#home"]').classList.add('active');
        // Only init home once, avoid rebuilding entire DOM every navigation
        if (!window._homeInited) {
            initHome();
            window._homeInited = true;
        }
    } 
    else if (hash.startsWith('#list/')) {
        document.getElementById('list-view').classList.add('active');
        const type = hash.split('/')[1];
        
        // Highlight correct type menu
        const menuActive = document.querySelector(`.nav-link-item[href="#list/${type}"]`);
        if (menuActive) menuActive.classList.add('active');

        initList(type);
    } 
    else if (hash.startsWith('#search')) {
        document.getElementById('search-view').classList.add('active');
        const navItem = document.querySelector('.nav-link-item[href="#search"]');
        if (navItem) navItem.classList.add('active');
        initSearch();
    } 
    else if (hash.startsWith('#detail/')) {
        document.getElementById('detail-view').classList.add('active');
        const movieId = parseInt(hash.split('/')[1]);
        initDetail(movieId);
    } 
    else if (hash.startsWith('#watch/')) {
        document.getElementById('watch-view').classList.add('active');
        const params = hash.split('/');
        const movieId = parseInt(params[1]);
        const epStr = params[2] || '1';
        const epId = parseInt(epStr);
        let serverIdx = 0;
        if (epStr.includes('?server=')) {
            serverIdx = parseInt(epStr.split('?server=')[1]) || 0;
        }
        initWatch(movieId, epId, serverIdx);
        window.scrollTo(0, 0);
    } 
    else if (hash === '#profile') {
        const currentUser = db.getCurrentUser();
        if (!currentUser) {
            window.location.hash = '#auth';
            return;
        }
        document.getElementById('profile-view').classList.add('active');
        initProfile();
    } 
    else if (hash === '#auth') {
        const currentUser = db.getCurrentUser();
        if (currentUser) {
            window.location.hash = '#profile';
            return;
        }
        document.getElementById('auth-view').classList.add('active');
    }
}

// ---------------- 1. HOME INITIALIZATION ----------------
function initHome() {
    const movies = db.getMovies();
    if (movies.length === 0) return;

    let featured = movies.filter(m => m.featured && m.visible);
    if (featured.length === 0) {
        // Fallback: take the newest 5 movies that have a banner image
        featured = [...movies]
            .filter(m => m.visible && (m.banner || m.poster))
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);
    }
    
    const heroSlider = document.getElementById('heroSlider');

    if (featured.length === 0) {
        // No movies to feature — collapse hero slider to remove blank space
        if (heroSlider) heroSlider.style.display = 'none';
    } else if (featured.length > 0 && heroSlider) {
        heroSlider.style.display = '';  // make sure it's visible
        const allGenres = db.getGenres();

        function getGenreNames(movie) {
            if (!movie.genres || !movie.genres.length) return [];
            return movie.genres.slice(0, 3).map(gId => {
                const g = allGenres.find(x => x.id === gId);
                return g ? g.name : '';
            }).filter(Boolean);
        }

        function getEpLabel(movie) {
            if (movie.type === 'phim-le' || movie.type === 'phim-chieu-rap') return 'Phim lẻ';
            const eps = movie.episodes || [];
            return eps.length ? 'Tập ' + eps.length : 'Phần 1';
        }

        // ── DESKTOP slides ──
        const gradientBgs = [
            'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #0f0a2e 100%)',
            'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
            'linear-gradient(135deg, #16213e 0%, #0f3460 50%, #533483 100%)',
            'linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        ];

        const desktopHtml = featured.map((movie, index) => {
            const genreNames = getGenreNames(movie);
            const epLabel    = getEpLabel(movie);
            const thumbsHtml = featured.map((m, ti) =>
                '<div class="hero-thumb-item ' + (ti === index ? 'active-thumb' : '') + '" data-slide="' + ti + '" title="' + m.title + '">' +
                    '<img src="' + m.poster + '" alt="' + m.title + '" loading="lazy">' +
                '</div>'
            ).join('');
            const bannerUrl = movie.banner || movie.poster || '';
            const fallbackBg = gradientBgs[index % gradientBgs.length];
            const bgStyle = bannerUrl
                ? `background-image: url('${bannerUrl}'); background-color: transparent;`
                : `background: ${fallbackBg};`;
            return (
                '<div class="hero-slide desktop-only ' + (index === 0 ? 'active' : '') + '">' +
                    '<div class="desktop-bg" style="' + bgStyle + '"></div>' +
                    '<div class="hero-overlay"></div>' +
                    '<div class="hero-content">' +
                        '<div class="hero-info">' +
                            '<h1 class="hero-title">' + movie.title + '</h1>' +
                            '<p class="hero-original-title">' + (movie.originalTitle || '') + '</p>' +
                            '<div class="hero-meta">' +
                                '<span class="meta-item imdb-badge"><i class=\'bx bxs-star\'></i> IMDb ' + (movie.imdb || 'N/A') + '</span>' +
                                '<span class="meta-item age-badge">16+</span>' +
                                '<span class="meta-item">' + movie.year + '</span>' +
                                '<span class="meta-item">' + epLabel + '</span>' +
                                (movie.quality ? '<span class="meta-item">' + movie.quality + '</span>' : '') +
                            '</div>' +
                            (genreNames.length ? '<div class="hero-genre-tags">' + genreNames.map(n => '<span class="hero-genre-tag">' + n + '</span>').join('') + '</div>' : '') +
                            '<p class="hero-desc">' + (movie.description || '').substring(0, 180) + '...</p>' +
                            '<div class="hero-buttons">' +
                                '<a href="#watch/' + movie.id + '/1" class="btn btn-primary"><i class=\'bx bx-play\'></i> Xem phim</a>' +
                                '<a href="#detail/' + movie.id + '" class="btn btn-secondary"><i class=\'bx bx-info-circle\'></i> Thông tin</a>' +
                            '</div>' +
                        '</div>' +
                        '<div class="hero-thumbs">' + thumbsHtml + '</div>' +
                    '</div>' +
                '</div>'
            );
        }).join('');

        // ── Mobile 3D carousel ──
        const firstMovie = featured[0];
        const mobileCardsHtml = featured.map((m, i) => {
            let pos = 'pos-hidden';
            if (i === 0) pos = 'pos-center';
            else if (i === 1) pos = 'pos-right';
            else if (i === featured.length - 1) pos = 'pos-left';
            return (
                '<div class="mobile-poster-card ' + pos + '" data-index="' + i + '" data-id="' + m.id + '">' +
                    '<img src="' + m.poster + '" alt="' + m.title + '" loading="lazy">' +
                '</div>'
            );
        }).join('');

        const dotsHtml = featured.map((_, i) =>
            '<span class="hero-dot ' + (i === 0 ? 'active' : '') + '" data-dot="' + i + '"></span>'
        ).join('');

        const mobileSlideHtml = (
            '<div class="hero-slide mobile-only">' +
                '<div class="mobile-carousel-track" id="mobileCarouselTrack">' + mobileCardsHtml + '</div>' +
                '<div class="mobile-hero-info" id="mobileHeroInfo">' +
                    '<h2 class="mobile-hero-title" id="mobileHeroTitle">' + firstMovie.title + '</h2>' +
                    '<p class="mobile-hero-original" id="mobileHeroOriginal">' + (firstMovie.originalTitle || '') + '</p>' +
                    '<div class="mobile-hero-btns">' +
                        '<a href="#watch/' + firstMovie.id + '/1" class="btn btn-primary" id="mobileHeroBtnPlay"><i class=\'bx bx-play\'></i> Xem phim</a>' +
                        '<a href="#detail/' + firstMovie.id + '" class="btn btn-secondary" id="mobileHeroBtnInfo"><i class=\'bx bx-info-circle\'></i> Thông tin</a>' +
                    '</div>' +
                    '<div class="mobile-hero-meta" id="mobileHeroMeta">' +
                        '<span class="meta-item age-badge">16+</span>' +
                        '<span class="meta-item">' + firstMovie.year + '</span>' +
                        '<span class="meta-item">Phần 1</span>' +
                        '<span class="meta-item">' + getEpLabel(firstMovie) + '</span>' +
                    '</div>' +
                    '<p class="mobile-hero-desc" id="mobileHeroDesc">' + (firstMovie.description || '').substring(0, 160) + '...</p>' +
                '</div>' +
                '<div class="hero-dots" id="heroDots">' + dotsHtml + '</div>' +
            '</div>'
        );

        heroSlider.innerHTML = desktopHtml + mobileSlideHtml;

        // ── Desktop auto-slide ──
        const desktopSlides = Array.from(heroSlider.querySelectorAll('.hero-slide.desktop-only'));
        let currentSlide = 0;

        function goToSlide(idx) {
            desktopSlides[currentSlide].classList.remove('active');
            currentSlide = ((idx % desktopSlides.length) + desktopSlides.length) % desktopSlides.length;
            desktopSlides[currentSlide].classList.add('active');
            // Sync thumb highlights
            heroSlider.querySelectorAll('.hero-thumb-item').forEach((t, ti) => {
                t.classList.toggle('active-thumb', ti === currentSlide);
            });
        }

        heroSlider.querySelectorAll('.hero-thumb-item').forEach(thumb => {
            thumb.addEventListener('click', () => {
                clearInterval(window.bannerInterval);
                goToSlide(parseInt(thumb.dataset.slide));
                startDesktopAuto();
            });
        });

        function startDesktopAuto() {
            clearInterval(window.bannerInterval);
            window.bannerInterval = setInterval(() => goToSlide(currentSlide + 1), 5500);
        }
        startDesktopAuto();

        // ── Mobile 3D carousel ──
        const cards = Array.from(heroSlider.querySelectorAll('.mobile-poster-card'));
        const dots  = Array.from(heroSlider.querySelectorAll('.hero-dot'));
        let mobileIdx = 0;
        const n = featured.length;

        function updateMobile(newIdx) {
            mobileIdx = ((newIdx % n) + n) % n;
            cards.forEach((card, ci) => {
                const diff = ((ci - mobileIdx) % n + n) % n;
                let pos;
                if      (diff === 0)     pos = 'pos-center';
                else if (diff === 1)     pos = 'pos-right';
                else if (diff === n - 1) pos = 'pos-left';
                else if (diff === 2)     pos = 'pos-far-right';
                else if (diff === n - 2) pos = 'pos-far-left';
                else                     pos = 'pos-hidden';
                card.className = 'mobile-poster-card ' + pos;
            });
            dots.forEach((d, di) => d.classList.toggle('active', di === mobileIdx));

            const mv = featured[mobileIdx];
            const titleEl  = document.getElementById('mobileHeroTitle');
            const origEl   = document.getElementById('mobileHeroOriginal');
            const playBtn  = document.getElementById('mobileHeroBtnPlay');
            const infoBtn  = document.getElementById('mobileHeroBtnInfo');
            const metaEl   = document.getElementById('mobileHeroMeta');
            const descEl   = document.getElementById('mobileHeroDesc');
            const infoWrap = document.getElementById('mobileHeroInfo');
            if (titleEl)  titleEl.textContent  = mv.title;
            if (origEl)   origEl.textContent   = mv.originalTitle || '';
            if (playBtn)  playBtn.href = '#watch/' + mv.id + '/1';
            if (infoBtn)  infoBtn.href = '#detail/' + mv.id;
            if (descEl)   descEl.textContent   = (mv.description || '').substring(0, 160) + '...';
            if (metaEl)   metaEl.innerHTML =
                '<span class="meta-item age-badge">16+</span>' +
                '<span class="meta-item">' + mv.year + '</span>' +
                '<span class="meta-item">Phần 1</span>' +
                '<span class="meta-item">' + getEpLabel(mv) + '</span>';
            // Slide-in animation
            if (infoWrap) { infoWrap.style.animation = 'none'; infoWrap.offsetHeight; infoWrap.style.animation = ''; }
        }

        // Touch swipe
        const track = document.getElementById('mobileCarouselTrack');
        if (track) {
            let touchStartX = 0;
            track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
            track.addEventListener('touchend', e => {
                const dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) {
                    clearInterval(window.mobileSliderInterval);
                    updateMobile(dx < 0 ? mobileIdx + 1 : mobileIdx - 1);
                    startMobileAuto();
                }
            }, { passive: true });
        }

        // Click card
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const ci = parseInt(card.dataset.index);
                if (ci !== mobileIdx) {
                    clearInterval(window.mobileSliderInterval);
                    updateMobile(ci);
                    startMobileAuto();
                } else {
                    window.location.hash = '#detail/' + card.dataset.id;
                }
            });
        });

        // Click dot
        dots.forEach((dot, di) => {
            dot.addEventListener('click', () => {
                clearInterval(window.mobileSliderInterval);
                updateMobile(di);
                startMobileAuto();
            });
        });

        function startMobileAuto() {
            clearInterval(window.mobileSliderInterval);
            window.mobileSliderInterval = setInterval(() => updateMobile(mobileIdx + 1), 4500);
        }
        startMobileAuto();
    }

    // Genre Scroll Bar
    const genreBar = document.getElementById('homeGenreBar');
    if (genreBar) {
        const genres = db.getGenres();
        window.renderGenreBar = function(showAll = false) {
            const gradients = [
                'linear-gradient(135deg, rgba(250, 204, 21, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%)',
                'linear-gradient(135deg, rgba(45, 212, 191, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%)',
                'linear-gradient(135deg, rgba(129, 140, 248, 0.05) 0%, rgba(192, 132, 252, 0.05) 100%)',
                'linear-gradient(135deg, rgba(251, 113, 133, 0.05) 0%, rgba(225, 29, 72, 0.05) 100%)',
                'linear-gradient(135deg, rgba(52, 211, 153, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
                'linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
                'linear-gradient(135deg, rgba(244, 114, 182, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%)',
                'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(217, 119, 6, 0.05) 100%)'
            ];
            
            const limit = 6;
            const displayGenres = showAll ? genres : genres.slice(0, limit);
            const hiddenCount = genres.length - limit;
            
            let html = displayGenres.map((g, i) => {
                const bg = gradients[i % gradients.length];
                return `
                <div class="topic-card" style="background: ${bg}" onclick="if(!window.isDraggingGenre) goToGenreSearch('${g.slug}')">
                    <h4 class="topic-title">${g.name}</h4>
                    <span class="topic-link">Xem toàn bộ <i class='bx bx-chevron-right'></i></span>
                </div>
                `;
            }).join('');
            
            const titleEl = document.getElementById('topicSectionTitle');
            if (titleEl) {
                titleEl.textContent = showAll ? 'Các chủ đề' : 'Bạn đang quan tâm gì?';
            }
            
            if (!showAll && hiddenCount > 0) {
                html += `
                <div class="topic-card-more" onclick="if(!window.isDraggingGenre) renderGenreBar(true)">
                    +${hiddenCount} chủ đề
                </div>
                `;
            } else if (showAll && hiddenCount > 0) {
                html += `
                <div class="topic-card-more" onclick="if(!window.isDraggingGenre) { renderGenreBar(false); }">
                    Thu gọn
                </div>
                `;
            }
            
            genreBar.innerHTML = html;
        };
        
        renderGenreBar(false);

        // Desktop mouse wheel scroll
        genreBar.onwheel = function(evt) {
            if (evt.deltaY !== 0) {
                evt.preventDefault();
                genreBar.scrollLeft += evt.deltaY > 0 ? 150 : -150;
            }
        };

        // Desktop drag to scroll
        genreBar.onmousedown = (e) => {
            genreBar.isDown = true;
            genreBar.style.cursor = 'grabbing';
            genreBar.startX = e.pageX - genreBar.offsetLeft;
            genreBar.scrollLeftStart = genreBar.scrollLeft;
            window.isDraggingGenre = false;
        };
        genreBar.onmouseleave = () => {
            genreBar.isDown = false;
            genreBar.style.cursor = 'grab';
        };
        genreBar.onmouseup = () => {
            genreBar.isDown = false;
            genreBar.style.cursor = 'grab';
            setTimeout(() => window.isDraggingGenre = false, 50);
        };
        genreBar.onmousemove = (e) => {
            if (!genreBar.isDown) return;
            e.preventDefault();
            const x = e.pageX - genreBar.offsetLeft;
            const walk = (x - genreBar.startX) * 2;
            if (Math.abs(walk) > 10) window.isDraggingGenre = true;
            genreBar.scrollLeft = genreBar.scrollLeftStart - walk;
        };
        genreBar.style.cursor = 'grab';
    }

    // Cache sorted movies to avoid re-sorting on every home render
    const allVisible = movies.filter(m => m.visible).sort((a, b) => {
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : a.id);
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : b.id);
        return timeB - timeA;
    });
    
    // Use requestIdleCallback to defer non-critical carousels
    renderCarousel(allVisible, 'newMovies');
    renderCarousel([...allVisible].sort((a,b) => b.views - a.views), 'trendingMovies');
    
    const deferCarousels = () => {
        renderCarousel(allVisible.filter(m => m.type === 'phim-le'), 'singleMovies');
        renderCarousel(allVisible.filter(m => m.type === 'phim-bo'), 'seriesMovies');
        renderCarousel(allVisible.filter(m => (m.genres || []).includes(1)), 'actionMovies');
        renderCarousel(allVisible.filter(m => m.type === 'anime'), 'animeMovies');
    };
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(deferCarousels, { timeout: 1000 });
    } else {
        setTimeout(deferCarousels, 0);
    }
}

window.goToGenreSearch = function(genreSlug) {
    localStorage.setItem('pf_filterGenre', genreSlug);
    window.location.hash = '#search';
};

function renderCarousel(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const section = container.closest('.movie-section');

    if (!movies || movies.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }
    
    if (section) section.style.display = ''; // Ensure it's visible if it has items

    const carouselHtml = movies.slice(0, 24).map(movie => {
        const bannerSrc = movie.banner && movie.banner.startsWith('http') ? movie.banner 
                     : movie.poster && movie.poster.startsWith('http') ? movie.poster 
                     : 'https://via.placeholder.com/480x270/111827/6366f1?text=No+Image';
        const posterSrc = movie.poster && movie.poster.startsWith('http') ? movie.poster 
                     : bannerSrc;
                     
        return `
        <a href="#detail/${movie.id}" class="landscape-card">
            <div class="landscape-img-wrapper">
                <img src="${bannerSrc}" class="img-landscape" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/480x270/111827/6366f1?text=${encodeURIComponent(movie.title)}'">
                <img src="${posterSrc}" class="img-portrait" alt="${movie.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x420/111827/6366f1?text=${encodeURIComponent(movie.title)}'">
                <div class="landscape-badge">${movie.episode || movie.quality || 'Full'}</div>
            </div>
            <div class="landscape-info">
                <div class="landscape-title">${movie.title}</div>
                <div class="landscape-subtitle">${movie.year} &bull; ${movie.type === 'phim-le' ? 'Phim Lẻ' : movie.type === 'phim-bo' ? 'Phim Bộ' : movie.type === 'anime' ? 'Anime' : 'TV Show'}</div>
            </div>
        </a>
    `}).join('');

    container.innerHTML = `
        <div class="movie-carousel-wrapper">
            <button class="carousel-btn left" onclick="document.getElementById('carousel-${containerId}').scrollBy({left: -620, behavior: 'smooth'})"><i class='bx bx-chevron-left'></i></button>
            <div class="movie-carousel" id="carousel-${containerId}">
                ${carouselHtml}
            </div>
            <button class="carousel-btn right" onclick="document.getElementById('carousel-${containerId}').scrollBy({left: 620, behavior: 'smooth'})"><i class='bx bx-chevron-right'></i></button>
        </div>
    `;
    
    // Remove the grid class to avoid conflicts
    container.classList.remove('movie-grid');
}

function renderGrid(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = movies.slice(0, 12).map(movie => `
        <a href="#detail/${movie.id}" class="movie-card">
            <div class="card-img-wrapper">
                <img src="${movie.poster}" alt="${movie.title}" class="card-img" loading="lazy">
                <div class="card-overlay"><i class='bx bx-play-circle play-icon'></i></div>
                <div class="card-badges">
                    <span class="badge quality">${movie.quality}</span>
                </div>
            </div>
            <div class="card-info">
                <h3 class="card-title">${movie.title}</h3>
                <div class="card-meta">
                    <span>${movie.year}</span>
                    <span><i class='bx bxs-star'></i> ${movie.imdb}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// ---------------- 2. LIST PAGE INITIALIZATION ----------------
function initList(type) {
    const titleEl = document.getElementById('listPageTitle');
    const titles = {
        'phim-le': 'Phim Lẻ',
        'phim-bo': 'Phim Bộ',
        'anime': 'Anime Tuyển Chọn',
        'tv-show': 'TV Show',
        'hoat-hinh': 'Phim Hoạt Hình',
        'phim-chieu-rap': 'Phim Chiếu Rạp',
        'all': 'Tất Cả Phim'
    };
    titleEl.textContent = titles[type] || 'Danh Sách Phim';

    let movies = db.getMovies().filter(m => m.visible);
    if (type !== 'all') {
        movies = movies.filter(m => m.type === type);
    }

    const sortSelect = document.getElementById('listSortSelect');
    
    function renderListGrid() {
        const sortBy = sortSelect.value;
        let sorted = [...movies];
        if (sortBy === 'newest') {
            sorted.sort((a, b) => {
                const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : a.id);
                const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : b.id);
                return timeB - timeA;
            });
        }
        else if (sortBy === 'views') sorted.sort((a, b) => b.views - a.views);
        else if (sortBy === 'imdb') sorted.sort((a, b) => b.imdb - a.imdb);

        const container = document.getElementById('listGrid');
        container.innerHTML = sorted.map(movie => `
            <a href="#detail/${movie.id}" class="movie-card">
                <div class="card-img-wrapper">
                    <img src="${movie.poster}" alt="${movie.title}" class="card-img" loading="lazy">
                    <div class="card-overlay"><i class='bx bx-play-circle play-icon'></i></div>
                    <div class="card-badges">
                        <span class="badge quality">${movie.quality}</span>
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${movie.title}</h3>
                    <div class="card-meta">
                        <span>${movie.year}</span>
                        <span><i class='bx bxs-star'></i> ${movie.imdb}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    renderListGrid();
    sortSelect.onchange = renderListGrid;
}

// ---------------- 3. SEARCH & FILTERS INITIALIZATION ----------------
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const filterFormat = document.getElementById('filterFormat');
    const filterGenre = document.getElementById('filterGenre');
    const filterYear = document.getElementById('filterYear');

    // Populate Genre Select once
    if (filterGenre && filterGenre.options.length === 1) {
        const genres = db.getGenres();
        genres.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.slug;
            opt.textContent = g.name;
            filterGenre.appendChild(opt);
        });
    }

    // Extract filters from URL or localStorage
    let initialType = 'all';
    let initialGenre = 'all';

    // Check if navigated from Homepage Genre Bar
    const preSelectedGenre = localStorage.getItem('pf_filterGenre');
    if (preSelectedGenre) {
        initialGenre = preSelectedGenre;
        if (filterGenre) filterGenre.value = preSelectedGenre;
        localStorage.removeItem('pf_filterGenre');
    }

    // Parse query parameters from hash (e.g. #search?type=phim-le)
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
        const urlParams = new URLSearchParams(hashParts[1]);
        if (urlParams.has('type')) {
            initialType = urlParams.get('type');
            if (filterFormat) filterFormat.value = initialType;
        }
        if (urlParams.has('genre')) {
            initialGenre = urlParams.get('genre');
            if (filterGenre) filterGenre.value = initialGenre;
        }
    }

    function executeSearch() {
        const rawQuery = searchInput.value.trim();
        const query = rawQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        
        // Use UI filters if they exist, otherwise fallback to URL/localStorage params
        const format = filterFormat ? filterFormat.value : initialType;
        const genreSlug = filterGenre ? filterGenre.value : initialGenre;
        const year = filterYear ? filterYear.value : 'all';

        let movies = db.getMovies().filter(m => m.visible);

        if (query) {
            movies = movies.filter(m => {
                if (m._searchStr) return m._searchStr.includes(query);
                
                // Fallback for older movies without _searchStr
                const textToSearch = `${m.title || ''} ${m.originalTitle || ''} ${m.director || ''} ${m.actors || ''}`;
                const normalizedText = textToSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
                return normalizedText.includes(query);
            });
        }

        if (format !== 'all') {
            movies = movies.filter(m => m.type === format);
        }

        if (genreSlug !== 'all') {
            const genresList = db.getGenres();
            const selectedGenre = genresList.find(g => g.slug === genreSlug);
            if (selectedGenre) {
                movies = movies.filter(m => m.genres && m.genres.includes(selectedGenre.id));
            }
        }

        if (year !== 'all') {
            movies = movies.filter(m => m.year.toString() === year);
        }

        const container = document.getElementById('searchResults');
        if (movies.length === 0) {
            container.innerHTML = `<div style="grid-column: span 6; text-align: center; color: var(--text-muted); padding: 4rem;">Không tìm thấy bộ phim phù hợp</div>`;
            return;
        }
        
        // LIMIT TO 60 TO PREVENT DOM LAG
        const moviesToRender = movies.slice(0, 60);

        container.innerHTML = moviesToRender.map(movie => `
            <a href="#detail/${movie.id}" class="movie-card">
                <div class="card-img-wrapper">
                    <img src="${movie.poster}" alt="${movie.title}" class="card-img" loading="lazy">
                    <div class="card-overlay"><i class='bx bx-play-circle play-icon'></i></div>
                    <div class="card-badges">
                        <span class="badge quality">${movie.quality}</span>
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${movie.title}</h3>
                    <div class="card-meta">
                        <span>${movie.year}</span>
                        <span><i class='bx bxs-star'></i> ${movie.imdb}</span>
                    </div>
                </div>
            </a>
        `).join('');
        
        if (movies.length > 60) {
            container.innerHTML += `<div style="grid-column: span 6; text-align: center; color: var(--text-muted); padding: 1rem;">Hiển thị 60 kết quả đầu tiên. Vui lòng gõ thêm từ khóa để tìm kiếm chính xác hơn.</div>`;
        }
    }

    let searchTimeout = null;
    searchInput.oninput = () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(executeSearch, 300);
    };
    if (filterFormat) filterFormat.onchange = executeSearch;
    if (filterGenre) filterGenre.onchange = executeSearch;
    if (filterYear) filterYear.onchange = executeSearch;

    executeSearch(); // First load render
}

// ---------------- 4. MOVIE DETAIL INITIALIZATION ----------------
function initDetail(movieId) {
    const movies = db.getMovies();
    const movie = movies.find(m => m.id === movieId);
    const container = document.getElementById('detailContainer');

    if (!movie) {
        container.innerHTML = `<div style="text-align: center; padding: 4rem; color: var(--text-muted)">Không tìm thấy phim này!</div>`;
        return;
    }

    const related = movies.filter(m => m.type === movie.type && m.id !== movie.id)
                          .sort((a, b) => {
                              const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : a.id);
                              const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : b.id);
                              return timeB - timeA;
                          })
                          .slice(0, 4);
    let relatedHtml = related.map(m => `
        <a href="#detail/${m.id}" class="movie-card">
            <div class="card-img-wrapper">
                <img src="${m.poster}" alt="" class="card-img" loading="lazy">
                <div class="card-overlay"><i class='bx bx-play-circle play-icon'></i></div>
            </div>
            <div class="card-info">
                <h4 class="card-title" style="font-size:0.9rem;">${m.title}</h4>
            </div>
        </a>
    `).join('');

    container.innerHTML = `
        <div class="ro-detail-hero">
            <a href="#home" style="position: absolute; top: 20px; left: 20px; z-index: 20; color: white; background: rgba(0,0,0,0.5); padding: 8px 15px; border-radius: 20px; text-decoration: none; display: flex; align-items: center; gap: 5px; font-weight: 500; backdrop-filter: blur(5px); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;" onmouseover="this.style.background='rgba(0,0,0,0.8)'" onmouseout="this.style.background='rgba(0,0,0,0.5)'">
                <i class='bx bx-home'></i> Về Trang Chủ
            </a>
            <div style="position: absolute; inset: 0; overflow: hidden; z-index: 1;">
                <div class="ro-backdrop" style="background-image: url('${movie.banner}');"></div>
                <div class="ro-backdrop-overlay"></div>
            </div>
            <div class="ro-poster-wrapper">
                <img src="${movie.poster}" alt="${movie.title}" class="ro-poster">
            </div>
        </div>

        <div class="ro-detail-content">
            <h1 class="ro-title">${movie.title}</h1>
            <h2 class="ro-subtitle">${movie.originalTitle || ''}</h2>
            
            <div class="ro-info-toggle" id="roInfoToggle">
                <span>Thông tin phim</span> <i class='bx bx-chevron-down'></i>
            </div>
            
            <div class="ro-info-content" id="roInfoContent">
                <div class="ro-meta-tags">
                    <span><i class='bx bxs-star' style="color: #fbbf24"></i> ${movie.imdb}</span>
                    <span>${movie.year}</span>
                    <span>${movie.duration || 'N/A'}</span>
                    <span>${movie.quality}</span>
                </div>
                <div class="ro-meta-tags">
                    <span>Trạng thái: ${movie.status}</span>
                    <span>Loại: ${movie.type}</span>
                </div>
                <p class="ro-desc">${movie.description}</p>
                <div class="ro-specs">
                    <div><strong>Đạo diễn:</strong> ${movie.director || 'Đang cập nhật'}</div>
                    <div><strong>Diễn viên:</strong> ${movie.actors || 'Đang cập nhật'}</div>
                </div>
            </div>

            <a href="#watch/${movie.id}/1" class="ro-btn-play">
                <i class='bx bx-play'></i> Xem Ngay
            </a>

            <div class="ro-action-row">
                <button class="ro-action-btn" id="roFavBtn"><i class='bx bx-heart'></i><span>Yêu thích</span></button>
                <button class="ro-action-btn"><i class='bx bx-plus'></i><span>Thêm vào</span></button>
                <button class="ro-action-btn"><i class='bx bx-paper-plane'></i><span>Chia sẻ</span></button>
                <button class="ro-coin-btn"><i class='bx bxl-sketch'></i> 0</button>
            </div>

            <!-- Tabs -->
            <div class="ro-tabs">
                <div class="ro-tab active">Tập phim</div>
                <div class="ro-tab">Gallery</div>
                <div class="ro-tab">OST</div>
                <div class="ro-tab">Diễn viên</div>
                <div class="ro-tab">Đề xuất</div>
            </div>

            <!-- Episode Section -->
            <div class="ro-episodes-section">
                <div class="ro-ep-header">
                    <div class="ro-ep-title"><i class='bx bx-menu'></i> Phần 1 <i class='bx bx-caret-down'></i></div>
                    <div class="ro-ep-toggle">
                        <span>Rút gọn</span>
                        <div class="toggle-switch"><div class="toggle-circle"></div></div>
                    </div>
                </div>
                
                <div class="ro-ep-sub-btn" id="detailServerTabs" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 1rem;">
                    ${(movie.servers && movie.servers.length > 0) ? 
                        movie.servers.map((s, idx) => `
                            <button class="server-tab-btn" style="padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 500; font-size: 0.9rem; transition: all 0.2s; ${idx === 0 ? 'background: var(--accent-primary); color: white;' : 'background: rgba(255,255,255,0.1); color: #ccc;'}" data-server-index="${idx}">
                                <i class='bx bx-server'></i> ${s.server_name}
                            </button>
                        `).join('') 
                        : 
                        `<button style="padding: 6px 12px; border-radius: 6px; border: none; background: var(--accent-primary); color: white;"><i class='bx bx-message-rounded-dots'></i> Mặc định</button>`
                    }
                </div>

                <div class="ro-ep-grid" id="detailEpisodesGrid">
                    ${(movie.servers && movie.servers.length > 0) ? 
                        movie.servers[0].items.map(ep => `
                            <a href="#watch/${movie.id}/${ep.id}?server=0" class="ro-ep-item">
                                <i class='bx bx-play'></i> ${ep.name}
                            </a>
                        `).join('') 
                        : (movie.episodes && movie.episodes.length > 0) ?
                        movie.episodes.map(ep => `
                            <a href="#watch/${movie.id}/${ep.id}" class="ro-ep-item">
                                <i class='bx bx-play'></i> ${ep.name}
                            </a>
                        `).join('') 
                        : 
                        `<a href="#watch/${movie.id}/1" class="ro-ep-item"><i class='bx bx-play'></i> Tập Full</a>`
                    }
                </div>
            </div>
        </div>

        <div style="max-width: 1200px; margin: 0 auto; padding: 2rem 5% 4rem;">
            <h3 style="font-size: 1.2rem; font-weight:600; margin-bottom: 1rem; color: #fff;">Phim Liên Quan</h3>
            <div class="movie-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 1rem;">
                ${relatedHtml || '<p style="color: var(--text-muted)">Không có phim liên quan</p>'}
            </div>
        </div>
    `;

    // Interaction Logic for Detail
    setTimeout(() => {
        const toggleBtn = document.getElementById('roInfoToggle');
        const infoContent = document.getElementById('roInfoContent');
        if (toggleBtn && infoContent) {
            toggleBtn.onclick = () => {
                infoContent.classList.toggle('show');
                const icon = toggleBtn.querySelector('i');
                if(infoContent.classList.contains('show')) {
                    icon.classList.replace('bx-chevron-down', 'bx-chevron-up');
                } else {
                    icon.classList.replace('bx-chevron-up', 'bx-chevron-down');
                }
            };
        }
        
        // Server Tabs Logic
        const detailServerTabs = document.getElementById('detailServerTabs');
        const detailEpisodesGrid = document.getElementById('detailEpisodesGrid');
        if (detailServerTabs && movie.servers && movie.servers.length > 0) {
            const btns = detailServerTabs.querySelectorAll('.server-tab-btn');
            btns.forEach(btn => {
                btn.onclick = () => {
                    // Update active styling
                    btns.forEach(b => {
                        b.style.background = 'rgba(255,255,255,0.1)';
                        b.style.color = '#ccc';
                    });
                    btn.style.background = 'var(--accent-primary)';
                    btn.style.color = 'white';
                    
                    // Render episodes for selected server
                    const sIdx = parseInt(btn.getAttribute('data-server-index'));
                    const server = movie.servers[sIdx];
                    if (server && server.items) {
                        detailEpisodesGrid.innerHTML = server.items.map(ep => `
                            <a href="#watch/${movie.id}/${ep.id}?server=${sIdx}" class="ro-ep-item">
                                <i class='bx bx-play'></i> ${ep.name}
                            </a>
                        `).join('');
                    }
                };
            });
        }
        
        // Favorite logic
        const favBtn = document.getElementById('roFavBtn');
        if(favBtn) {
            const currentUser = db.getCurrentUser();
            if(currentUser) {
                const favs = db.getFavorites(currentUser.username);
                if(favs.includes(movie.id)) {
                    favBtn.querySelector('i').classList.replace('bx-heart', 'bxs-heart');
                    favBtn.querySelector('i').style.color = '#ef4444';
                }
                favBtn.onclick = () => {
                    const currentFavs = db.getFavorites(currentUser.username);
                    if(currentFavs.includes(movie.id)) {
                        db.removeFavorite(currentUser.username, movie.id);
                        favBtn.querySelector('i').classList.replace('bxs-heart', 'bx-heart');
                        favBtn.querySelector('i').style.color = '';
                    } else {
                        db.addFavorite(currentUser.username, movie.id);
                        favBtn.querySelector('i').classList.replace('bx-heart', 'bxs-heart');
                        favBtn.querySelector('i').style.color = '#ef4444';
                    }
                };
            } else {
                favBtn.onclick = () => window.location.hash = '#auth';
            }
        }
    }, 100);
}

function loadVideoSource(video, videoUrl) {
    if (!videoUrl) {
        video.src = '';
        return;
    }
    video.src = videoUrl;
}

function initWatch(movieId, episodeId, serverIdx = 0) {
    const movies = db.getMovies();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        document.getElementById('watch-view').innerHTML = `<div style="text-align: center; padding: 4rem; color: var(--text-muted)">Phim không tồn tại!</div>`;
        return;
    }

    currentMovie = movie;
    
    // Increment View
    movie.views = (movie.views || 0) + 1;
    db.saveMovies(movies);

    // Save history if user logged in
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        db.saveWatchHistory(currentUser.username, movie.id);
    }

    // Set Active Episode based on Server
    const servers = movie.servers && movie.servers.length > 0 ? movie.servers : [{ server_name: 'Mặc định', items: movie.episodes || [] }];
    if (serverIdx < 0 || serverIdx >= servers.length) serverIdx = 0;
    
    const activeServer = servers[serverIdx];
    const episodes = activeServer.items || [];
    
    let ep = episodes.find(e => e.id === episodeId);
    if (!ep && episodes.length > 0) {
        // Fallback to the last available episode if the new server doesn't have it
        ep = episodes[episodes.length - 1];
    }
    
    currentEp = ep;

    // Render Watch details
    const epLabel = ep ? ep.name : 'Tập 1';
    document.getElementById('watchTitle').textContent = movie.title + ' — ' + epLabel;
    const navTitle = document.getElementById('watchNavTitle');
    if (navTitle) navTitle.textContent = movie.title;
    document.getElementById('watchMeta').innerHTML = `
        <span><i class='bx bx-calendar'></i> ${movie.year}</span>
        <span><i class='bx bx-show'></i> ${formatNumber(movie.views)} lượt xem</span>
        <span><i class='bx bx-badge-check'></i> ${movie.quality}</span>
        ${movie.status ? `<span><i class='bx bx-time'></i> ${movie.status}</span>` : ''}
    `;
    const descEl = document.getElementById('watchDesc');
    const descText = movie.description || '';
    if (descText.length > 200) {
        const shortDesc = descText.substring(0, 200) + '...';
        descEl.innerHTML = `
            <span class="desc-text">${shortDesc}</span>
            <span class="desc-full" style="display:none;">${descText}</span>
            <span class="read-more-toggle" style="color: #eab308; cursor: pointer; margin-left: 5px; font-weight: 500; font-size: 0.9rem;">Xem thêm ˅</span>
        `;
        
        const toggleBtn = descEl.querySelector('.read-more-toggle');
        const textShort = descEl.querySelector('.desc-text');
        const textFull = descEl.querySelector('.desc-full');
        
        toggleBtn.onclick = () => {
            if (textShort.style.display === 'none') {
                textShort.style.display = 'inline';
                textFull.style.display = 'none';
                toggleBtn.innerHTML = 'Xem thêm ˅';
            } else {
                textShort.style.display = 'none';
                textFull.style.display = 'inline';
                toggleBtn.innerHTML = ' Thu gọn ˄';
            }
        };
    } else {
        descEl.textContent = descText;
    }

    // Setup Video Source
    const video = document.getElementById('mainVideo');
    if (ep && video) {
        loadVideoSource(video, ep.videoUrl);
        
        // Restore last watched time
        const historyTime = localStorage.getItem(`pf_watched_${movie.id}_${ep.id}`);
        if (historyTime) {
            video.addEventListener('loadedmetadata', () => {
                video.currentTime = parseFloat(historyTime);
            }, { once: true });
        }

        // Setup custom player listeners (Avoid multi binding)
        // setupCustomVideoPlayer(video, movie, ep);
    }

    // Render Episode list sidebar
    renderEpisodesList(movie, ep ? ep.id : episodeId, serverIdx);

    // Render Favorite Button Status
    updateFavoriteBtnStatus(movie);

    // Render Comments list
    renderComments(movie);

    // Sidebar collapse/expand toggle
    const sidebarToggle = document.getElementById('sidebarToggleBtn');
    const watchSidebar = document.getElementById('watchSidebar');
    const collapseIcon = document.getElementById('sidebarCollapseIcon');
    const collapseText = document.getElementById('sidebarCollapseText');
    if (sidebarToggle && watchSidebar) {
        // Restore last collapsed state
        const wasCollapsed = localStorage.getItem('pf_sidebar_collapsed') === 'true';
        if (wasCollapsed) {
            watchSidebar.classList.add('collapsed');
            collapseIcon && collapseIcon.classList.replace('bx-chevron-up', 'bx-chevron-down');
            if (collapseText) collapseText.textContent = 'Mở rộng';
        }
        sidebarToggle.onclick = () => {
            const isCollapsed = watchSidebar.classList.toggle('collapsed');
            localStorage.setItem('pf_sidebar_collapsed', isCollapsed);
            if (collapseIcon) {
                collapseIcon.classList.toggle('bx-chevron-up', !isCollapsed);
                collapseIcon.classList.toggle('bx-chevron-down', isCollapsed);
            }
            if (collapseText) collapseText.textContent = isCollapsed ? 'Mở rộng' : 'Rút gọn';
        };
    }
}

function renderEpisodesList(movie, activeEpId, activeServerIdx = 0) {
    const container = document.getElementById('episodesList');
    const servers = movie.servers && movie.servers.length > 0 ? movie.servers : [{ server_name: 'Mặc định', items: movie.episodes || [] }];
    
    // Render Server Tabs
    const serverTabsHtml = servers.length > 1 ? `
        <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:1rem; padding: 0 1rem;">
            ${servers.map((s, idx) => `
                <a href="#watch/${movie.id}/${activeEpId}?server=${idx}" style="flex:1; text-align:center; padding: 6px; border-radius: 4px; font-size: 0.85rem; background: ${idx === activeServerIdx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}; color: ${idx === activeServerIdx ? '#fff' : '#ccc'}; text-decoration: none; white-space: nowrap;">
                    ${s.server_name}
                </a>
            `).join('')}
        </div>
    ` : '';

    const activeServer = servers[activeServerIdx] || servers[0];
    const eps = activeServer.items || [];

    if (eps.length === 0) {
        container.innerHTML = serverTabsHtml + `<p style="padding: 1rem; color: var(--text-muted)">Không có tập phim nào.</p>`;
        return;
    }

    container.innerHTML = serverTabsHtml + eps.map(e => `
        <a href="#watch/${movie.id}/${e.id}?server=${activeServerIdx}" class="episode-item ${e.id === activeEpId ? 'active' : ''}">
            <i class='bx bx-play-circle'></i>
            <span>${e.name}</span>
        </a>
    `).join('');
}

function updateFavoriteBtnStatus(movie) {
    const btn = document.getElementById('addFavoriteBtn');
    const currentUser = db.getCurrentUser();
    if (!btn) return;

    if (!currentUser) {
        btn.innerHTML = `<i class='bx bx-heart'></i> Thêm Yêu Thích`;
        btn.onclick = () => window.location.hash = '#auth';
        return;
    }

    const favs = db.getFavorites(currentUser.username);
    const isFav = favs.includes(movie.id);

    if (isFav) {
        btn.innerHTML = `<i class='bx bxs-heart' style="color: #ef4444"></i> Đã Yêu Thích`;
        btn.onclick = () => {
            db.removeFavorite(currentUser.username, movie.id);
            updateFavoriteBtnStatus(movie);
        };
    } else {
        btn.innerHTML = `<i class='bx bx-heart'></i> Thêm Yêu Thích`;
        btn.onclick = () => {
            db.addFavorite(currentUser.username, movie.id);
            updateFavoriteBtnStatus(movie);
        };
    }
}

// Player setup function
function setupCustomVideoPlayer(video, movie, ep) {
    const playBtn = document.getElementById('playBtn');
    const backwardBtn = document.getElementById('backwardBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const progressBar = document.getElementById('progressBar');
    const progressBarWrapper = document.getElementById('progressBarWrapper');
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const pipBtn = document.getElementById('pipBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const customPlayer = document.getElementById('customPlayer');

    // Auto Play preference
    let autoPlayNext = localStorage.getItem('pf_autoplay') !== 'false';
    const autoIcon = autoPlayBtn.querySelector('i');
    autoIcon.style.color = autoPlayNext ? 'var(--accent-primary)' : 'var(--text-muted)';

    autoPlayBtn.onclick = () => {
        autoPlayNext = !autoPlayNext;
        localStorage.setItem('pf_autoplay', autoPlayNext);
        autoIcon.style.color = autoPlayNext ? 'var(--accent-primary)' : 'var(--text-muted)';
    };

    // Toggle Play/Pause
    const togglePlay = () => {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = "<i class='bx bx-pause'></i>";
        } else {
            video.pause();
            playBtn.innerHTML = "<i class='bx bx-play'></i>";
        }
    };
    playBtn.onclick = togglePlay;
    video.onclick = togglePlay;

    // Time backward / forward
    backwardBtn.onclick = () => video.currentTime -= 10;
    forwardBtn.onclick = () => video.currentTime += 10;

    // Volume controllers
    volumeSlider.oninput = (e) => {
        video.volume = e.target.value;
        video.muted = video.volume === 0;
        updateVolumeIcon(video.volume, video.muted);
    };

    volumeBtn.onclick = () => {
        video.muted = !video.muted;
        updateVolumeIcon(video.volume, video.muted);
    };

    function updateVolumeIcon(vol, muted) {
        if (muted || vol === 0) {
            volumeBtn.innerHTML = "<i class='bx bx-volume-mute'></i>";
        } else if (vol < 0.5) {
            volumeBtn.innerHTML = "<i class='bx bx-volume-low'></i>";
        } else {
            volumeBtn.innerHTML = "<i class='bx bx-volume-full'></i>";
        }
    }

    // Time/Progress update
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    video.ontimeupdate = () => {
        if (video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            progressBar.style.width = `${percent}%`;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
            
            // Save position watched every 5 seconds
            localStorage.setItem(`pf_watched_${movie.id}_${ep.id}`, video.currentTime);
        }
    };

    progressBarWrapper.onclick = (e) => {
        const rect = progressBarWrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        video.currentTime = (clickX / width) * video.duration;
    };

    // Auto Play Next episode when ended
    video.onended = () => {
        if (autoPlayNext) {
            const nextEpId = ep.id + 1;
            const nextEp = movie.episodes.find(e => e.id === nextEpId);
            if (nextEp) {
                window.location.hash = `#watch/${movie.id}/${nextEp.id}`;
            } else {
                alert('Bạn đã xem xong tập cuối!');
            }
        }
    };

    // Pip & Fullscreen
    pipBtn.onclick = async () => {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await video.requestPictureInPicture();
        }
    };

    fullscreenBtn.onclick = () => {
        if (!document.fullscreenElement) {
            customPlayer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Settings Modal
    const settingsModal = document.getElementById('playerSettingsModal');
    settingsBtn.onclick = (e) => {
        e.stopPropagation();
        settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
    };

    document.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    settingsModal.onclick = (e) => e.stopPropagation();

    // Speed Select
    document.getElementById('speedSelect').onchange = (e) => {
        video.playbackRate = parseFloat(e.target.value);
    };

    // Quality Select (Simulated)
    document.getElementById('qualitySelect').onchange = (e) => {
        const originalTime = video.currentTime;
        const wasPlaying = !video.paused;
        
        // Simulating buffer change
        video.pause();
        alert(`Đang đổi sang chất lượng ${e.target.value}...`);
        setTimeout(() => {
            video.currentTime = originalTime;
            if (wasPlaying) video.play();
        }, 1000);
    };

    // Subtitle toggle
    const subtitleOverlay = document.getElementById('subtitleOverlay');
    const subtitleBtn = document.getElementById('subtitleBtn');
    let subtitlesEnabled = false;

    // Subtitle texts mockup
    const subtitlesMock = [
        { start: 0, end: 5, text: "[PhimFlix] Chúc bạn xem phim vui vẻ!" },
        { start: 6, end: 12, text: "Hôm nay thời tiết thật là đẹp..." },
        { start: 13, end: 20, text: "Cậu có muốn cùng tôi đi ăn tối không?" }
    ];

    video.addEventListener('timeupdate', () => {
        if (!subtitlesEnabled) {
            subtitleOverlay.style.display = 'none';
            return;
        }

        const t = video.currentTime;
        const currentSub = subtitlesMock.find(s => t >= s.start && t <= s.end);
        if (currentSub) {
            subtitleOverlay.textContent = currentSub.text;
            subtitleOverlay.style.display = 'block';
        } else {
            subtitleOverlay.style.display = 'none';
        }
    });

    subtitleBtn.onclick = () => {
        subtitlesEnabled = !subtitlesEnabled;
        subtitleBtn.style.color = subtitlesEnabled ? 'var(--accent-primary)' : 'var(--text-primary)';
    };

    // Keyboard Shortcuts
    document.onkeydown = (e) => {
        // Only run shortcuts if user is active on watch view and not inside textareas
        if (window.location.hash.startsWith('#watch') && document.activeElement.tagName !== 'TEXTAREA') {
            if (e.key === ' ') {
                e.preventDefault();
                togglePlay();
            } else if (e.key === 'ArrowLeft') {
                video.currentTime -= 10;
            } else if (e.key === 'ArrowRight') {
                video.currentTime += 10;
            } else if (e.key === 'f' || e.key === 'F') {
                fullscreenBtn.click();
            }
        }
    };
}

// ---------------- COMMENTS LOGIC ----------------
function renderComments(movie) {
    const comments = movie.comments || [];
    document.getElementById('commentCount').textContent = comments.length;

    const list = document.getElementById('commentsList');
    if (comments.length === 0) {
        list.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Chưa có bình luận nào. Hãy là người đầu tiên!</p>`;
        return;
    }

    list.innerHTML = comments.slice().reverse().map(c => `
        <div class="comment-item">
            <div class="comment-avatar">${(c.username || '?').charAt(0).toUpperCase()}</div>
            <div class="comment-content">
                <div class="comment-author">${c.username} <span style="font-size:0.8rem; color:var(--text-muted); font-weight:normal;">${c.date || ''}</span></div>
                <div class="comment-text">${c.content}</div>
            </div>
        </div>
    `).join('');
}

// Comment Form Submit
document.getElementById('commentForm').onsubmit = (e) => {
    e.preventDefault();
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        window.location.hash = '#auth';
        return;
    }

    const text = document.getElementById('commentText').value.trim();
    if (!text || !currentMovie) return;

    const movies = db.getMovies();
    const movieIdx = movies.findIndex(m => m.id === currentMovie.id);
    
    if (movieIdx !== -1) {
        const newComment = {
            username: currentUser.username,
            content: text,
            date: new Date().toLocaleDateString('vi-VN')
        };
        movies[movieIdx].comments = movies[movieIdx].comments || [];
        movies[movieIdx].comments.push(newComment);
        
        db.saveMovies(movies);
        currentMovie = movies[movieIdx]; // Sync local variable
        
        document.getElementById('commentText').value = '';
        renderComments(currentMovie);
    }
};

// ---------------- REPORT FAULT MODAL ----------------
window.openReportModal = function() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.style.display = 'flex';
};

window.closeReportModal = function() {
    const modal = document.getElementById('reportModal');
    if (modal) modal.style.display = 'none';
};

document.getElementById('reportForm').onsubmit = (e) => {
    e.preventDefault();
    const type = document.getElementById('reportType').value;
    const detail = document.getElementById('reportDetail').value.trim();

    if (!currentMovie) return;

    const reports = db.getReports();
    reports.push({
        movieId: currentMovie.id,
        movieTitle: currentMovie.title,
        episodeId: currentEp ? currentEp.id : 1,
        type,
        detail,
        resolved: false,
        date: new Date().toLocaleDateString('vi-VN')
    });

    db.saveReports(reports);
    alert('Cảm ơn bạn! Báo cáo sự cố đã được gửi và sẽ được xử lý sớm.');
    closeReportModal();
    document.getElementById('reportDetail').value = '';
};

// ---------------- 6. PROFILE PAGE LOGIC ----------------
function initProfile() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return;

    // Load static info
    document.getElementById('userName').textContent = currentUser.displayName;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('settingName').value = currentUser.displayName;
    document.getElementById('settingEmail').value = currentUser.email;
    const displayName = currentUser.displayName || currentUser.username || '?';
    document.getElementById('userAvatar').textContent = displayName.charAt(0).toUpperCase();

    // Profile internal Tabs (History, Favorites, Settings)
    const pBtns = document.querySelectorAll('.profile-tab-btn');
    const pPanes = document.querySelectorAll('#profile-view .tab-pane');

    pBtns.forEach(btn => {
        btn.onclick = () => {
            pBtns.forEach(b => b.classList.remove('active'));
            pPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-profile-target');
            document.getElementById(target).classList.add('active');
        };
    });

    // Logout
    document.getElementById('btnLogout').onclick = () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            db.setCurrentUser(null);
            updateHeaderUserBtn();
            window.location.hash = '#home';
        }
    };

    // Render Watch History
    renderWatchHistoryGrid(currentUser.username);

    // Render Favorite Movies Grid
    renderFavoritesGrid(currentUser.username);
}

function renderWatchHistoryGrid(username) {
    const historyIds = db.getWatchHistory(username);
    const movies = db.getMovies();
    const historyMovies = movies.filter(m => historyIds.includes(m.id));

    const grid = document.getElementById('historyGrid');
    const empty = document.getElementById('historyEmpty');

    if (historyMovies.length === 0) {
        empty.style.display = 'block';
        grid.innerHTML = '';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = historyMovies.map(movie => `
        <a href="#detail/${movie.id}" class="movie-card">
            <div class="card-img-wrapper">
                <img src="${movie.poster}" alt="" class="card-img">
            </div>
            <div class="card-info">
                <h4 class="card-title">${movie.title}</h4>
            </div>
        </a>
    `).join('');
}

function renderFavoritesGrid(username) {
    const favIds = db.getFavorites(username);
    const movies = db.getMovies();
    const favMovies = movies.filter(m => favIds.includes(m.id));

    const grid = document.getElementById('favoritesGrid');
    const empty = document.getElementById('favoritesEmpty');

    if (favMovies.length === 0) {
        empty.style.display = 'block';
        grid.innerHTML = '';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = favMovies.map(movie => `
        <a href="#detail/${movie.id}" class="movie-card">
            <div class="card-img-wrapper">
                <img src="${movie.poster}" alt="" class="card-img">
            </div>
            <div class="card-info">
                <h4 class="card-title">${movie.title}</h4>
            </div>
        </a>
    `).join('');
}

window.saveProfileSettings = function(e) {
    e.preventDefault();
    const displayName = document.getElementById('settingName').value.trim();
    const password = document.getElementById('settingPassword').value;

    const currentUser = db.getCurrentUser();
    let users = db.getUsers();
    
    users = users.map(u => {
        if (u.username === currentUser.username) {
            u.displayName = displayName;
            if (password) u.password = password;
            // Sync session
            db.setCurrentUser(u);
        }
        return u;
    });

    db.saveUsers(users);
    alert('Đã cập nhật thông tin tài khoản thành công!');
    initProfile();
    updateHeaderUserBtn();
};

// ---------------- 7. AUTHENTICATION LOGIC ----------------
function setupAuthFormToggles() {
    const toRegister = document.getElementById('toRegister');
    const toLogin = document.getElementById('toLogin');
    
    if (toRegister) {
        toRegister.onclick = (e) => {
            e.preventDefault();
            document.getElementById('loginFormBox').classList.remove('active');
            document.getElementById('registerFormBox').classList.add('active');
        };
    }
    
    if (toLogin) {
        toLogin.onclick = (e) => {
            e.preventDefault();
            document.getElementById('registerFormBox').classList.remove('active');
            document.getElementById('loginFormBox').classList.add('active');
        };
    }
}

function setupAuthSubmissions() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Login Form Submit
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const user = document.getElementById('loginUser').value.trim();
            const pass = document.getElementById('loginPass').value;
            const error = document.getElementById('loginError');

            const users = db.getUsers();
            const matched = users.find(u => u.username === user && u.password === pass);

            if (matched) {
                error.style.display = 'none';
                db.setCurrentUser(matched);
                updateHeaderUserBtn();
                
                // Redirect based on role
                if (matched.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.hash = '#home';
                }
                
                loginForm.reset();
            } else {
                error.style.display = 'block';
            }
        };
    }

    // Register Form Submit
    if (registerForm) {
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const user = document.getElementById('regUser').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const displayName = document.getElementById('regName').value.trim();
            const pass = document.getElementById('regPass').value;
            const error = document.getElementById('regError');

            const users = db.getUsers();
            
            // Validation
            const existUser = users.find(u => u.username === user);
            const existEmail = users.find(u => u.email === email);

            if (existUser || existEmail) {
                error.style.display = 'block';
                return;
            }

            if (pass.length < 6) {
                alert('Mật khẩu phải dài tối thiểu 6 ký tự!');
                return;
            }

            // Create new
            const newUser = {
                username: user,
                email,
                displayName,
                password: pass,
                role: 'user'
            };

            users.push(newUser);
            db.saveUsers(users);
            
            error.style.display = 'none';
            alert('Đăng ký tài khoản thành công! Hãy tiến hành đăng nhập.');
            
            // Switch to Login Form
            document.getElementById('registerFormBox').classList.remove('active');
            document.getElementById('loginFormBox').classList.add('active');
            registerForm.reset();
        };
    }
}

// Re-render when Firebase syncs data in background
window.addEventListener('cloudDataSynced', () => {
    console.log('Firebase synced! Re-rendering app...');
    router(); // was: handleRoute() — that function doesn't exist
});

// ---------------- 8. MOBILE MENU LOGIC ----------------
function initMobileMenu() {
    const btnOpen = document.getElementById('mobileMenuBtn');
    const btnClose = document.getElementById('closeMenuBtn');
    const modal = document.getElementById('mobileMenuModal');
    const overlay = document.getElementById('mobileMenuOverlay');

    if (!btnOpen || !modal) return;

    function openMenu() {
        modal.classList.add('show');
        overlay.classList.add('show');
    }

    function closeMenu() {
        modal.classList.remove('show');
        overlay.classList.remove('show');
    }

    btnOpen.addEventListener('click', openMenu);
    btnClose.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // Populate Genres dynamically
    const genreList = document.getElementById('mobileGenreList');
    if (genreList && genreList.innerHTML.trim() === '<!-- Injected via JS -->') {
        const genres = db.getGenres();
        genreList.innerHTML = genres.map(g => 
            `<a href="#search" onclick="goToGenreSearch('${g.slug}'); closeMobileMenu();">${g.name}</a>`
        ).join('');
    }

    // Populate Countries (Static mockup for now)
    const countryList = document.getElementById('mobileCountryList');
    if (countryList && countryList.innerHTML.trim() === '<!-- Injected via JS -->') {
        const countries = ['Việt Nam', 'Trung Quốc', 'Hàn Quốc', 'Âu Mỹ', 'Nhật Bản', 'Thái Lan'];
        countryList.innerHTML = countries.map(c => 
            `<a href="#search" onclick="closeMobileMenu();">${c}</a>`
        ).join('');
    }

    // Expose close to global scope for inline onclicks
    window.closeMobileMenu = closeMenu;

    // Accordions
    const accordions = document.querySelectorAll('.mobile-nav-accordion');
    accordions.forEach(acc => {
        const header = acc.querySelector('.accordion-header');
        const content = acc.querySelector('.accordion-content');
        const icon = acc.querySelector('.bx-chevron-down');

        header.addEventListener('click', () => {
            const isShowing = content.classList.contains('show');
            // Close all other accordions
            document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('show'));
            document.querySelectorAll('.accordion-header .bx').forEach(i => {
                i.classList.remove('bx-chevron-up');
                i.classList.add('bx-chevron-down');
            });

            if (!isShowing) {
                content.classList.add('show');
                icon.classList.remove('bx-chevron-down');
                icon.classList.add('bx-chevron-up');
            }
        });
    });

    // Close menu when clicking standard links
    const standardLinks = modal.querySelectorAll('.mobile-nav-grid a, .mobile-user-btn');
    standardLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// Ensure it initializes
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMobileMenu, 100);
});

// --- SYNC UI LOGIC ---
window.generateSyncCode = function() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    const code = db.exportSyncData(currentUser.username);
    const input = document.getElementById("exportSyncCode");
    input.value = code;
    input.style.display = "block";
    input.select();
    document.execCommand("copy");
    alert("Đã copy mã đồng bộ. Hãy dán mã này vào thiết bị khác!");
};

window.applySyncCode = function() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) return alert("Vui lòng đăng nhập!");
    const input = document.getElementById("importSyncCode");
    const code = input.value.trim();
    if (!code) return alert("Vui lòng nhập mã đồng bộ!");
    
    if (db.importSyncData(currentUser.username, code)) {
        alert("Đồng bộ thành công! Lịch sử và Yêu thích đã được gộp lại.");
        input.value = "";
        renderWatchHistoryGrid(currentUser.username);
        renderFavoritesGrid(currentUser.username);
    } else {
        alert("Mã đồng bộ không hợp lệ hoặc bị lỗi!");
    }
};

