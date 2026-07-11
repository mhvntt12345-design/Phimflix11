const fs = require('fs');
const path = require('path');

// ============================================================
//  PHIMFLIX — TOOL ĐỒNG BỘ NGUONC  (v3.0 — NÂNG CẤP)
// ============================================================

// ── CẤU HÌNH SỐ TRANG ──────────────────────────────────────
// Bạn có thể sửa trực tiếp số ở đây để chọn trang muốn quét:
const START_PAGE = parseInt(process.argv[2]) || 700;
const END_PAGE = parseInt(process.argv[3]) || 800;

// ── CẤU HÌNH API ───────────────────────────────────────────
const API_LIST = 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=';
const API_DETAIL = 'https://phim.nguonc.com/api/film/';
const OUTPUT = path.join(__dirname, 'js/nguonc-data.js');

// ── CẤU HÌNH HIỆU NĂNG ─────────────────────────────────────
const DELAY_MS = 150;  // Nghỉ giữa mỗi request (ms)
const TIMEOUT_MS = 12000; // Timeout mỗi request (ms)
const MAX_RETRIES = 3;    // Số lần retry khi lỗi mạng
const SAVE_EVERY_N = 1;    // Lưu file sau mỗi N trang

// ── MAPPING ─────────────────────────────────────────────────
// Khớp với dữ liệu thực từ API NguonC (quét 10 trang)
const GENRE_MAP = {
    // Thể loại chính
    'Hành Động': 1,
    'Tình Cảm': 2,
    'Lãng Mạn': 2,       // = Tình Cảm
    'Phìm Hài': 3,
    'Hài Hước': 3,
    'Kinh Dị': 4,
    'Viễn Tưởng': 5,
    'Khoa Học Viễn Tưởng': 5,
    'Giả Tưởng': 5,
    'Hoạt Hình': 6,
    'Phiêu Lưu': 7,
    'Tâm Lý': 8,
    'Chính Kịch': 8,     // = Tâm Lý/Chính Kịch
    'Hình Sự': 9,
    'Gây Cấn': 9,         // = Hình Sự / Gây Cấn
    'Chiến Tranh': 10,
    'Võ Thuật': 11,
    'Cổ Trang': 12,
    'Lịch Sử': 12,        // = Cổ Trang / Lịch Sử
    'Thần Thoại': 13,
    'Anime': 14,
    'Bí Ẩn': 15,
    'Phìm Nhạc': 16,
};

const COUNTRY_MAP = {
    'Việt Nam': 1,
    'Hàn Quốc': 2,
    'Trung Quốc': 3,
    'Nhật Bản': 4,
    'Mỹ': 5,
    'Âu Mỹ': 5,
    'Canada': 5,          // Gộp vào Âu Mỹ
    'Thái Lan': 6,
    'Anh': 7,
    'Pháp': 8,
    'Hong Kong': 3,       // Gộp vào TQ
    'Đài Loan': 3,
};

// ── SERVER ƯU TIÊN (theo thứ tự) ────────────────────────────
// Ưu tiên server có tên chứa các từ khoá sau, theo thứ tự
const SERVER_PRIORITY = ['vietsub', 'phụ đề', 'sub', 'hd', 'full'];

// ============================================================
//  TIỆN ÍCH
// ============================================================

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function fetchJsonWithRetry(url, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, {
                signal: AbortSignal.timeout(TIMEOUT_MS),
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            const isLast = attempt === retries;
            if (isLast) throw new Error(`[${attempt}/${retries}] ${err.message}`);
            console.warn(`     ↩️  Thử lại lần ${attempt + 1}/${retries} (${err.message})`);
            await sleep(DELAY_MS * attempt * 2); // exponential backoff
        }
    }
}

// ============================================================
//  CHỌN SERVER TỐT NHẤT
// ============================================================

function pickBestServer(serverList) {
    if (!serverList || serverList.length === 0) return null;

    // 1. Tìm số tập lớn nhất trong tất cả các server
    const maxItemsCount = Math.max(...serverList.map(s => (s.items || []).length));

    // 2. Lọc ra danh sách các server có số tập bằng với số tập lớn nhất
    const topServers = serverList.filter(s => (s.items || []).length === maxItemsCount);

    // Nếu chỉ có 1 server có số tập lớn nhất, chọn luôn
    if (topServers.length === 1) return topServers[0];

    // 3. Nếu có nhiều server cùng số tập lớn nhất, ưu tiên theo từ khóa (Vietsub > HD...)
    for (const keyword of SERVER_PRIORITY) {
        const found = topServers.find(s =>
            s.server_name && s.server_name.toLowerCase().includes(keyword)
        );
        if (found) return found;
    }

    // Fallback: Lấy server đầu tiên trong nhóm nhiều tập nhất
    return topServers[0];
}

