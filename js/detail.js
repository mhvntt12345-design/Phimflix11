// js/detail.js

document.addEventListener('DOMContentLoaded', () => {
    // Theme logic (reuse simple version)
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

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'));

    if (!movieId) {
        document.getElementById('detail-container').innerHTML = '<h2 style="text-align:center; padding: 100px;">Không tìm thấy phim!</h2>';
        return;
    }

    const movies = db.getMovies();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        document.getElementById('detail-container').innerHTML = '<h2 style="text-align:center; padding: 100px;">Không tìm thấy phim!</h2>';
        return;
    }

    renderMovieDetail(movie);
    renderRelatedMovies(movie, movies);
});

function renderMovieDetail(movie) {
    const container = document.getElementById('detail-container');
    
    // Get genre names
    const genresList = movie.genres.map(id => {
        const g = db.getGenres().find(g => g.id === id);
        return g ? g.name : '';
    }).join(', ');

    // Get country name
    const country = db.getCountries().find(c => c.id === movie.country);
    const countryStr = country ? `${country.flag} ${country.name}` : 'Đang cập nhật';

    // Generate episodes HTML
    let episodesHtml = '';
    if (movie.episodes && movie.episodes.length > 0) {
        episodesHtml = `
            <div class="episodes-section">
                <h3>Danh Sách Tập (${movie.episodes.length})</h3>
                <div class="episodes-grid">
                    ${movie.episodes.map(ep => `
                        <a href="watch.html?id=${movie.id}&ep=${ep.id}" class="episode-btn">
                            ${ep.name}
                        </a>
                    `).join('')}
                </div>
            </div>
        `;
    }

    const html = `
        <div class="detail-banner" style="background-image: url('${movie.banner}');"></div>
        <div class="detail-content">
            <div class="detail-poster">
                <img src="${movie.poster}" alt="${movie.title}">
            </div>
            
            <div class="detail-info">
                <h1 class="detail-title">${movie.title}</h1>
                <div class="detail-original-title">${movie.originalTitle}</div>
                
                <div class="meta-tags">
                    <span class="meta-tag imdb"><i class='bx bxs-star'></i> IMDb: ${movie.imdb}</span>
                    <span class="meta-tag">${movie.quality}</span>
                    <span class="meta-tag">${movie.year}</span>
                    <span class="meta-tag">${movie.duration}</span>
                    <span class="meta-tag"><i class='bx bx-show'></i> ${(movie.views/1000).toFixed(1)}K Lượt xem</span>
                </div>
                
                <div class="detail-actions">
                    <a href="watch.html?id=${movie.id}${(movie.episodes && movie.episodes.length > 0) ? '&ep='+movie.episodes[0].id : ''}" class="btn btn-primary btn-lg" style="font-size: 1.1rem; padding: 1rem 2rem;">
                        <i class='bx bx-play-circle' style="font-size: 1.5rem;"></i> XEM PHIM
                    </a>
                    <button class="btn btn-secondary" title="Thêm vào yêu thích">
                        <i class='bx bx-heart' style="font-size: 1.5rem;"></i>
                    </button>
                    <button class="btn btn-secondary" title="Chia sẻ">
                        <i class='bx bx-share-alt' style="font-size: 1.5rem;"></i>
                    </button>
                </div>
                
                <p class="detail-desc">${movie.description}</p>
                
                <div class="info-grid">
                    <div class="info-label">Trạng Thái</div>
                    <div class="info-value" style="color: var(--success); font-weight: 600;">${movie.status}</div>
                    
                    <div class="info-label">Thể Loại</div>
                    <div class="info-value">${genresList}</div>
                    
                    <div class="info-label">Quốc Gia</div>
                    <div class="info-value">${countryStr}</div>
                    
                    <div class="info-label">Đạo Diễn</div>
                    <div class="info-value">${movie.director}</div>
                    
                    <div class="info-label">Diễn Viên</div>
                    <div class="info-value">${movie.actors}</div>
                </div>

                ${episodesHtml}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderRelatedMovies(currentMovie, allMovies) {
    const container = document.getElementById('related-movies-grid');
    if (!container) return;

    // Logic: Same genres or same country, exclude current
    const related = allMovies.filter(m => 
        m.id !== currentMovie.id && 
        (m.country === currentMovie.country || m.genres.some(g => currentMovie.genres.includes(g)))
    ).slice(0, 6);

    let html = '';
    related.forEach(movie => {
        html += `
            <a href="detail.html?id=${movie.id}" class="movie-card">
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
                    </div>
                </div>
            </a>
        `;
    });

    container.innerHTML = html;
}
