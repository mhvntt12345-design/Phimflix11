const fs = require('fs');
const path = require('path');

// ============================================================
//  PHIMFLIX — BULK IMPORT (v1.0)
//  Script đơn giản: Chỉ cào phim từ trang A → B và lưu vào kho.
//  KHÔNG chạy kiểm tra "ongoing movies" (để tránh timeout).
// ============================================================

const START_PAGE = parseInt(process.argv[2]) || 1;
const END_PAGE   = parseInt(process.argv[3]) || 5;
// Nếu truyền arg thứ 4 là "force", sẽ cập nhật updatedAt cho mọi phim (kể cả không có tập mới)
const FORCE_UPDATE = process.argv[4] === 'force';

// ── CẤU HÌNH API ──────────────────────────────────────────
const API_LIST   = 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=';
const API_DETAIL = 'https://phim.nguonc.com/api/film/';
const OUTPUT     = path.join(__dirname, 'js/nguonc-data.js');

// ── CẤU HÌNH HIỆU NĂNG ────────────────────────────────────
const DELAY_MS    = 150;
const TIMEOUT_MS  = 15000;
const MAX_RETRIES = 3;
const SAVE_EVERY_N = 2; // Lưu sau mỗi 2 trang

// ── MAPPING ───────────────────────────────────────────────
const GENRE_MAP = {
    'Hành Động': 1, 'Tình Cảm': 2, 'Lãng Mạn': 2,
    'Phìm Hài': 3, 'Hài Hước': 3, 'Kinh Dị': 4,
    'Viễn Tưởng': 5, 'Khoa Học Viễn Tưởng': 5, 'Giả Tưởng': 5,
    'Hoạt Hình': 6, 'Phiêu Lưu': 7, 'Tâm Lý': 8,
    'Chính Kịch': 8, 'Hình Sự': 9, 'Gây Cấn': 9,
    'Chiến Tranh': 10, 'Võ Thuật': 11, 'Cổ Trang': 12,
    'Lịch Sử': 12, 'Thần Thoại': 13, 'Anime': 14,
    'Bí Ẩn': 15, 'Phìm Nhạc': 16,
};

const COUNTRY_MAP = {
    'Việt Nam': 1, 'Hàn Quốc': 2, 'Trung Quốc': 3,
    'Nhật Bản': 4, 'Mỹ': 5, 'Âu Mỹ': 5,
    'Canada': 5, 'Thái Lan': 6, 'Anh': 7,
    'Pháp': 8, 'Hong Kong': 3, 'Đài Loan': 3,
};

const SERVER_PRIORITY = ['vietsub', 'phụ đề', 'sub', 'hd', 'full'];

// ── TIỆN ÍCH ──────────────────────────────────────────────
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function fetchJsonWithRetry(url, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, {
                signal: AbortSignal.timeout(TIMEOUT_MS),
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://phim.nguonc.com/',
                    'Origin': 'https://phim.nguonc.com',
                    'sec-ch-ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'Connection': 'keep-alive',
                },
            });
            if (res.status === 403) {
                // Khi bị 403, chờ lâu hơn rồi thử lại
                if (attempt < retries) {
                    const wait = DELAY_MS * attempt * 5;
                    console.warn(`     ⛔ 403 — Chờ ${wait}ms rồi thử lại (${attempt}/${retries})...`);
                    await sleep(wait);
                    continue;
                }
                throw new Error(`HTTP 403 Forbidden`);
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            if (attempt === retries) throw new Error(`[${attempt}/${retries}] ${err.message}`);
            console.warn(`     ↩️  Thử lại ${attempt + 1}/${retries} (${err.message})`);
            await sleep(DELAY_MS * attempt * 2);
        }
    }
}

function pickBestServer(serverList) {
    if (!serverList || serverList.length === 0) return null;
    const maxCount = Math.max(...serverList.map(s => (s.items || []).length));
    const topServers = serverList.filter(s => (s.items || []).length === maxCount);
    if (topServers.length === 1) return topServers[0];
    for (const kw of SERVER_PRIORITY) {
        const found = topServers.find(s => s.server_name?.toLowerCase().includes(kw));
        if (found) return found;
    }
    return topServers[0];
}

function parseEpisodes(serverList) {
    const server = pickBestServer(serverList);
    if (!server?.items?.length) return [];
    return server.items.map((ep, i) => ({
        id: i + 1,
        name: (ep.name || `Tập ${i + 1}`).trim(),
        videoUrl: ep.embed || ep.m3u8 || ep.link_embed || ep.link_m3u8 || '',
        server: server.server_name || 'Unknown',
    })).filter(ep => ep.videoUrl);
}

function parseAllServers(serverList) {
    if (!serverList?.length) return [];
    return serverList.map(s => ({
        server_name: s.server_name || 'Unknown',
        items: (s.items || []).map((ep, i) => ({
            id: i + 1,
            name: (ep.name || `Tập ${i + 1}`).trim(),
            videoUrl: ep.embed || ep.m3u8 || ep.link_embed || ep.link_m3u8 || ''
        })).filter(ep => ep.videoUrl)
    })).filter(s => s.items.length > 0);
}