// ============================================================
//  PARSE EPISODES
// ============================================================

function parseEpisodes(serverList) {
    const server = pickBestServer(serverList);
    if (!server || !server.items || server.items.length === 0) return [];

    return server.items.map((ep, index) => ({
        id: index + 1,
        name: (ep.name || `Tập ${index + 1}`).trim(),
        videoUrl: ep.embed || ep.m3u8 || ep.link_embed || ep.link_m3u8 || '',
        // Lưu tên server để debug
        server: server.server_name || 'Unknown',
    })).filter(ep => ep.videoUrl); // Loại bỏ episodes không có link
}

// ============================================================
//  PARSE ALL SERVERS
// ============================================================

function parseAllServers(serverList) {
    if (!serverList || serverList.length === 0) return [];

    return serverList.map(server => ({
        server_name: server.server_name || 'Unknown',
        items: (server.items || []).map((ep, index) => ({
            id: index + 1,
            name: (ep.name || `Tập ${index + 1}`).trim(),
            videoUrl: ep.embed || ep.m3u8 || ep.link_embed || ep.link_m3u8 || ''
        })).filter(ep => ep.videoUrl)
    })).filter(server => server.items.length > 0);
}

// ============================================================
//  PHÂN TÍCH LOẠI PHIM — dùng category API thực từ NguonC
// ============================================================

function detectType(typeCat, genreCat) {
    // typeCat = category['1'].list — loại phim (Phim bộ, Phim lẻ, TV shows, Đang chiếu)
    // genreCat = category['2'].list — thể loại

    const typeNames = typeCat.map(c => (c.name || '').toLowerCase().trim());
    const genreNames = genreCat.map(c => (c.name || '').toLowerCase().trim());
    const allNames = [...typeNames, ...genreNames];

    // Ưu tiên từ category loại (chính xác nhất)
    if (typeNames.some(n => n === 'tv shows' || n.includes('tv show') || n.includes('tv-show'))) return 'tv-show';
    if (genreNames.some(n => n === 'anime')) return 'anime';
    if (allNames.some(n => n === 'hoạt hình' || n.includes('animation'))) return 'hoat-hinh';
    if (typeNames.some(n => n === 'phim lẻ')) return 'phim-le';
    if (typeNames.some(n => n === 'phim bộ')) return 'phim-bo';

    // Fallback: đoán theo từ khoá
    if (typeNames.some(n => n.includes('chiếu rạp') || n.includes('cinema'))) return 'phim-chieu-rap';
    if (typeNames.some(n => n.includes('bộ') || n.includes('series'))) return 'phim-bo';
    if (typeNames.some(n => n.includes('lẻ') || n.includes('single'))) return 'phim-le';

    return 'phim-le'; // default
}

// ============================================================
//  PHÂN TÍCH TRẠNG THÁI — chính xác theo current_episode API
// ============================================================

function detectStatus(currentEpisodeText, epCount, type) {
    if (!currentEpisodeText) {
        // Nếu là phim lẻ/chiếu rạp → mặc định Hoàn Thành
        if (type === 'phim-le' || type === 'phim-chieu-rap') return 'Hoàn Thành';
        return 'Đang Chiếu';
    }
    const t = currentEpisodeText.toLowerCase().trim();

    // Kiểm tra từ khoá hoàn thành
    if (
        t.includes('hoàn tất') ||
        t.includes('full') ||
        t.includes('complete') ||
        t.includes('end') ||
        t === 'full hd'
    ) return 'Hoàn Thành';

    // Phim lẻ luôn là hoàn thành
    if (type === 'phim-le' || type === 'phim-chieu-rap') return 'Hoàn Thành';

    return 'Đang Chiếu';
}

// ============================================================
//  FORMAT MOVIE OBJECT
// ============================================================

