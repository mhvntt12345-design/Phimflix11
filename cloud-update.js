/**
 * PHIMFLIX — Cloud Auto Update
 * Chạy trên Render.com (cron job, miễn phí)
 * - Gọi NguonC API để lấy phim mới / tập mới
 * - Đọc dữ liệu từ GitHub API
 * - Ghi lại dữ liệu lên GitHub API (không cần git)
 *
 * Biến môi trường cần thiết (đặt trong Render.com):
 *   GITHUB_TOKEN  — Personal Access Token (có quyền repo)
 *   GITHUB_OWNER  — tên user GitHub (ví dụ: mhvntt12345-design)
 *   GITHUB_REPO   — tên repo (ví dụ: Phimflix11)
 *   GITHUB_BRANCH — nhánh (mặc định: master)
 *   START_PAGE    — trang bắt đầu quét (mặc định: 1)
 *   END_PAGE      — trang kết thúc quét (mặc định: 5)
 */

const GITHUB_TOKEN  = process.env.GITHUB_TOKEN;
const GITHUB_OWNER  = process.env.GITHUB_OWNER  || 'mhvntt12345-design';
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'Phimflix11';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'master';
const START_PAGE    = parseInt(process.env.START_PAGE) || 1;
const END_PAGE      = parseInt(process.env.END_PAGE)   || 5;

const API_LIST   = 'https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=';
const API_DETAIL = 'https://phim.nguonc.com/api/film/';

const DELAY_MS    = 200;
const TIMEOUT_MS  = 15000;
const MAX_RETRIES = 3;

// ── BROWSER HEADERS (bypass 403) ─────────────────────────
const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8',
    'Referer': 'https://phim.nguonc.com/',
    'Origin': 'https://phim.nguonc.com',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
};

const GITHUB_HEADERS = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'PhimFlix-AutoUpdate/1.0',
};

// ── MAPPING ───────────────────────────────────────────────
const GENRE_MAP = {
    'Hành Động':1,'Tình Cảm':2,'Lãng Mạn':2,'Phìm Hài':3,'Hài Hước':3,
    'Kinh Dị':4,'Viễn Tưởng':5,'Khoa Học Viễn Tưởng':5,'Giả Tưởng':5,
    'Hoạt Hình':6,'Phiêu Lưu':7,'Tâm Lý':8,'Chính Kịch':8,'Hình Sự':9,
    'Gây Cấn':9,'Chiến Tranh':10,'Võ Thuật':11,'Cổ Trang':12,'Lịch Sử':12,
    'Thần Thoại':13,'Anime':14,'Bí Ẩn':15,'Phìm Nhạc':16,
};
const COUNTRY_MAP = {
    'Việt Nam':1,'Hàn Quốc':2,'Trung Quốc':3,'Nhật Bản':4,'Mỹ':5,'Âu Mỹ':5,
    'Canada':5,'Thái Lan':6,'Anh':7,'Pháp':8,'Hong Kong':3,'Đài Loan':3,
};
const SERVER_PRIORITY = ['vietsub','phụ đề','sub','hd','full'];

// ── TIỆN ÍCH ──────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchJson(url, headers = BROWSER_HEADERS, retries = MAX_RETRIES) {
    for (let i = 1; i <= retries; i++) {
        try {
            const res = await fetch(url, {
                signal: AbortSignal.timeout(TIMEOUT_MS),
                headers,
            });
            if (res.status === 403) {
                if (i < retries) { await sleep(DELAY_MS * i * 5); continue; }
                throw new Error('HTTP 403 — IP bị chặn');
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            if (i === retries) throw err;
            await sleep(DELAY_MS * i * 2);
        }
    }
}

// ── GITHUB API ────────────────────────────────────────────

