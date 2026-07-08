// test-api.js — So sánh các API endpoint của Ophim để tìm endpoint trả dữ liệu mới nhất
const APIS = [
    { name: 'API Hiện tại (ophim1.com)', list: 'https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1', detail: 'https://ophim1.com/phim/' },
    { name: 'API v1 (ophim1.com/v1/api)', list: 'https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1', detail: 'https://ophim1.com/v1/api/phim/' },
    { name: 'Ophim CC', list: 'https://ophim.cc/danh-sach/phim-moi-cap-nhat?page=1', detail: 'https://ophim.cc/phim/' },
    { name: 'Ophim17', list: 'https://ophim17.cc/danh-sach/phim-moi-cap-nhat?page=1', detail: 'https://ophim17.cc/phim/' },
];

async function tryFetch(url, timeout = 8000) {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
        if (!res.ok) return { error: `HTTP ${res.status}` };
        return await res.json();
    } catch (e) {
        return { error: e.message };
    }
}

async function main() {
    console.log('\n=== SO SÁNH CÁC API OPHIM ===\n');

    for (const api of APIS) {
        console.log(`\n--- ${api.name} ---`);
        console.log(`URL: ${api.list}`);
        
        const data = await tryFetch(api.list);
        
        if (data.error) {
            console.log(`❌ LỖI: ${data.error}`);
            continue;
        }

        // Xử lý cả format cũ và mới
        let items, totalPages, totalItems;
        if (data.data && data.data.items) {
            // Format v1/api mới
            items = data.data.items;
            totalPages = data.data.params?.pagination?.totalPages || '?';
            totalItems = data.data.params?.pagination?.totalItems || '?';
        } else if (data.items) {
            // Format cũ
            items = data.items;
            totalPages = data.pagination?.totalPages || '?';
            totalItems = data.pagination?.totalItems || '?';
        } else {
            console.log('❌ Format không nhận dạng được');
            console.log('   Keys:', Object.keys(data).join(', '));
            continue;
        }

        console.log(`✅ ${items.length} phim trên trang 1 | Tổng: ${totalItems} phim, ${totalPages} trang`);
        
        if (items.length > 0) {
            console.log('\n   Top 5 phim mới nhất:');
            for (let i = 0; i < Math.min(5, items.length); i++) {
                const item = items[i];
                const modified = item.modified?.time || item.modified || 'N/A';
                console.log(`   ${i+1}. ${item.name} | modified: ${modified}`);
                
                // Lấy chi tiết phim đầu tiên để kiểm tra episodes
                if (i === 0) {
                    const slug = item.slug;
                    // Thử cả 2 format detail URL
                    let detailUrl = api.detail + slug;
                    let detail = await tryFetch(detailUrl);
                    
                    if (detail.error) {
                        console.log(`      ❌ Chi tiết lỗi: ${detail.error}`);
                    } else {
                        let movie, episodes;
                        if (detail.data) {
                            // Format v1/api
                            movie = detail.data.item || detail.data;
                            episodes = detail.data.episodes || detail.data.item?.episodes || [];
                        } else {
                            // Format cũ  
                            movie = detail.movie;
                            episodes = detail.episodes || [];
                        }
                        
                        if (movie) {
                            const epCurrent = movie.episode_current || 'N/A';
                            const epTotal = movie.episode_total || 'N/A';
                            const maxEps = episodes.reduce((max, s) => 
                                Math.max(max, (s.server_data || []).length), 0);
                            console.log(`      📺 Episode: "${epCurrent}" / "${epTotal}" | Server data: ${maxEps} tập`);
                        }
                    }
                }
            }
        }
    }
    
    console.log('\n\n=== KẾT LUẬN ===');
    console.log('Nếu API v1 có nhiều phim/trang hơn hoặc modified time mới hơn,');
    console.log('ta cần chuyển sang dùng API v1.');
}

main().catch(console.error);