function formatMovie(nguoncData, movieId, opts = {}) {
    const m = nguoncData.movie;
    const { existingImdb = 0, existingViews = 0, existingComments = [], existingFeatured = false } = opts;

    const categories = m.category || {};
    const typeCat = (categories['1']?.list || []);
    const genreCat = (categories['2']?.list || []);
    const yearCat = (categories['3']?.list || []);
    const countryCat = (categories['4']?.list || []);

    const episodes = parseEpisodes(m.episodes || []);
    const allServers = parseAllServers(m.episodes || []);
    const type = detectType(typeCat, genreCat);
    const status = detectStatus(m.current_episode, episodes.length, type);

    const genres = genreCat.map(c => GENRE_MAP[c.name]).filter(Boolean);

    const country = countryCat.length > 0
        ? (COUNTRY_MAP[countryCat[0].name] || 5)
        : 5;

    const year = yearCat.length > 0
        ? (parseInt(yearCat[0].name) || new Date().getFullYear())
        : new Date().getFullYear();

    // Làm sạch description HTML
    const description = m.description
        ? m.description.replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim()
        : 'Đang cập nhật...';

    // Build search string (chuẩn hoá tiếng Việt)
    const _searchStr = `${m.name || ''} ${m.original_name || ''} ${m.director || ''} ${m.casts || ''}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase()
        .replace(/\s{2,}/g, ' ')
        .trim();

    // Tích hợp Vietsub / Thuyết minh vào chất lượng
    let qualityText = m.quality || 'HD';
    if (m.language && !qualityText.toLowerCase().includes(m.language.toLowerCase())) {
        qualityText += ` - ${m.language}`;
    }

    return {
        id: movieId,
        title: (m.name || '').trim(),
        slug: m.slug,
        originalTitle: (m.original_name || '').trim(),
        poster: m.poster_url || '',
        banner: m.thumb_url || '',
        description,
        genres: genres.length > 0 ? genres : [1],
        country,
        year,
        duration: m.time || 'Đang cập nhật',
        status,
        type,
        quality: qualityText,
        episode: m.current_episode || (type === 'phim-le' ? 'Full' : 'Tập 1'),
        _searchStr,
        director: m.director ? m.director.trim() : 'Đang cập nhật',
        actors: m.casts ? m.casts.trim() : 'Đang cập nhật',
        imdb: existingImdb || parseFloat((Math.random() * 4 + 5.5).toFixed(1)),
        views: existingViews || Math.floor(Math.random() * 500000) + 1000,
        featured: existingFeatured || false,
        visible: true,
        episodes,
        servers: allServers,
        comments: existingComments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// ============================================================
//  LƯU FILE (ATOMIC WRITE)
// ============================================================

function saveOutput(movies, label = '') {
    const tmpFile = OUTPUT + '.tmp';
    const content = `// PhimFlix — Nguonc Data (${new Date().toLocaleString('vi-VN')})\n`
        + `window.pfMoviesUpdateStamp = ${Date.now()};\n`
        + `window.pfMovies = ${JSON.stringify(movies, null, 2)};\n`;
    try {
        fs.writeFileSync(tmpFile, content, 'utf-8');
        try {
            if (fs.existsSync(OUTPUT)) {
                fs.unlinkSync(OUTPUT);
            }
            fs.renameSync(tmpFile, OUTPUT);
        } catch (renameErr) {
            console.warn(`⚠️ Rename failed (${renameErr.message}), falling back to direct write.`);
            fs.writeFileSync(OUTPUT, content, 'utf-8');
            if (fs.existsSync(tmpFile)) {
                try { fs.unlinkSync(tmpFile); } catch (e) { }
            }
        }
        if (label) console.log(`   💾 ${label} — Tổng: ${movies.length} phim`);
    } catch (err) {
        console.error(`❌ Ghi dữ liệu thất bại: ${err.message}`);
        throw err;
    }
}

// ============================================================
//  CẬP NHẬT CACHE HTML (busted versioned query string)
// ============================================================

function bustHtmlCache() {
    const ts = Date.now();
    ['index.html', 'admin.html'].forEach(file => {
        const fp = path.join(__dirname, file);
        if (!fs.existsSync(fp)) return;
        let html = fs.readFileSync(fp, 'utf-8');
        html = html
            .replace(/js\/nguonc-data\.js\?v=\d*/g, `js/nguonc-data.js?v=${ts}`)
            .replace(/js\/app\.js\?v=\d*/g, `js/app.js?v=${ts}`)
            .replace(/js\/data\.js\?v=\d*/g, `js/data.js?v=${ts}`);
        fs.writeFileSync(fp, html, 'utf-8');
    });
    console.log(`   🧹 Đã bust cache HTML (v=${ts})`);
}

// ============================================================
//  LOAD DỮ LIỆU CŨ
// ============================================================