function detectType(typeCat, genreCat) {
    const typeNames = typeCat.map(c => (c.name || '').toLowerCase().trim());
    const genreNames = genreCat.map(c => (c.name || '').toLowerCase().trim());
    const allNames = [...typeNames, ...genreNames];
    if (typeNames.some(n => n === 'tv shows' || n.includes('tv show'))) return 'tv-show';
    if (genreNames.some(n => n === 'anime')) return 'anime';
    if (allNames.some(n => n === 'hoạt hình' || n.includes('animation'))) return 'hoat-hinh';
    if (typeNames.some(n => n === 'phim lẻ')) return 'phim-le';
    if (typeNames.some(n => n === 'phim bộ')) return 'phim-bo';
    if (typeNames.some(n => n.includes('chiếu rạp') || n.includes('cinema'))) return 'phim-chieu-rap';
    if (typeNames.some(n => n.includes('bộ') || n.includes('series'))) return 'phim-bo';
    if (typeNames.some(n => n.includes('lẻ') || n.includes('single'))) return 'phim-le';
    return 'phim-le';
}

function detectStatus(currentEpisodeText, epCount, type) {
    if (!currentEpisodeText) {
        if (type === 'phim-le' || type === 'phim-chieu-rap') return 'Hoàn Thành';
        return 'Đang Chiếu';
    }
    const t = currentEpisodeText.toLowerCase().trim();
    if (t.includes('hoàn tất') || t.includes('full') || t.includes('complete') || t.includes('end') || t === 'full hd')
        return 'Hoàn Thành';
    if (type === 'phim-le' || type === 'phim-chieu-rap') return 'Hoàn Thành';
    return 'Đang Chiếu';
}

function formatMovie(nguoncData, movieId, opts = {}) {
    const m = nguoncData.movie;
    const { existingImdb = 0, existingViews = 0, existingComments = [], existingFeatured = false } = opts;

    const categories = m.category || {};
    const typeCat    = (categories['1']?.list || []);
    const genreCat   = (categories['2']?.list || []);
    const yearCat    = (categories['3']?.list || []);
    const countryCat = (categories['4']?.list || []);

    const episodes   = parseEpisodes(m.episodes || []);
    const allServers = parseAllServers(m.episodes || []);
    const type       = detectType(typeCat, genreCat);
    const status     = detectStatus(m.current_episode, episodes.length, type);

    const genres  = genreCat.map(c => GENRE_MAP[c.name]).filter(Boolean);
    const country = countryCat.length > 0 ? (COUNTRY_MAP[countryCat[0].name] || 5) : 5;
    const year    = yearCat.length > 0 ? (parseInt(yearCat[0].name) || new Date().getFullYear()) : new Date().getFullYear();

    const description = m.description
        ? m.description.replace(/<[^>]+>/g, '').replace(/\s{2,}/g, ' ').trim()
        : 'Đang cập nhật...';

    const _searchStr = `${m.name || ''} ${m.original_name || ''} ${m.director || ''} ${m.casts || ''}`
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .toLowerCase().replace(/\s{2,}/g, ' ').trim();

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
        country, year,
        duration: m.time || 'Đang cập nhật',
        status, type,
        quality: qualityText,
        episode: m.current_episode || (type === 'phim-le' ? 'Full' : 'Tập 1'),
        _searchStr,
        director: m.director ? m.director.trim() : 'Đang cập nhật',
        actors: m.casts ? m.casts.trim() : 'Đang cập nhật',
        imdb: existingImdb || parseFloat((Math.random() * 4 + 5.5).toFixed(1)),
        views: existingViews || Math.floor(Math.random() * 500000) + 1000,
        featured: existingFeatured || false,
        visible: true,
        episodes, servers: allServers,
        comments: existingComments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

function saveOutput(movies, label = '') {
    const tmpFile = OUTPUT + '.tmp';
    // Dùng JSON.stringify không indent để tiết kiệm dung lượng
    const content = `window.pfMoviesUpdateStamp = ${Date.now()};\nwindow.pfMovies = ${JSON.stringify(movies, null, 0)};\n`;
    try {
        fs.writeFileSync(tmpFile, content, 'utf-8');
        if (fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);
        fs.renameSync(tmpFile, OUTPUT);
        if (label) console.log(`   💾 ${label} — Tổng: ${movies.length} phim`);
    } catch (err) {
        console.error(`❌ Ghi thất bại: ${err.message}`);
        fs.writeFileSync(OUTPUT, content, 'utf-8');
    }
}

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
    console.log(`   🧹 Bust cache HTML (v=${ts})`);
}

function loadExisting() {
    if (!fs.existsSync(OUTPUT)) return { movies: [], slugMap: new Map(), nextId: 1000 };
    try {
        const raw = fs.readFileSync(OUTPUT, 'utf-8');
        const match = raw.match(/window\.pfMovies\s*=\s*(\[[\s\S]*?\]);\s*$/m);
        if (!match) throw new Error('Không parse được JSON');
        const movies = JSON.parse(match[1]);
        const nextId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1000;
        const slugMap = new Map(movies.map(m => [m.slug, m]));
        console.log(`   → Đã tải ${movies.length} phim cũ. ID tiếp theo: ${nextId}`);
        return { movies, slugMap, nextId };
    } catch (err) {
        console.error(`⚠️ Không đọc được file cũ: ${err.message}. Bắt đầu từ đầu.`);
        return { movies: [], slugMap: new Map(), nextId: 1000 };
    }
}

