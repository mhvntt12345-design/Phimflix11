// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    const currentAdmin = db.getCurrentAdmin();
    if (!currentAdmin || currentAdmin.role !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Set Admin Profile
    const adminName = document.getElementById('adminName');
    const adminAvatar = document.getElementById('adminAvatar');
    if (adminName) adminName.textContent = currentAdmin.displayName || currentAdmin.username;
    if (adminAvatar) adminAvatar.textContent = (currentAdmin.displayName || currentAdmin.username).charAt(0).toUpperCase();

    // Logout and Dropdown logic
    const adminProfileMenuToggle = document.getElementById('adminProfileMenuToggle');
    const adminDropdown = document.getElementById('adminDropdown');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');

    if (adminProfileMenuToggle && adminDropdown) {
        adminProfileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = adminDropdown.style.display === 'block';
            adminDropdown.style.display = isVisible ? 'none' : 'block';
        });

        document.addEventListener('click', () => {
            adminDropdown.style.display = 'none';
        });
        
        // Prevent closing when clicking inside the dropdown
        adminDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                db.setCurrentAdmin(null);
                window.location.href = 'admin-login.html';
            }
        });
    }

    // Theme setup
    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('pf_admin_theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    icon.className = savedTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';

    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('pf_admin_theme', newTheme);
        icon.className = newTheme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
    });

    // Date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('vi-VN', dateOptions);
    }

    // Sidebar Toggle
    const toggleBtn = document.getElementById('toggleSidebarBtn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleBtn && sidebar && mainContent) {
        toggleBtn.addEventListener('click', () => {
            if (sidebar.style.transform === 'translateX(-100%)') {
                sidebar.style.transform = 'translateX(0)';
                mainContent.style.marginLeft = 'var(--sidebar-width)';
            } else {
                sidebar.style.transform = 'translateX(-100%)';
                mainContent.style.marginLeft = '0';
            }
        });
    }

    // Dynamic Tab Navigation System
    setupTabNavigation();

    // Init All Interfaces
    refreshAllData();

    // Modal Setup
    setupModalHandlers();
});

// Tab switcher logic
function setupTabNavigation() {
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const tabContents = document.querySelectorAll('.tab-content');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');

            // Active Class Sidebar menu
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Active Tab Content
            tabContents.forEach(tc => tc.classList.remove('active'));
            const targetEl = document.getElementById(targetTab);
            if (targetEl) {
                targetEl.classList.add('active');
            }

            // Custom renders on tab change
            if (targetTab === 'episodes-tab') {
                loadMoviesForEpisodeSelect();
            }
        });
    });
}

function refreshAllData() {
    const movies = db.getMovies();
    const stats = db.getStats();
    const users = db.getUsers();
    const genres = db.getGenres();
    const reports = db.getReports();

    renderStats(movies, stats, users);
    
    populateAdminFilters();
    applyMovieFilters();
    
    renderGenresTable(genres);
    renderUsersTable(users);
    renderCommentsTable(movies);
    renderReportsTable(reports);
}

