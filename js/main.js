// main.js

document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // Check saved theme
    const savedTheme = localStorage.getItem('pf_theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('pf_theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            icon.className = 'bx bx-sun';
        } else {
            icon.className = 'bx bx-moon';
        }
    }

    // User Button Logic
    const userBtn = document.getElementById('loginBtn');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            const currentUser = db.getCurrentUser();
            if (currentUser) {
                if (currentUser.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'profile.html';
                }
            } else {
                window.location.href = 'auth.html';
            }
        });
    }

    // Load Data
    const movies = db.getMovies();
    if (movies.length === 0) return; // Wait for data to init

    // 1. Render Hero Slider (Featured Movies)
    const featuredMovies = movies.filter(m => m.featured).slice(0, 5);
    renderHeroSlider(featuredMovies);

    // 2. Render New Movies
    // Sort by createdAt descending
    const newMovies = [...movies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    renderMovieGrid('new-movies-grid', newMovies);

    // 3. Render Trending (By views)
    const trendingMovies = [...movies].sort((a, b) => b.views - a.views).slice(0, 10);
    renderMovieGrid('trending-movies-grid', trendingMovies);

    // 4. Render Anime
    const animeMovies = movies.filter(m => m.type === 'anime').slice(0, 10);
    renderMovieGrid('anime-movies-grid', animeMovies);
});

// Helper Functions
function formatViews(views) {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
}

function renderHeroSlider(movies) {
    const heroContainer = document.getElementById('hero-slider');
    if (!heroContainer) return;

    let slidesHTML = '';
    movies.forEach((movie, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const genres = movie.genres.map(id => {
            const g = db.getGenres().find(g => g.id === id);
            return g ? g.name : '';
        }).join(', ');

        slidesHTML += `
            <div class="hero-slide ${activeClass}" style="background-image: url('${movie.banner}');">
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title">${movie.title}</h1>
                    <div class="hero-meta">
                        <span>${movie.year}</span>
                        <span><i class='bx bxs-star' style="color: var(--accent-secondary)"></i> ${movie.imdb}</span>
                        <span>${movie.quality}</span>
                        <span>${movie.duration}</span>
                    </div>
                    <p class="hero-desc">${movie.description}</p>
                    <div style="display: flex; gap: 1rem;">
                        <a href="watch.html?id=${movie.id}" class="btn btn-primary"><i class='bx bx-play'></i> Xem Ngay</a>
                        <a href="detail.html?id=${movie.id}" class="btn btn-secondary"><i class='bx bx-info-circle'></i> Chi Tiết</a>
                    </div>
                </div>
            </div>
        `;
    });

    heroContainer.innerHTML = slidesHTML;

    // Simple slider logic
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 1) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }
}

function renderMovieGrid(containerId, movies) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    movies.forEach(movie => {
        html += `
            <a href="detail.html?id=${movie.id}" class="movie-card">
                <div class="card-img-wrapper">
                    <img src="${movie.poster}" alt="${movie.title}" class="card-img" loading="lazy">
                    <div class="card-overlay">
                        <i class='bx bx-play-circle play-icon'></i>
                    </div>
                    <div class="card-badges">
                        <span class="badge quality">${movie.quality}</span>
                        <span class="badge type">${movie.type === 'phim-bo' || movie.type === 'anime' ? ((movie.episodes ? movie.episodes.length : 0) + ' Tập') : 'Phim Lẻ'}</span>
                    </div>
                </div>
                <div class="card-info">
                    <h3 class="card-title" title="${movie.title}">${movie.title}</h3>
                    <div class="card-meta">
                        <span>${movie.year}</span>
                        <span><i class='bx bx-show'></i> ${formatViews(movie.views)}</span>
                    </div>
                </div>
            </a>
        `;
    });

    container.innerHTML = html;
}