// ============================================================
//  MAIN
// ============================================================

async function run() {
    const startTime = Date.now();
    console.log(`\n══════════════════════════════════════════════════`);
    console.log(`🚀  PHIMFLIX BULK IMPORT`);
    console.log(`    Trang: ${START_PAGE} → ${END_PAGE}  |  Force update: ${FORCE_UPDATE}`);
    console.log(`══════════════════════════════════════════════════\n`);

    console.log('📦 Đang tải dữ liệu cũ...');
    let { movies, slugMap, nextId } = loadExisting();

    const stats = { added: 0, updated: 0, refreshed: 0, skipped: 0, errors: 0 };
    let totalPages = END_PAGE;

    for (let page = START_PAGE; page <= END_PAGE; page++) {
        process.stdout.write(`\n📄 Trang ${page}/${totalPages}...`);

        let listData;
        try {
            listData = await fetchJsonWithRetry(API_LIST + page);
        } catch (err) {
            console.error(`\n❌ Không thể lấy trang ${page}: ${err.message}`);
            stats.errors++;
            continue;
        }

        if (!listData || listData.status !== 'success' || !listData.items?.length) {
            console.log(' — Hết dữ liệu hoặc trang trống.');
            break;
        }

        // Cập nhật totalPages theo API
        if (page === START_PAGE && listData.paginate?.total_page) {
            const apiMax = listData.paginate.total_page;
            totalPages = Math.min(END_PAGE, apiMax);
            console.log(`\n   ℹ️  API có ${listData.paginate.total_items} phim / ${apiMax} trang. Cào đến trang ${totalPages}.`);
        }

        console.log(` (${listData.items.length} phim)`);

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
                // ── Phim đã tồn tại → cập nhật ──
                const old = slugMap.get(slug);
                const fresh = formatMovie(detailData, old.id, {
                    existingImdb: old.imdb,
                    existingViews: old.views,
                    existingComments: old.comments || [],
                    existingFeatured: old.featured || false,
                });

                const oldEpCount = (old.episodes || []).length;
                const newEpCount = fresh.episodes.length;
                const oldEpText  = (old.episode || '').trim();
                const newEpText  = (fresh.episode || '').trim();
                const hasChange  = newEpCount !== oldEpCount || newEpText !== oldEpText;

                fresh.createdAt = old.createdAt;
                fresh.updatedAt = (hasChange || FORCE_UPDATE) ? new Date().toISOString() : old.updatedAt;

                if (fresh.episodes.length > 0) {
                    Object.assign(old, fresh);
                    if (hasChange) {
                        stats.updated++;
                        console.log(`     🔄 Cập nhật: ${item.name || slug} (${oldEpCount}→${newEpCount}tập)`);
                    } else if (FORCE_UPDATE) {
                        stats.refreshed++;
                        process.stdout.write(`     🔗 Refresh: ${item.name || slug}\n`);
                    } else {
                        stats.skipped++;
                        process.stdout.write(`     ⏭️  Không đổi: ${item.name || slug}\n`);
                    }
                } else {
                    stats.skipped++;
                    process.stdout.write(`     ⏭️  Không có tập: ${item.name || slug}\n`);
                }
            } else {
                // ── Phim mới → thêm vào đầu ──
                const newMovie = formatMovie(detailData, nextId++, {});
                if (newMovie.episodes.length > 0) {
                    movies.unshift(newMovie);
                    slugMap.set(slug, newMovie);
                    stats.added++;
                    console.log(`     ✨ Thêm mới: ${newMovie.title} (${newMovie.episodes.length} tập)`);
                } else {
                    stats.skipped++;
                    process.stdout.write(`     ⏭️  Phim mới nhưng chưa có link: ${item.name || slug}\n`);
                }
            }
        }

        // Lưu sau mỗi N trang
        if ((page - START_PAGE + 1) % SAVE_EVERY_N === 0) {
            saveOutput(movies, `Đã lưu sau trang ${page}`);
        }
    }

    // Sắp xếp theo updatedAt mới nhất
    movies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Lưu lần cuối & bust cache
    saveOutput(movies, 'Lưu lần cuối');
    bustHtmlCache();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n══════════════════════════════════════════════════');
    console.log(`✅  HOÀN THÀNH!  (${elapsed}s)`);
    console.log(`    ✨ Thêm mới:     ${stats.added}`);
    console.log(`    🔄 Cập nhật tập: ${stats.updated}`);
    console.log(`    🔗 Làm mới link: ${stats.refreshed}`);
    console.log(`    ⏭️  Bỏ qua:        ${stats.skipped}`);
    console.log(`    ❌ Lỗi:           ${stats.errors}`);
    console.log(`    📦 Tổng kho:      ${movies.length} phim`);
    console.log('══════════════════════════════════════════════════\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