function formatNumber(num) {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ---------------- FILTERS MANAGEMENT ----------------
window.populateAdminFilters = function() {
    const movies = db.getMovies();
    const genres = db.getGenres();
    const years = [...new Set(movies.map(m => m.year).filter(y => y))].sort((a,b) => b - a);

    const updateSelect = (selectEl, optionsHtml) => {
        if (!selectEl) return;
        const currentVal = selectEl.value;
        selectEl.innerHTML = optionsHtml;
        selectEl.value = currentVal;
    };

    const typeHtml = '<option value="">-- Tất cả dạng --</option>' + 
        '<option value="phim-le">Phim Lẻ</option>' +
        '<option value="phim-bo">Phim Bộ</option>' +
        '<option value="anime">Anime</option>' +
        '<option value="tv-show">TV Show</option>' +
        '<option value="hoat-hinh">Hoạt Hình</option>' +
        '<option value="phim-chieu-rap">Phim Chiếu Rạp</option>';
        
    const genreHtml = '<option value="">-- Tất cả thể loại --</option>' + 
        genres.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
        
    const yearHtml = '<option value="">-- Tất cả năm --</option>' + 
        years.map(y => `<option value="${y}">${y}</option>`).join('');

    updateSelect(document.getElementById('filterMovieType'), typeHtml);
    updateSelect(document.getElementById('filterMovieGenre'), genreHtml);
    updateSelect(document.getElementById('filterMovieYear'), yearHtml);
    
    updateSelect(document.getElementById('filterEpisodeMovieType'), typeHtml.replace('Tất cả dạng', 'Dạng'));
    updateSelect(document.getElementById('filterEpisodeMovieGenre'), genreHtml.replace('Tất cả thể loại', 'Thể loại'));
    updateSelect(document.getElementById('filterEpisodeMovieYear'), yearHtml.replace('Tất cả năm', 'Năm'));
}

window.applyMovieFilters = function() {
    let movies = db.getMovies();
    
    const type = document.getElementById('filterMovieType')?.value;
    const genre = document.getElementById('filterMovieGenre')?.value;
    const year = document.getElementById('filterMovieYear')?.value;
    const search = document.getElementById('filterMovieSearch')?.value.trim().toLowerCase();
    
    if (type) movies = movies.filter(m => m.type === type);
    if (year) movies = movies.filter(m => m.year == year);
    if (genre) {
        const gId = parseInt(genre);
        movies = movies.filter(m => m.genres && m.genres.includes(gId));
    }
    if (search) {
        const normalizedSearch = search.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        movies = movies.filter(m => {
            const textToSearch = `${m.title || ''} ${m.originalTitle || ''}`.toLowerCase();
            const normalizedText = textToSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
            return normalizedText.includes(normalizedSearch);
        });
    }
    
    renderMoviesTable(movies);
}

window.applyEpisodeFilters = function() {
    loadMoviesForEpisodeSelect();
}

// ---------------- DASHBOARD & MOVIE TAB ----------------
function renderStats(movies, stats, users) {
    const container = document.getElementById('dashboardStats');
    if (!container) return;
    
    const totalEpisodes = movies.reduce((sum, movie) => sum + (movie.episodes ? movie.episodes.length : 0), 0);
    const totalViews = movies.reduce((sum, movie) => sum + (movie.views || 0), 0);
    
    const cards = [
        { title: 'Tổng Số Phim', value: movies.length, icon: 'bx-film', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        { title: 'Tổng Số Tập Phim', value: formatNumber(totalEpisodes), icon: 'bx-video', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
        { title: 'Tổng Người Dùng', value: users.length, icon: 'bx-user', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { title: 'Tổng Lượt Xem', value: formatNumber(totalViews), icon: 'bx-bar-chart-alt-2', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
    ];

    container.innerHTML = cards.map(c => `
        <div class="stat-card">
            <div class="stat-icon" style="color: ${c.color}; background: ${c.bg};">
                <i class='bx ${c.icon}'></i>
            </div>
            <div class="stat-info">
                <h3>${c.title}</h3>
                <div class="value">${c.value}</div>
            </div>
        </div>
    `).join('');
}

function renderMoviesTable(movies) {
    const tbody = document.getElementById('moviesTableBody');
    if (!tbody) return;

    const sortedMovies = [...movies].sort((a, b) => b.id - a.id);
    
    tbody.innerHTML = sortedMovies.map((movie, index) => {
        let typeStr = 'Phim Lẻ';
        if (movie.type === 'phim-bo') typeStr = 'Phim Bộ';
        if (movie.type === 'anime') typeStr = 'Anime';
        if (movie.type === 'tv-show') typeStr = 'TV Show';

        const statusClass = movie.visible ? 'status-active' : 'status-inactive';
        const statusText = movie.visible ? 'Hiển Thị' : 'Đang Ẩn';

        return `
            <tr>
                <td style="text-align: center;"><input type="checkbox" class="movie-checkbox" value="${movie.id}" onchange="toggleDeleteBtn()"></td>
                <td>${index + 1}</td>
                <td>
                    <div class="movie-cell">
                        <img src="${movie.poster}" alt="">
                        <div>
                            <div style="font-weight: 600; color: var(--admin-text);">${movie.title}</div>
                            <div style="font-size: 0.8rem; color: var(--admin-text-light);">${movie.year}</div>
                        </div>
                    </div>
                </td>
                <td><span style="background: var(--admin-hover); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.85rem;">${typeStr}</span></td>
                <td>${formatNumber(movie.views)}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn btn-edit" title="Sửa" onclick="openEditModal('${movie.id}')"><i class='bx bx-edit-alt'></i></button>
                        <button class="action-btn btn-delete" title="Xóa" onclick="deleteMovie('${movie.id}')"><i class='bx bx-trash'></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ---------------- GENRES TAB ----------------
function renderGenresTable(genres) {
    const tbody = document.getElementById('genresTableBody');
    if (!tbody) return;
    tbody.innerHTML = genres.map((g, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${g.name}</strong></td>
            <td>/${g.slug}</td>
            <td>
                <button class="action-btn btn-delete" onclick="deleteGenre(${g.id})"><i class='bx bx-trash'></i></button>
            </td>
        </tr>
    `).join('');
}

window.saveGenre = function(e) {
    e.preventDefault();
    const name = document.getElementById('genreName').value.trim();
    if (!name) return;

    const genres = db.getGenres();
    const nextId = genres.length > 0 ? Math.max(...genres.map(g => g.id)) + 1 : 1;
    const slug = name.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    genres.push({ id: nextId, name, slug });
    db.saveGenres(genres);
    document.getElementById('genreName').value = '';
    refreshAllData();
    alert('Thêm thể loại thành công!');
}

window.deleteGenre = function(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thể loại này?')) {
        let genres = db.getGenres();
        genres = genres.filter(g => g.id !== id);
        db.saveGenres(genres);
        refreshAllData();
    }
}



// ---------------- EPISODES MANAGEMENT ----------------
function loadMoviesForEpisodeSelect() {
    const select = document.getElementById('episodeMovieSelect');
    if (!select) return;

    let filtered = db.getMovies();
    const type = document.getElementById('filterEpisodeMovieType')?.value;
    const genre = document.getElementById('filterEpisodeMovieGenre')?.value;
    const year = document.getElementById('filterEpisodeMovieYear')?.value;

    if (type) filtered = filtered.filter(m => m.type === type);
    if (year) filtered = filtered.filter(m => m.year == year);
    if (genre) {
        const gId = parseInt(genre);
        filtered = filtered.filter(m => m.genres && m.genres.includes(gId));
    }

    const sortedMovies = [...filtered].sort((a, b) => b.id - a.id);
    
    const currentVal = select.value;
    select.innerHTML = sortedMovies.map(m => `<option value="${m.id}">${m.title}</option>`).join('');
    
    if (currentVal && sortedMovies.some(m => m.id == currentVal)) {
        select.value = currentVal;
    }
    
    // Auto load first movie's episodes
    loadEpisodesForSelect();
}

window.loadEpisodesForSelect = function() {
    const select = document.getElementById('episodeMovieSelect');
    const tbody = document.getElementById('episodesTableBody');
    if (!select || !tbody) return;

    const movieId = parseInt(select.value);
    if (!movieId) return;

    const movies = db.getMovies();
    const movie = movies.find(m => m.id === movieId);

    if (!movie || !movie.episodes) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Không có tập phim nào</td></tr>';
        return;
    }

    tbody.innerHTML = movie.episodes.map((ep, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${ep.name}</strong></td>
            <td><code style="word-break: break-all;">${ep.videoUrl}</code></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn btn-edit" onclick="openEpisodeEditModal(${movie.id}, ${ep.id})"><i class='bx bx-edit-alt'></i></button>
                    <button class="action-btn btn-delete" onclick="deleteEpisode(${movie.id}, ${ep.id})"><i class='bx bx-trash'></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup Event Listeners for Episodes Modals
function setupModalHandlers() {
    const movieModal = document.getElementById('movieModal');
    const addMovieBtn = document.getElementById('addMovieBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelFormBtn = document.getElementById('cancelFormBtn');
    const movieForm = document.getElementById('movieForm');

    // Add Movie
    if (addMovieBtn && movieModal) {
        addMovieBtn.addEventListener('click', () => {
            movieForm.reset();
            document.getElementById('formMovieId').value = '';
            document.getElementById('modalTitle').textContent = 'Thêm Phim Mới';

            // Populate genres
            const genresContainer = document.getElementById('formGenres');
            if (genresContainer) {
                const allGenres = db.getGenres();
                genresContainer.innerHTML = allGenres.map(g => `
                    <label style="font-weight: normal; font-size: 0.9rem; display: flex; align-items: center; gap: 0.3rem;">
                        <input type="checkbox" name="movieGenres" value="${g.id}"> ${g.name}
                    </label>
                `).join('');
            }

            movieModal.classList.add('show');
        });
    }

    const hideMovieModal = () => movieModal.classList.remove('show');
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideMovieModal);
    if (cancelFormBtn) cancelFormBtn.addEventListener('click', hideMovieModal);

    if (movieForm) {
        movieForm.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[SAVE] Form submitted');
            try {
                saveMovieData();
            } catch(err) {
                console.error('[SAVE ERROR]', err);
                alert('Lỗi khi lưu: ' + err.message);
            }
        });
    }

    // --- API Modal Setup ---
    const apiMovieModal = document.getElementById('apiMovieModal');
    const addMovieApiBtn = document.getElementById('addMovieApiBtn');
    const closeApiModalBtn = document.getElementById('closeApiModalBtn');
    const cancelApiFormBtn = document.getElementById('cancelApiFormBtn');
    const apiMovieForm = document.getElementById('apiMovieForm');
    const fetchApiDataBtn = document.getElementById('fetchApiDataBtn');
    const saveApiMovieBtn = document.getElementById('saveApiMovieBtn');
    
    let fetchedApiMovieDataList = [];

    if (addMovieApiBtn && apiMovieModal) {
        addMovieApiBtn.addEventListener('click', () => {
            if (apiMovieForm) apiMovieForm.reset();
            document.getElementById('apiMoviePreview').style.display = 'none';
            if (saveApiMovieBtn) saveApiMovieBtn.disabled = true;
            fetchedApiMovieDataList = [];
            apiMovieModal.classList.add('show');
        });
    }

    const hideApiModal = () => apiMovieModal.classList.remove('show');
    if (closeApiModalBtn) closeApiModalBtn.addEventListener('click', hideApiModal);
    if (cancelApiFormBtn) cancelApiFormBtn.addEventListener('click', hideApiModal);

    if (fetchApiDataBtn) {
        fetchApiDataBtn.addEventListener('click', async () => {
            const urlsText = document.getElementById('apiMovieUrl').value.trim();
            if (!urlsText) {
                alert('Vui lòng nhập URL API');
                return;
            }
            
            const urls = urlsText.split('\n').map(u => u.trim()).filter(u => u);
            if (urls.length === 0) return;

            fetchApiDataBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
            fetchApiDataBtn.disabled = true;
            fetchedApiMovieDataList = [];
            
            try {
                for (let rawUrl of urls) {
                    let url = rawUrl;
                    try {
                        let urlObj = new URL(url);
                        // Convert ophim/kkphim frontend url to v1/api url if missing
                        if ((urlObj.hostname.includes('ophim') || urlObj.hostname.includes('phimapi.com') || urlObj.hostname.includes('kkphim')) && !urlObj.pathname.startsWith('/v1/api/') && !urlObj.pathname.startsWith('/api/v1/')) {
                            urlObj.pathname = '/v1/api' + urlObj.pathname;
                            url = urlObj.toString();
                        }
                    } catch(e) {}

                    const res = await fetch(url);
                    const data = await res.json();
                    
                    if (data && (data.status === true || data.status === 'success' || data.status === 1)) {
                        const itemData = data.movie || data.item || (data.data && (data.data.movie || data.data.item));
                        const episodesData = data.episodes || (data.data && data.data.episodes) || [];
                        const listItems = data.items || (data.data && data.data.items);

                        if (itemData) {
                            // It's a single movie URL
                            fetchedApiMovieDataList.push({ data: { movie: itemData, episodes: episodesData }, url: url });
                        } else if (listItems && Array.isArray(listItems)) {
                            // It's a list API (e.g. /danh-sach/)
                            const domain = new URL(url).origin;
                            for (let item of listItems) {
                                if (item.slug) {
                                    const movieUrl = `${domain}/v1/api/phim/${item.slug}`;
                                    try {
                                        const mRes = await fetch(movieUrl);
                                        const mData = await mRes.json();
                                        if (mData && (mData.status === true || mData.status === 'success' || mData.status === 1)) {
                                            const mItemData = mData.movie || mData.item || (mData.data && (mData.data.movie || mData.data.item));
                                            const mEpisodesData = mData.episodes || (mData.data && mData.data.episodes) || [];
                                            if (mItemData) {
                                                fetchedApiMovieDataList.push({ data: { movie: mItemData, episodes: mEpisodesData }, url: movieUrl });
                                            }
                                        }
                                    } catch(e) {
                                        console.error('Lỗi tải phim từ danh sách', movieUrl, e);
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (fetchedApiMovieDataList.length > 0) {
                    const firstData = fetchedApiMovieDataList[0].data;
                    document.getElementById('apiPreviewTitle').textContent = `Đã lấy dữ liệu ${fetchedApiMovieDataList.length} phim. (Ví dụ: ${firstData.movie.name})`;
                    document.getElementById('apiPreviewPoster').src = firstData.movie.thumb_url;
                    
                    // strip html tags
                    const tmp = document.createElement("DIV");
                    tmp.innerHTML = firstData.movie.content;
                    document.getElementById('apiPreviewDesc').textContent = tmp.textContent || tmp.innerText || "";
                    
                    document.getElementById('apiMoviePreview').style.display = 'block';
                    if (saveApiMovieBtn) saveApiMovieBtn.disabled = false;
                } else {
                    alert('Không tìm thấy dữ liệu API hợp lệ cho các URL đã nhập.');
                }
            } catch (e) {
                alert('Lỗi khi tải dữ liệu từ API: ' + e.message);
            }
            fetchApiDataBtn.innerHTML = 'Lấy Dữ Liệu';
            fetchApiDataBtn.disabled = false;
        });
    }

    if (apiMovieForm) {
        apiMovieForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (fetchedApiMovieDataList.length === 0) return;
            
            let count = 0;
            fetchedApiMovieDataList.forEach(item => {
                saveMovieFromApi(item.data, item.url, true);
                count++;
            });
            
            refreshAllData();
            alert(`Đã lưu / cập nhật ${count} phim từ API thành công!`);
            hideApiModal();
        });
    }

    // Setup Sync API Button
    const syncApiBtn = document.getElementById('syncApiBtn');
    if (syncApiBtn) {
        syncApiBtn.addEventListener('click', async () => {
            const movies = db.getMovies();
            const apiMovies = movies.filter(m => m.apiUrl);
            
            if (apiMovies.length === 0) {
                alert('Không có phim nào được thêm từ API để đồng bộ.');
                return;
            }
            
            let newDomain = prompt(`Tìm thấy ${apiMovies.length} phim từ API.\n\nNếu tên miền OPhim có thay đổi, vui lòng nhập tên miền mới (VD: ophim17.cc).\nNếu không thay đổi, hãy để trống và nhấn OK để bắt đầu đồng bộ:`);
            
            if (newDomain === null) return; // User cancelled
            
            newDomain = newDomain.trim();
            if (newDomain) {
                // remove http/https and trailing slash
                newDomain = newDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
                
                let allMovies = db.getMovies();
                let hasChanges = false;
                
                apiMovies.forEach(am => {
                    try {
                        const urlObj = new URL(am.apiUrl);
                        const newUrl = `https://${newDomain}${urlObj.pathname}${urlObj.search}`;
                        am.apiUrl = newUrl; // Update local ref
                        
                        const idx = allMovies.findIndex(m => m.id === am.id);
                        if (idx !== -1) {
                            allMovies[idx].apiUrl = newUrl;
                            hasChanges = true;
                        }
                    } catch(e) {}
                });
                
                if (hasChanges) db.saveMovies(allMovies);
            }

            syncApiBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Đang đồng bộ...';
            syncApiBtn.disabled = true;

            let updatedCount = 0;
            for (let m of apiMovies) {
                try {
                    const res = await fetch(m.apiUrl);
                    const data = await res.json();
                    if (data && data.status && data.movie) {
                        saveMovieFromApi({ movie: data.movie, episodes: data.episodes }, m.apiUrl, true);
                        updatedCount++;
                    }
                } catch (e) {
                    console.error('Lỗi đồng bộ phim', m.title, e);
                }
            }

            refreshAllData();
            alert(`Đã đồng bộ thành công ${updatedCount}/${apiMovies.length} phim.`);
            syncApiBtn.innerHTML = '<i class="bx bx-sync"></i> Đồng Bộ API';
            syncApiBtn.disabled = false;
        });
    }

    // Episode Modal Setup
    const episodeModal = document.getElementById('episodeModal');
    const addEpBtn = document.getElementById('addEpisodeBtn');
    const closeEpBtn = document.getElementById('closeEpisodeModalBtn');
    const cancelEpBtn = document.getElementById('cancelEpisodeFormBtn');
    const epForm = document.getElementById('episodeForm');

    if (addEpBtn && episodeModal) {
        addEpBtn.addEventListener('click', () => {
            resetEpisodeModal();
            document.getElementById('episodeModalTitle').textContent = 'Thêm Tập Phim Mới';
            episodeModal.classList.add('show');
        });
    }

    const hideEpModal = () => episodeModal.classList.remove('show');
    if (closeEpBtn) closeEpBtn.addEventListener('click', hideEpModal);
    if (cancelEpBtn) cancelEpBtn.addEventListener('click', hideEpModal);

    if (epForm) {
        epForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveEpisodeData();
        });
    }

}

function resetEpisodeModal() {
    const epForm = document.getElementById('episodeForm');
    if (epForm) epForm.reset();
    document.getElementById('formEpisodeId').value = '';

    const submitBtn = document.getElementById('episodeSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="bx bx-save"></i> Lưu Lại';
        submitBtn.disabled = false;
    }
}

window.openEpisodeEditModal = function(movieId, epId) {
    const modal = document.getElementById('episodeModal');
    if (!modal) return;

    resetEpisodeModal();

    const movies = db.getMovies();
    const movie = movies.find(m => m.id === movieId);
    const ep = movie.episodes.find(e => e.id === epId);

    if (!ep) return;

    document.getElementById('episodeModalTitle').textContent = 'Sửa Tập Phim';
    document.getElementById('formEpisodeId').value = ep.id;
    document.getElementById('formEpisodeName').value = ep.name;
    document.getElementById('formEpisodeUrl').value = ep.videoUrl || '';

    modal.classList.add('show');
}

function saveEpisodeData() {
    const select = document.getElementById('episodeMovieSelect');
    const movieId = parseInt(select.value);
    if (!movieId) {
        alert('Vui lòng chọn phim trước!');
        return;
    }

    const epIdVal = document.getElementById('formEpisodeId').value;
    const name = document.getElementById('formEpisodeName').value.trim();
    const url = document.getElementById('formEpisodeUrl').value.trim();

    if (!name || !url) {
        alert('Vui lòng nhập tên tập phim và link video!');
        return;
    }

    finishSavingEpisodeData(movieId, epIdVal, name, url);
    document.getElementById('episodeModal').classList.remove('show');
}

function finishSavingEpisodeData(movieId, epIdVal, name, videoUrl) {
    let movies = db.getMovies();
    const movieIdx = movies.findIndex(m => m.id === movieId);
    if (movieIdx === -1) return;

    let episodes = movies[movieIdx].episodes || [];

    if (epIdVal) {
        // Edit episode
        const epId = parseInt(epIdVal);
        episodes = episodes.map(e => e.id === epId ? { ...e, name, videoUrl } : e);
    } else {
        // Add episode
        const nextId = episodes.length > 0 ? Math.max(...episodes.map(e => e.id)) + 1 : 1;
        episodes.push({ id: nextId, name, videoUrl });
    }

    movies[movieIdx].episodes = episodes;
    db.saveMovies(movies);
    loadEpisodesForSelect();
    alert('Cập nhật tập phim thành công!');
}

window.deleteEpisode = function(movieId, epId) {
    if (confirm('Bạn có chắc chắn muốn xóa tập này?')) {
        let movies = db.getMovies();
        const movieIdx = movies.findIndex(m => m.id === movieId);
        if (movieIdx === -1) return;

        movies[movieIdx].episodes = movies[movieIdx].episodes.filter(e => e.id !== epId);
        db.saveMovies(movies);
        loadEpisodesForSelect();
    }
}

// ---------------- USER MANAGEMENT ----------------
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td><strong>${u.username}</strong></td>
            <td>${u.displayName || ''}</td>
            <td>${u.email || ''}</td>
            <td><span style="background: var(--admin-hover); padding: 0.2rem 0.6rem; border-radius: 4px; font-weight:600;">${u.role}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-edit" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="toggleUserRole('${u.username}')">Đổi Quyền</button>
                    <button class="action-btn btn-delete" onclick="deleteUser('${u.username}')"><i class='bx bx-trash'></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.toggleUserRole = function(username) {
    let users = db.getUsers();
    users = users.map(u => {
        if (u.username === username) {
            const nextRole = u.role === 'admin' ? 'user' : 'admin';
            return { ...u, role: nextRole };
        }
        return u;
    });
    db.saveUsers(users);
    refreshAllData();
}

window.deleteUser = function(username) {
    if (username === 'admin') {
        alert('Không thể xóa tài khoản admin hệ thống!');
        return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"?`)) {
        let users = db.getUsers();
        users = users.filter(u => u.username !== username);
        db.saveUsers(users);
        refreshAllData();
    }
}

// ---------------- COMMENT MANAGEMENT ----------------
function renderCommentsTable(movies) {
    const tbody = document.getElementById('commentsTableBody');
    if (!tbody) return;

    let html = '';
    movies.forEach(movie => {
        if (movie.comments && movie.comments.length > 0) {
            movie.comments.forEach((c, idx) => {
                html += `
                    <tr>
                        <td><strong>${movie.title}</strong></td>
                        <td>${c.username}</td>
                        <td>${c.content}</td>
                        <td>${c.date || ''}</td>
                        <td>
                            <button class="action-btn btn-delete" onclick="deleteComment(${movie.id}, ${idx})"><i class='bx bx-trash'></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    });

    if (!html) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--admin-text-light)">Chưa có bình luận nào.</td></tr>';
    } else {
        tbody.innerHTML = html;
    }
}

window.deleteComment = function(movieId, commentIndex) {
    if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
        let movies = db.getMovies();
        const movieIdx = movies.findIndex(m => m.id === movieId);
        if (movieIdx !== -1) {
            movies[movieIdx].comments.splice(commentIndex, 1);
            db.saveMovies(movies);
            refreshAllData();
        }
    }
}

// ---------------- REPORT MANAGEMENT ----------------
function renderReportsTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;

    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--admin-text-light)">Không có báo cáo sự cố nào.</td></tr>';
        return;
    }

    tbody.innerHTML = reports.map((r, idx) => `
        <tr>
            <td><strong>${r.movieTitle || 'N/A'}</strong></td>
            <td>Tập ${r.episodeId || '1'}</td>
            <td><span style="color: var(--danger); font-weight:600;">${r.type}</span></td>
            <td>${r.detail}</td>
            <td><span style="color: ${r.resolved ? 'var(--success)' : 'var(--danger)'}; font-weight:600;">${r.resolved ? 'Đã Xử Lý' : 'Chờ Xử Lý'}</span></td>
            <td>
                ${!r.resolved ? `<button class="btn btn-edit" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;" onclick="resolveReport(${idx})">Duyệt Xong</button>` : 'N/A'}
            </td>
        </tr>
    `).join('');
}

window.resolveReport = function(index) {
    let reports = db.getReports();
    if (reports[index]) {
        reports[index].resolved = true;
        db.saveReports(reports);
        refreshAllData();
        alert('Đã duyệt xử lý xong báo cáo lỗi!');
    }
}

// Reuse saving movie logic from before
window.openEditModal = function(id) {
    const modal = document.getElementById('movieModal');
    const movies = db.getMovies();
    const movie = movies.find(m => m.id == id);

    if (!movie || !modal) return;

    document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Phim';
    document.getElementById('formMovieId').value = movie.id;
    document.getElementById('formTitle').value = movie.title;
    document.getElementById('formOriginalTitle').value = movie.originalTitle;
    document.getElementById('formType').value = movie.type;
    document.getElementById('formYear').value = movie.year;
    document.getElementById('formPoster').value = movie.poster;
    document.getElementById('formBanner').value = movie.banner;
    document.getElementById('formDirector').value = movie.director || '';
    document.getElementById('formActors').value = movie.actors || '';
    document.getElementById('formDuration').value = movie.duration || '';
    document.getElementById('formImdb').value = movie.imdb || '7.0';
    document.getElementById('formQuality').value = movie.quality || '1080p';
    document.getElementById('formStatus').value = movie.status || 'Hoàn Thành';
    document.getElementById('formDescription').value = movie.description;
    
    document.getElementById('formFeatured').checked = !!movie.featured;
    document.getElementById('formVisible').checked = !!movie.visible;

    // Populate genres
    const genresContainer = document.getElementById('formGenres');
    if (genresContainer) {
        const allGenres = db.getGenres();
        const movieGenres = movie.genres || [];
        genresContainer.innerHTML = allGenres.map(g => `
            <label style="font-weight: normal; font-size: 0.9rem; display: flex; align-items: center; gap: 0.3rem;">
                <input type="checkbox" name="movieGenres" value="${g.id}" ${movieGenres.includes(g.id) ? 'checked' : ''}> ${g.name}
            </label>
        `).join('');
    }

    modal.classList.add('show');
}

function saveMovieData() {
    const idVal = document.getElementById('formMovieId').value;
    console.log('[SAVE] saveMovieData called, idVal =', idVal, 'type =', typeof idVal);
    const title = document.getElementById('formTitle').value;
    if (!title) { alert('Vui lòng nhập tên phim!'); return; }

    const originalTitle = document.getElementById('formOriginalTitle').value;
    const type = document.getElementById('formType').value;
    const year = parseInt(document.getElementById('formYear').value);
    const poster = document.getElementById('formPoster').value;
    const banner = document.getElementById('formBanner').value;
    const director = document.getElementById('formDirector').value;
    const actors = document.getElementById('formActors').value;
    const duration = document.getElementById('formDuration').value;
    const imdb = parseFloat(document.getElementById('formImdb').value);
    const quality = document.getElementById('formQuality').value;
    const status = document.getElementById('formStatus').value;
    const description = document.getElementById('formDescription').value;
    const featured = document.getElementById('formFeatured').checked;
    const visible = document.getElementById('formVisible').checked;

    const selectedGenres = Array.from(document.querySelectorAll('input[name="movieGenres"]:checked')).map(cb => parseInt(cb.value));
    console.log('[SAVE] Data collected:', { idVal, title, featured, visible });

    finishSavingMovieData(idVal, title, originalTitle, type, year, poster, banner, director, actors, duration, imdb, quality, status, description, featured, visible, selectedGenres);
}

function finishSavingMovieData(idVal, title, originalTitle, type, year, poster, banner, director, actors, duration, imdb, quality, status, description, featured, visible, genres) {
    console.log('[SAVE] finishSavingMovieData called, idVal =', idVal);
    let movies = db.getMovies();
    console.log('[SAVE] Total movies loaded:', movies.length);

    if (idVal) {
        // Edit Mode
        const beforeCount = movies.filter(m => m.id == idVal).length;
        console.log('[SAVE] Edit mode, movies matching id:', beforeCount);
        movies = movies.map(m => {
            if (m.id == idVal) {
                return {
                    ...m,
                    title, originalTitle, type, year, poster, banner,
                    director, actors, duration, imdb, quality, status,
                    description, featured, visible, genres
                };
            }
            return m;
        });
        alert('Cập nhật thông tin phim thành công!');
    } else {
        // Add Mode
        let validMovies = movies.map(m => parseInt(m.id)).filter(id => !isNaN(id));
        let maxId = validMovies.length > 0 ? Math.max(...validMovies) : 0;
        
        let deletedIds = db.get('deleted_movies');
        if (!Array.isArray(deletedIds)) deletedIds = [];
        let validDeletedIds = deletedIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (validDeletedIds.length > 0) {
            maxId = Math.max(maxId, ...validDeletedIds);
        }
        
        const nextId = maxId + 1;
        const newMovie = {
            id: nextId,
            title, originalTitle, type, year, poster, banner,
            director, actors, duration, imdb, quality, status,
            description, featured, visible, genres,
            views: 0,
            episodes: [],
            comments: [],
            createdAt: new Date().toISOString().split('T')[0]
        };
        movies.push(newMovie);
        alert('Thêm phim mới thành công!');
    }

    console.log('[SAVE] Calling db.saveMovies with', movies.length, 'movies');
    db.saveMovies(movies);
    console.log('[SAVE] db.saveMovies done, verifying localStorage...');
    const saved = JSON.parse(localStorage.getItem('pf_movies') || '[]');
    console.log('[SAVE] localStorage has', saved.length, 'movies after save');
    refreshAllData();
    document.getElementById('movieModal').classList.remove('show');
}

window.deleteMovie = function(id) {
    if (confirm('Bạn có chắc chắn muốn xóa phim này?')) {
        let movies = db.getMovies();
        movies = movies.filter(m => m.id != id);
        db.saveMovies(movies);
        
        let deletedIds = db.get('deleted_movies');
        if (!Array.isArray(deletedIds)) deletedIds = [];
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            db.set('deleted_movies', deletedIds);
        }
        
        refreshAllData();
        alert('Đã xóa phim thành công!');
    }
}

window.toggleDeleteBtn = function() {
    const checkboxes = document.querySelectorAll('.movie-checkbox:checked');
    const deleteBtn = document.getElementById('deleteSelectedMoviesBtn');
    if (deleteBtn) {
        deleteBtn.style.display = checkboxes.length > 0 ? 'inline-flex' : 'none';
        deleteBtn.innerHTML = `<i class='bx bx-trash'></i> Xóa Phim Đã Chọn (${checkboxes.length})`;
    }
    
    const selectAllCheckbox = document.getElementById('selectAllMovies');
    if (selectAllCheckbox) {
        const allCheckboxes = document.querySelectorAll('.movie-checkbox');
        selectAllCheckbox.checked = allCheckboxes.length > 0 && checkboxes.length === allCheckboxes.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const selectAllCheckbox = document.getElementById('selectAllMovies');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.movie-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
            toggleDeleteBtn();
        });
    }

    const deleteSelectedBtn = document.getElementById('deleteSelectedMoviesBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.movie-checkbox:checked');
            if (checkboxes.length === 0) return;
            
            if (confirm(`Bạn có chắc chắn muốn xóa ${checkboxes.length} phim đã chọn? Hành động này không thể hoàn tác!`)) {
                let movies = db.getMovies();
                const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.value));
                movies = movies.filter(m => !idsToDelete.includes(m.id));
                db.saveMovies(movies);
                
                let deletedIds = db.get('deleted_movies');
                if (!Array.isArray(deletedIds)) deletedIds = [];
                idsToDelete.forEach(id => {
                    if (!deletedIds.includes(id)) deletedIds.push(id);
                });
                db.set('deleted_movies', deletedIds);
                
                refreshAllData();
                toggleDeleteBtn();
                
                // Uncheck selectAll
                const selectAll = document.getElementById('selectAllMovies');
                if (selectAll) selectAll.checked = false;
                
                alert(`Đã xóa thành công ${checkboxes.length} phim!`);
            }
        });
    }


});

// ---------------- API MOVIE MANAGEMENT ----------------
window.saveMovieFromApi = function(data, apiUrl = '', silent = false) {
    const movieData = data.movie || data.film || {};
    // Ophim uses data.episodes, NguonC uses data.movie.episodes
    const episodesData = data.episodes || movieData.episodes || [];
    
    let movies = db.getMovies();
    
    // Fetch categories and map to genres
    const allGenres = db.getGenres();
    let matchedGenres = [];
    const apiCategories = movieData.category || movieData.genres || [];
    
    let categoryList = [];
    if (Array.isArray(apiCategories)) {
        categoryList = apiCategories;
    } else if (typeof apiCategories === 'object') {
        Object.values(apiCategories).forEach(catGroup => {
            if (catGroup.list && Array.isArray(catGroup.list)) {
                categoryList = categoryList.concat(catGroup.list);
            }
        });
    }

    // Map Ophim/NguonC type to our type
    let type = 'phim-le';
    if (movieData.type === 'series' || movieData.type === 'hoathinh' || categoryList.some(c => c.name === 'Phim bộ')) type = 'phim-bo';
    if (movieData.type === 'hoathinh') type = 'hoat-hinh';
    else if (movieData.type === 'tvshows') type = 'tv-show';

    // Map genres and detect Anime
    let genresUpdated = false;
    categoryList.forEach(c => {
        if (!c.name) return;
        const apiGenreName = c.name.trim();
        const apiGenreNameLower = apiGenreName.toLowerCase();
        
        // Force type to anime if category is Anime
        if (apiGenreNameLower === 'anime' || apiGenreNameLower.includes('anime')) {
            type = 'anime';
        }
        
        // Force type to phim-chieu-rap if category says "Chiếu Rạp"
        if (apiGenreNameLower.includes('chiếu rạp')) {
            type = 'phim-chieu-rap';
        }

        const matched = allGenres.find(g => g.name.toLowerCase() === apiGenreNameLower || (c.slug && g.slug === c.slug));
        if (matched) {
            if (!matchedGenres.includes(matched.id)) {
                matchedGenres.push(matched.id);
            }
        } else {
            // Auto create missing genre
            const nextGId = allGenres.length > 0 ? Math.max(...allGenres.map(g => g.id)) + 1 : 1;
            const newSlug = apiGenreNameLower.replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const newG = { id: nextGId, name: apiGenreName, slug: newSlug };
            allGenres.push(newG);
            matchedGenres.push(nextGId);
            genresUpdated = true;
        }
    });

    if (genresUpdated) {
        db.saveGenres(allGenres);
    }
    
    // Process episodes
    let eps = [];
    if (episodesData.length > 0) {
        // Ophim uses server_data, NguonC uses items
        const serverData = episodesData[0].server_data || episodesData[0].items || [];
        eps = serverData.map((ep, index) => {
            // Ophim: link_m3u8, link_embed. NguonC: m3u8, embed.
            // Prefer link_m3u8 for Ophim (Ad-free native play), but prefer embed for NguonC (because NguonC m3u8 blocks CORS)
            let vUrl = ep.link_m3u8 || ep.embed || ep.link_embed || ep.m3u8 || '';
            // If no valid episode link, fallback to trailer
            if (!vUrl && movieData.trailer_url) {
                vUrl = movieData.trailer_url;
                // Convert YouTube watch url to embed url
                if (vUrl.includes('youtube.com/watch?v=')) {
                    vUrl = vUrl.replace('watch?v=', 'embed/');
                }
            }
            // Enforce HTTPS
            vUrl = vUrl.replace(/^http:\/\//i, 'https://');
            return {
                id: index + 1,
                name: ep.name || `Tập ${index + 1}`,
                videoUrl: vUrl
            };
        });
    } else if (movieData.trailer_url) {
        // Fallback: create a Trailer episode if no episodes provided
        let tUrl = movieData.trailer_url;
        if (tUrl.includes('youtube.com/watch?v=')) {
            tUrl = tUrl.replace('watch?v=', 'embed/');
        }
        tUrl = tUrl.replace(/^http:\/\//i, 'https://');
        eps = [{
            id: 1,
            name: "Trailer",
            videoUrl: tUrl
        }];
    }

    // remove html tags from content
    const tmp = document.createElement("DIV");
    tmp.innerHTML = movieData.content || movieData.description || "";
    const desc = tmp.textContent || tmp.innerText || "";

    let existingMovieIdx = -1;
    if (apiUrl) {
        existingMovieIdx = movies.findIndex(m => m.apiUrl === apiUrl);
    }
    if (existingMovieIdx === -1) {
        existingMovieIdx = movies.findIndex(m => m.title === movieData.name);
    }

    if (existingMovieIdx !== -1) {
        // Update existing movie
        let existingMovie = movies[existingMovieIdx];
        existingMovie.episodes = eps;
        existingMovie.status = (movieData.status === 'completed' || movieData.current_episode === 'FULL') ? 'Hoàn Thành' : 'Đang Chiếu';
        existingMovie.quality = movieData.quality || existingMovie.quality;
        if (apiUrl && !existingMovie.apiUrl) existingMovie.apiUrl = apiUrl;
        
        movies[existingMovieIdx] = existingMovie;
        db.saveMovies(movies);
        if (!silent) {
            refreshAllData();
            alert('Cập nhật tập phim thành công!');
        }
    } else {
        let validMovies = movies.map(m => parseInt(m.id)).filter(id => !isNaN(id));
        let maxId = validMovies.length > 0 ? Math.max(...validMovies) : 0;
        
        let deletedIds = db.get('deleted_movies');
        if (!Array.isArray(deletedIds)) deletedIds = [];
        let validDeletedIds = deletedIds.map(id => parseInt(id)).filter(id => !isNaN(id));
        if (validDeletedIds.length > 0) {
            maxId = Math.max(maxId, ...validDeletedIds);
        }
        
        const nextId = maxId + 1;
        
        const newMovie = {
            id: nextId,
            title: movieData.name,
            originalTitle: movieData.origin_name || movieData.original_name || '',
            type: type,
            year: parseInt(movieData.year) || new Date().getFullYear(),
            poster: movieData.thumb_url,
            banner: movieData.poster_url || movieData.thumb_url,
            director: Array.isArray(movieData.director) ? movieData.director.join(', ') : (movieData.director || ''),
            actors: Array.isArray(movieData.actor) ? movieData.actor.join(', ') : (movieData.actor || movieData.casts || ''),
            duration: movieData.time || '',
            imdb: parseFloat(movieData.tmdb?.vote_average) || parseFloat(movieData.imdb?.vote_average) || 7.0,
            quality: movieData.quality || 'HD',
            status: (movieData.status === 'completed' || movieData.current_episode === 'FULL') ? 'Hoàn Thành' : 'Đang Chiếu',
            description: desc,
            featured: false,
            visible: true,
            genres: matchedGenres,
            views: movieData.view || 0,
            episodes: eps,
            comments: [],
            createdAt: new Date().toISOString().split('T')[0],
            apiUrl: apiUrl || ''
        };
        
        movies.push(newMovie);
        db.saveMovies(movies);
        if (!silent) {
            refreshAllData();
            alert('Thêm phim bằng API thành công!');
        }
    }
}

// Re-render when Firebase syncs data in background
window.addEventListener('cloudDataSynced', () => {
    console.log('Firebase synced! Re-rendering admin dashboard...');
    refreshAllData();
});