async function githubGet(path) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;
    const res = await fetch(url, { headers: GITHUB_HEADERS });
    if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status} ${await res.text()}`);
    return res.json();
}

async function githubPut(path, content, sha, message) {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
    const body = JSON.stringify({
        message,
        content: Buffer.from(content, 'utf-8').toString('base64'),
        sha,
        branch: GITHUB_BRANCH,
    });
    const res = await fetch(url, { method: 'PUT', headers: GITHUB_HEADERS, body });
    if (!res.ok) throw new Error(`GitHub PUT ${path}: ${res.status} ${await res.text()}`);
    return res.json();
}

// ── LOAD & SAVE QUA GITHUB API ────────────────────────────

async function loadFromGitHub() {
    console.log('📥 Đang tải dữ liệu từ GitHub...');
    try {
        const file = await githubGet('js/nguonc-data.js');
        const raw = Buffer.from(file.content, 'base64').toString('utf-8');
        const match = raw.match(/window\.pfMovies\s*=\s*(\[[\s\S]*?\]);\s*$/m);
        if (!match) throw new Error('Không parse được mảng JSON');
        const movies = JSON.parse(match[1]);
        const nextId = movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1000;
        const slugMap = new Map(movies.map(m => [m.slug, m]));
        console.log(`   → Đã tải ${movies.length} phim. SHA: ${file.sha.slice(0,8)}`);
        return { movies, slugMap, nextId, sha: file.sha };
    } catch (err) {
        console.error(`⚠️ Lỗi tải dữ liệu: ${err.message}. Bắt đầu từ đầu.`);
        return { movies: [], slugMap: new Map(), nextId: 1000, sha: null };
    }
}

async function saveToGitHub(movies, sha, stats) {
    console.log('\n📤 Đang đẩy dữ liệu lên GitHub...');
    const ts = Date.now();
    const content = `window.pfMoviesUpdateStamp = ${ts};\nwindow.pfMovies = ${JSON.stringify(movies, null, 0)};\n`;

    const date = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const message = `Auto update ${date} — +${stats.added} mới, ${stats.updated} cập nhật tập`;

    try {
        await githubPut('js/nguonc-data.js', content, sha, message);
        console.log(`   ✅ Đã push lên GitHub! (${movies.length} phim)`);

        // Cập nhật cache buster cho index.html và admin.html
        await updateHtmlCache('index.html', ts);
        await updateHtmlCache('admin.html', ts);
    } catch (err) {
        console.error(`❌ Lỗi push GitHub: ${err.message}`);
        throw err;
    }
}

async function updateHtmlCache(filename, ts) {
    try {
        const file = await githubGet(filename);
        const raw = Buffer.from(file.content, 'base64').toString('utf-8');
        const updated = raw
            .replace(/js\/nguonc-data\.js\?v=\d*/g, `js/nguonc-data.js?v=${ts}`)
            .replace(/js\/app\.js\?v=\d*/g, `js/app.js?v=${ts}`)
            .replace(/js\/data\.js\?v=\d*/g, `js/data.js?v=${ts}`);
        if (updated !== raw) {
            await githubPut(filename, updated, file.sha, `Cache bust ${filename} v=${ts}`);
            console.log(`   🧹 Bust cache ${filename}`);
        }
    } catch (err) {
        console.warn(`   ⚠️ Không cập nhật được ${filename}: ${err.message}`);
    }
}

// ── PARSE PHIM ────────────────────────────────────────────

function pickBestServer(list) {
    if (!list?.length) return null;
    const max = Math.max(...list.map(s => (s.items||[]).length));
    const top = list.filter(s => (s.items||[]).length === max);
    for (const kw of SERVER_PRIORITY) {
        const f = top.find(s => s.server_name?.toLowerCase().includes(kw));
        if (f) return f;
    }
    return top[0];
}

function parseEpisodes(serverList) {
    const s = pickBestServer(serverList);
    if (!s?.items?.length) return [];
    return s.items.map((ep, i) => ({
        id: i+1, name: (ep.name||`Tập ${i+1}`).trim(),
        videoUrl: ep.embed||ep.m3u8||ep.link_embed||ep.link_m3u8||'',
        server: s.server_name||'Unknown',
    })).filter(ep => ep.videoUrl);
}

function parseAllServers(list) {
    if (!list?.length) return [];
    return list.map(s => ({
        server_name: s.server_name||'Unknown',
        items: (s.items||[]).map((ep,i) => ({
            id:i+1, name:(ep.name||`Tập ${i+1}`).trim(),
            videoUrl: ep.embed||ep.m3u8||ep.link_embed||ep.link_m3u8||''
        })).filter(ep => ep.videoUrl)
    })).filter(s => s.items.length>0);
}

function detectType(typeCat, genreCat) {
    const t = typeCat.map(c => (c.name||'').toLowerCase());
    const g = genreCat.map(c => (c.name||'').toLowerCase());
    if (t.some(n => n.includes('tv show'))) return 'tv-show';
    if (g.some(n => n==='anime')) return 'anime';
    if ([...t,...g].some(n => n==='hoạt hình')) return 'hoat-hinh';
    if (t.some(n => n==='phim lẻ')) return 'phim-le';
    if (t.some(n => n==='phim bộ')) return 'phim-bo';
    if (t.some(n => n.includes('chiếu rạp'))) return 'phim-chieu-rap';
    return 'phim-le';
}

function detectStatus(ep, count, type) {
    if (!ep) return (type==='phim-le'||type==='phim-chieu-rap') ? 'Hoàn Thành' : 'Đang Chiếu';
    const t = ep.toLowerCase();
    if (t.includes('hoàn tất')||t.includes('full')||t.includes('complete')||t.includes('end')) return 'Hoàn Thành';
    return (type==='phim-le'||type==='phim-chieu-rap') ? 'Hoàn Thành' : 'Đang Chiếu';
}

function formatMovie(data, id, opts={}) {
    const m = data.movie;
    const { existingImdb=0, existingViews=0, existingComments=[], existingFeatured=false } = opts;
    const cat = m.category||{};
    const typeCat = (cat['1']?.list||[]);
    const genreCat = (cat['2']?.list||[]);
    const yearCat  = (cat['3']?.list||[]);
    const ctryCat  = (cat['4']?.list||[]);
    const episodes = parseEpisodes(m.episodes||[]);
    const servers  = parseAllServers(m.episodes||[]);
    const type     = detectType(typeCat, genreCat);
    const status   = detectStatus(m.current_episode, episodes.length, type);
    const genres   = genreCat.map(c => GENRE_MAP[c.name]).filter(Boolean);
    const country  = ctryCat.length ? (COUNTRY_MAP[ctryCat[0].name]||5) : 5;
    const year     = yearCat.length ? (parseInt(yearCat[0].name)||new Date().getFullYear()) : new Date().getFullYear();
    const desc     = m.description ? m.description.replace(/<[^>]+>/g,'').replace(/\s{2,}/g,' ').trim() : 'Đang cập nhật...';
    const _searchStr = `${m.name||''} ${m.original_name||''} ${m.director||''} ${m.casts||''}`
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D')
        .toLowerCase().replace(/\s{2,}/g,' ').trim();
    let quality = m.quality||'HD';
    if (m.language && !quality.toLowerCase().includes(m.language.toLowerCase())) quality += ` - ${m.language}`;
    return {
        id, title:(m.name||'').trim(), slug:m.slug, originalTitle:(m.original_name||'').trim(),
        poster:m.poster_url||'', banner:m.thumb_url||'', description:desc,
        genres:genres.length?genres:[1], country, year,
        duration:m.time||'Đang cập nhật', status, type, quality,
        episode:m.current_episode||(type==='phim-le'?'Full':'Tập 1'),
        _searchStr, director:m.director?m.director.trim():'Đang cập nhật',
        actors:m.casts?m.casts.trim():'Đang cập nhật',
        imdb: existingImdb||parseFloat((Math.random()*4+5.5).toFixed(1)),
        views: existingViews||Math.floor(Math.random()*500000)+1000,
        featured: existingFeatured||false, visible:true, episodes, servers,
        comments: existingComments||[],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
}

// ── MAIN ──────────────────────────────────────────────────

async function main() {
    if (!GITHUB_TOKEN) {
        console.error('❌ Thiếu biến môi trường GITHUB_TOKEN!');
        process.exit(1);
    }

    const startTime = Date.now();
    console.log('\n══════════════════════════════════════════════════');
    console.log('🚀  PHIMFLIX CLOUD AUTO UPDATE');
    console.log(`    Repo: ${GITHUB_OWNER}/${GITHUB_REPO}  |  Branch: ${GITHUB_BRANCH}`);
    console.log(`    Trang: ${START_PAGE} → ${END_PAGE}`);
    console.log('══════════════════════════════════════════════════\n');

    const { movies, slugMap, nextId: _nextId, sha } = await loadFromGitHub();
    let nextId = _nextId;
    const stats = { added:0, updated:0, skipped:0, errors:0 };
    let totalPages = END_PAGE;

    for (let page = START_PAGE; page <= END_PAGE; page++) {
        process.stdout.write(`\n📄 Trang ${page}/${totalPages}...`);

        let listData;
        try {
            listData = await fetchJson(API_LIST + page);
            await sleep(DELAY_MS);
        } catch (err) {
            console.error(`\n❌ Trang ${page}: ${err.message}`);
            stats.errors++;
            continue;
        }

        if (!listData?.status==='success' || !listData?.items?.length) {
            if (!listData || listData.status !== 'success' || !listData.items?.length) {
                console.log(' — Hết dữ liệu.');
                break;
            }
        }

        if (page === START_PAGE && listData.paginate?.total_page) {
            totalPages = Math.min(END_PAGE, listData.paginate.total_page);
            console.log(`\n   ℹ️  API: ${listData.paginate.total_items} phim / ${listData.paginate.total_page} trang`);
        }
        console.log(` (${listData.items.length} phim)`);

        for (const item of listData.items) {
            const slug = item.slug;
            let detail;
            try {
                detail = await fetchJson(API_DETAIL + slug);
                await sleep(DELAY_MS);
            } catch (err) {
                console.error(`     ⚠️ [${slug}]: ${err.message}`);
                stats.errors++;
                continue;
            }

            if (!detail?.movie) { stats.errors++; continue; }

            if (slugMap.has(slug)) {
                const old = slugMap.get(slug);
                const fresh = formatMovie(detail, old.id, {
                    existingImdb: old.imdb, existingViews: old.views,
                    existingComments: old.comments||[], existingFeatured: old.featured||false,
                });
                const hasChange = fresh.episodes.length !== (old.episodes||[]).length || fresh.episode !== old.episode;
                fresh.createdAt = old.createdAt;
                fresh.updatedAt = hasChange ? new Date().toISOString() : old.updatedAt;
                if (fresh.episodes.length > 0) {
                    Object.assign(old, fresh);
                    if (hasChange) {
                        stats.updated++;
                        console.log(`     🔄 Cập nhật: ${item.name} (${(old.episodes||[]).length}→${fresh.episodes.length}tập)`);
                    } else {
                        stats.skipped++;
                        process.stdout.write(`     ⏭️  Không đổi: ${item.name}\n`);
                    }
                } else {
                    stats.skipped++;
                }
            } else {
                const m = formatMovie(detail, nextId++, {});
                if (m.episodes.length > 0) {
                    movies.unshift(m);
                    slugMap.set(slug, m);
                    stats.added++;
                    console.log(`     ✨ Thêm mới: ${m.title} (${m.episodes.length} tập)`);
                } else {
                    stats.skipped++;
                }
            }
        }
    }

    // Sắp xếp theo mới nhất
    movies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Chỉ push nếu có thay đổi
    if (stats.added > 0 || stats.updated > 0) {
        await saveToGitHub(movies, sha, stats);
    } else {
        console.log('\n⏭️  Không có thay đổi mới. Bỏ qua push GitHub.');
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n══════════════════════════════════════════════════');
    console.log(`✅  HOÀN THÀNH!  (${elapsed}s)`);
    console.log(`    ✨ Thêm mới:     ${stats.added}`);
    console.log(`    🔄 Cập nhật tập: ${stats.updated}`);
    console.log(`    ⏭️  Bỏ qua:        ${stats.skipped}`);
    console.log(`    ❌ Lỗi:           ${stats.errors}`);
    console.log(`    📦 Tổng kho:      ${movies.length} phim`);
    console.log('══════════════════════════════════════════════════\n');
}

main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
});
