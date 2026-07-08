// js/search.js

document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
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

    // Populate Selects
    const genres = db.getGenres();
    const genreSelect = document.getElementById('filterGenre');
    genres.forEach(g => {
        const option = document.createElement('option');
        option.value = g.id;
        option.textContent = g.name;
        genreSelect.appendChild(option);
    });

    const countries = db.getCountries();
    const countrySelect = document.getElementById('filterCountry');
    countries.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        countrySelect.appendChild(option);
    });

    // Initial Render (All Movies)
    const allMovies = db.getMovies();
    renderMovies(allMovies);

    // Search Logic
    const searchInput = document.getElementById('searchInput');
    const filterGenre = document.getElementById('filterGenre');
    const filterCountry = document.getElementById('filterCountry');
    const filterYear = document.getElementById('filterYear');
    const btnFilter = document.getElementById('btnFilter');

    function performSearch() {
        const rawQuery = searchInput.value.trim();
        const query = rawQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        const genreId = parseInt(filterGenre.value);
        const countryId = parseInt(filterCountry.value);
        const yearVal = filterYear.value;

        const results = allMovies.filter(m => {
            // Check Keyword
            let matchQuery = true;
            if (query) {
                const textToSearch = `${m.title || ''} ${m.originalTitle || ''} ${m.director || ''} ${m.actors || ''}`;
                const normalizedText = textToSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
                matchQuery = normalizedText.includes(query);
            }

            // Check Genre
            let matchGenre = true;
            if (genreId) {
                matchGenre = m.genres.includes(genreId);
            }

            // Check Country
            let matchCountry = true;
            if (countryId) {
                matchCountry = m.country === countryId;
            }

            // Check Year
            let matchYear = true;
            if (yearVal) {
                if (yearVal === 'old') {
                    matchYear = m.year < 2021;
                } else {
                    matchYear = m.year === parseInt(yearVal);
                }
            }

            return matchQuery && matchGenre && matchCountry && matchYear;
        });

        renderMovies(results);
    }

    btnFilter.addEventListener('click', performSearch);
    
    // Live search on type (with debounce)
    let timeout = null;
    searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(performSearch, 500);
    });
});

function renderMovies(movies) {
    const container = document.getElementById('searchResultsGrid');
    const noResults = document.getElementById('no-results');

    if (movies.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';
    let html = '';
    
    movies.forEach(movie => {
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
                        <span><i class='bx bxs-star'></i> ${movie.imdb}</span>
                    </div>
                </div>
            </a>
        `;
    });

    container.innerHTML = html;
}