function loadExisting() {
    if (!fs.existsSync(OUTPUT)) return { movies: [], slugMap: new Map(), nextId: 1000 };
    try {
        const raw = fs.readFileSync(OUTPUT, 'utf-8');
        const match = raw.match(/window\.pfMovies\s*=\s*(\[[\s\S]*?\]);\s*$/m);
        if (!match) throw new Error('Không parse được mảng JSON');
        const movies = JSON.parse(match[1]);
        const nextId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1000;
        const slugMap = new Map(movies.map(m => [m.slug, m]));
        console.log(`   → Đã tải ${movies.length} phim cũ. ID tiếp theo: ${nextId}`);
        return { movies, slugMap, nextId };
    } catch (err) {
        console.error(`⚠️  Không đọc được file cũ: ${err.message}. Bắt đầu từ đầu.`);
        return { movies: [], slugMap: new Map(), nextId: 1000 };
    }
}

// ============================================================
//  MAIN CRAWLER
// ============================================================

async function runCrawler() {
    const startTime = Date.now();
    const cfg = { start: START_PAGE, end: END_PAGE };
    console.log(`\n══════════════════════════════════════════════════`);
    console.log(`🚀  PHIMFLIX SYNC  —  SMART UPDATE`);
    console.log(`    Trang: ${cfg.start} → ${cfg.end}  |  Delay: ${DELAY_MS}ms  |  Retry: ${MAX_RETRIES}x`);
    console.log(`══════════════════════════════════════════════════\n`);

    // ── Load dữ liệu cũ ──────────────────────────────────────
    console.log('📦 Đang tải dữ liệu cũ...');
    let { movies: existingMovies, slugMap, nextId } = loadExisting();

    const stats = { added: 0, updated: 0, refreshed: 0, skipped: 0, errors: 0 };
    let totalPages = cfg.end;

    // ── Vòng lặp trang ───────────────────────────────────────
    for (let page = cfg.start; page <= cfg.end; page++) {
        process.stdout.write(`\n📄 Trang ${page}/${totalPages}...`);

        let listData;
        try {
            listData = await fetchJsonWithRetry(API_LIST + page);
        } catch (err) {
            console.error(`\n❌ Không thể lấy danh sách trang ${page}: ${err.message}`);
            stats.errors++;
            continue;
        }

        if (!listData || listData.status !== 'success' || !listData.items?.length) {
            console.log(' — Hết dữ liệu.');
            break;
        }

        // Cập nhật tổng trang thực tế từ API
        if (page === cfg.start && listData.paginate?.total_page) {
            const apiMaxPage = listData.paginate.total_page;
            totalPages = Math.min(cfg.end, apiMaxPage);
            console.log(`\n   ℹ️  API có ${listData.paginate.total_items} phim / ${apiMaxPage} trang. Sẽ cào đến trang ${totalPages}.`);
        }

        console.log(` (${listData.items.length} phim)`);

        // ── Xử lý từng phim trong trang ──────────────────────
        for (const item of listData.items) {
            const slug = item.slug;

            let detailData;
            try {
                detailData = await fetchJsonWithRetry(API_DETAIL + slug);
                await sleep(DELAY_MS);
            } catch (err) {
                console.error(`     ⚠️  Lỗi chi tiết [${slug}]: ${err.message}`);
                stats.errors++;
                await sleep(DELAY_MS * 2);
                continue;
            }

            if (!detailData?.movie) {
                console.log(`     ⚠️  API trả về rỗng: ${slug}`);
                stats.errors++;
                continue;
            }

            if (slugMap.has(slug)) {
                // ─── Phim ĐÃ TỒN TẠI → kiểm tra & cập nhật ───────
                const oldMovie = slugMap.get(slug);
                const newData = formatMovie(detailData, oldMovie.id, {
                    existingImdb: oldMovie.imdb,
                    existingViews: oldMovie.views,
                    existingComments: oldMovie.comments || [],
                    existingFeatured: oldMovie.featured || false,
                });

                const oldEpCount = (oldMovie.episodes || []).length;
                const newEpCount = newData.episodes.length;
                const oldEpText = (oldMovie.episode || '').trim();
                const newEpText = (newData.episode || '').trim();
                const hasEpCountChange = newEpCount !== oldEpCount;
                const hasEpTextChange = newEpText !== oldEpText;

                if (newEpCount > 0) {
                    // Xử lý cẩn thận ngày cập nhật
                    newData.createdAt = oldMovie.createdAt; // Giữ nguyên ngày tạo
                    newData.updatedAt = (hasEpCountChange || hasEpTextChange) ? new Date().toISOString() : oldMovie.updatedAt;

                    // Cập nhật toàn bộ data mới (bao gồm thể loại, phân loại, quốc gia chuẩn)
                    // formatMovie đã giữ lại views, imdb, comments, featured ở trên rồi
                    Object.assign(oldMovie, newData);

                    if (hasEpCountChange || hasEpTextChange) {
                        stats.updated++;
                        console.log(`     🔄 Cập nhật tập: ${item.name || slug} (${oldEpCount}→${newEpCount}tập | "${oldEpText}"→"${newEpText}")`);
                    } else {
                        stats.refreshed++;
                        process.stdout.write(`     🔗 Link mới: ${item.name || slug}\n`);
                    }
                } else {
                    stats.skipped++;
                    process.stdout.write(`     ⏭️  Không có tập: ${item.name || slug}\n`);
                }

            } else {
                // ─── Phim MỚI → thêm vào đầu mảng ────────────────
                const newMovie = formatMovie(detailData, nextId++, {});
                existingMovies.unshift(newMovie);
                slugMap.set(slug, newMovie);
                stats.added++;
                console.log(`     ✨ Thêm mới: ${newMovie.title} (${newMovie.episodes.length} tập)`);
            }
        }

        // ── Lưu tiến trình sau mỗi N trang ───────────────────
        if ((page - cfg.start + 1) % SAVE_EVERY_N === 0) {
            saveOutput(existingMovies, `Đã lưu sau trang ${page}`);
        }
    }

    // ─── Làm mới tập cho các phim Đang Chiếu (để không sót tập mới) ───
    console.log('\n\n🔁 Đang kiểm tra cập nhật cho các phim [Đang Chiếu] trong kho...');
    let epUpdated = 0;
    const ongoingMovies = existingMovies.filter(m => m.status === 'Đang Chiếu');
    const totalOngoing = ongoingMovies.length;

    for (let i = 0; i < totalOngoing; i++) {
        const m = ongoingMovies[i];
        if (!m.slug) continue;
        process.stdout.write(`   [${i + 1}/${totalOngoing}] ${m.title}...`);
        try {
            const d = await fetchJsonWithRetry(API_DETAIL + m.slug);
            await sleep(DELAY_MS);
            if (d?.movie) {
                const fresh = formatMovie(d, m.id, {
                    existingImdb: m.imdb,
                    existingViews: m.views,
                    existingComments: m.comments || [],
                    existingFeatured: m.featured || false,
                });
                if (fresh.episodes.length > 0) {
                    const oldEpCount = (m.episodes || []).length;
                    const newEpCount = fresh.episodes.length;

                    m.episodes = fresh.episodes;
                    m.servers = fresh.servers;
                    m.episode = fresh.episode;
                    m.status = fresh.status;

                    if (newEpCount !== oldEpCount || fresh.status !== 'Đang Chiếu') {
                        m.updatedAt = new Date().toISOString();
                        epUpdated++;
                        process.stdout.write(` ✅ (${oldEpCount} → ${newEpCount} tập) [${fresh.status}]\n`);
                    } else {
                        process.stdout.write(` ⏭️  Không có tập mới\n`);
                    }
                } else {
                    process.stdout.write(' ⏭️\n');
                }
            }
            // Lưu mỗi 50 phim
            if ((i + 1) % 50 === 0) saveOutput(existingMovies, `[ongoing check] ${i + 1}/${totalOngoing}`);
        } catch (err) {
            process.stdout.write(` ⚠️ ${err.message}\n`);
            stats.errors++;
        }
    }
    console.log(`\n✅ Đã cập nhật tập mới cho ${epUpdated}/${totalOngoing} phim đang chiếu`);

    // ── Sắp xếp phim theo thời gian cập nhật mới nhất lên đầu ──
    existingMovies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // ── Lưu lần cuối & bust cache ─────────────────────────────
    saveOutput(existingMovies, 'Lưu lần cuối');
    bustHtmlCache();

    // Ghi đè file với cache buster timestamp
    const finalTxt = `window.pfMoviesUpdateStamp = ${Date.now()};\nwindow.pfMovies = ${JSON.stringify(existingMovies, null, 0)};`;
    fs.writeFileSync(OUTPUT, finalTxt, 'utf-8');

    // ── Báo cáo kết quả ──────────────────────────────────────
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n══════════════════════════════════════════════════');
    console.log(`✅  HOÀN THÀNH!  (${elapsed}s)`);
    console.log(`    ✨ Thêm mới:    ${stats.added}`);
    console.log(`    🔄 Cập nhật tập: ${stats.updated}`);
    console.log(`    🔗 Làm mới link: ${stats.refreshed}`);
    console.log(`    ⏭️  Bỏ qua:       ${stats.skipped}`);
    console.log(`    ❌ Lỗi:          ${stats.errors}`);
    console.log(`    📦 Tổng kho:     ${existingMovies.length} phim`);
    console.log('══════════════════════════════════════════════════\n');

    process.exit(0);
}

runCrawler().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
