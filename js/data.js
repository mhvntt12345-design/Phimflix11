// ============================================
// PHIMFLIX - Mock Data
// ============================================

const GENRES = [
  { id: 1, name: 'Hành Động', slug: 'hanh-dong' },
  { id: 2, name: 'Tình Cảm', slug: 'tinh-cam' },
  { id: 3, name: 'Hài Hước', slug: 'hai-huoc' },
  { id: 4, name: 'Kinh Dị', slug: 'kinh-di' },
  { id: 5, name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { id: 6, name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { id: 7, name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { id: 8, name: 'Tâm Lý', slug: 'tam-ly' },
  { id: 9, name: 'Hình Sự', slug: 'hinh-su' },
  { id: 10, name: 'Chiến Tranh', slug: 'chien-tranh' },
  { id: 11, name: 'Võ Thuật', slug: 'vo-thuat' },
  { id: 12, name: 'Cổ Trang', slug: 'co-trang' },
  { id: 13, name: 'Thần Thoại', slug: 'than-thoai' },
  { id: 14, name: 'Anime', slug: 'anime' },
];

const COUNTRIES = [
  { id: 1, name: 'Việt Nam', slug: 'viet-nam', flag: '🇻🇳' },
  { id: 2, name: 'Hàn Quốc', slug: 'han-quoc', flag: '🇰🇷' },
  { id: 3, name: 'Trung Quốc', slug: 'trung-quoc', flag: '🇨🇳' },
  { id: 4, name: 'Nhật Bản', slug: 'nhat-ban', flag: '🇯🇵' },
  { id: 5, name: 'Mỹ', slug: 'my', flag: '🇺🇸' },
  { id: 6, name: 'Thái Lan', slug: 'thai-lan', flag: '🇹🇭' },
  { id: 7, name: 'Anh', slug: 'anh', flag: '🇬🇧' },
  { id: 8, name: 'Pháp', slug: 'phap', flag: '🇫🇷' },
];

const MOVIES = [
  {
    id: 1, title: 'Avengers: Endgame', slug: 'avengers-endgame',
    originalTitle: 'Avengers: Endgame',
    poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dber5HObMRZwTiMIuMn.jpg',
    banner: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
    description: 'Sau các sự kiện tàn khốc của Avengers: Infinity War, vũ trụ đang trong đống đổ nát. Với sự giúp đỡ của các đồng minh còn lại, các Avengers tập hợp một lần nữa để đảo ngược hành động của Thanos và khôi phục sự cân bằng cho vũ trụ.',
    genres: [1, 5, 7], country: 5, year: 2019, duration: '181 phút',
    status: 'Hoàn Thành', type: 'phim-le', quality: '4K',
    director: 'Anthony Russo, Joe Russo',
    actors: 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson',
    imdb: 8.4, views: 125000, featured: true, visible: true,
    episodes: [{ id: 1, name: 'Full', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    comments: [], createdAt: '2024-04-26'
  },
  {
    id: 2, title: 'Hậu Duệ Mặt Trời', slug: 'hau-due-mat-troi',
    originalTitle: 'Descendants of the Sun',
    poster: 'https://image.tmdb.org/t/p/w500/krV8IOJH6IhxIIJvOJYnYt0cFQX.jpg',
    banner: 'https://image.tmdb.org/t/p/original/wXsQvli6tWqja5t0Myq0b2hEEe0.jpg',
    description: 'Câu chuyện tình yêu giữa Đại úy Yoo Shi Jin thuộc lực lượng đặc nhiệm và bác sĩ Kang Mo Yeon. Hai người gặp nhau trong hoàn cảnh đặc biệt và dần nảy sinh tình cảm.',
    genres: [2, 1], country: 2, year: 2016, duration: '60 phút/tập',
    status: 'Hoàn Thành', type: 'phim-bo', quality: '1080p',
    director: 'Lee Eung Bok',
    actors: 'Song Joong Ki, Song Hye Kyo, Jin Goo, Kim Ji Won',
    imdb: 8.2, views: 98000, featured: true, visible: true,
    episodes: Array.from({length: 16}, (_, i) => ({ id: i+1, name: `Tập ${i+1}`, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })),
    comments: [], createdAt: '2024-02-14'
  },
  {
    id: 3, title: 'Demon Slayer: Kimetsu no Yaiba', slug: 'demon-slayer',
    originalTitle: '鬼滅の刃',
    poster: 'https://image.tmdb.org/t/p/w500/wrCVHdkBlBWdJUZPvnibY4eYKra.jpg',
    banner: 'https://image.tmdb.org/t/p/original/sNrnjB5MEEbQ5UpYDJCBnMWlSCq.jpg',
    description: 'Tanjiro Kamado là một cậu bé sống cùng gia đình trên núi. Sau khi gia đình bị quỷ tàn sát và em gái Nezuko bị biến thành quỷ, Tanjiro quyết tâm trở thành thợ săn quỷ để tìm cách cứu em.',
    genres: [1, 6, 14], country: 4, year: 2019, duration: '24 phút/tập',
    status: 'Đang Chiếu', type: 'anime', quality: '1080p',
    director: 'Haruo Sotozaki',
    actors: 'Natsuki Hanae, Akari Kito, Hiro Shimono, Yoshitsugu Matsuoka',
    imdb: 8.7, views: 150000, featured: true, visible: true,
    episodes: Array.from({length: 26}, (_, i) => ({ id: i+1, name: `Tập ${i+1}`, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })),
    comments: [], createdAt: '2024-01-10'
  },
  {
    id: 4, title: 'Interstellar', slug: 'interstellar',
    originalTitle: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK1DVfjko.jpg',
    description: 'Trong tương lai, Trái Đất đang dần trở nên không thể sinh sống. Một nhóm phi hành gia thực hiện sứ mệnh quan trọng nhất trong lịch sử loài người: du hành qua một lỗ giun để tìm ngôi nhà mới cho nhân loại.',
    genres: [5, 7, 8], country: 5, year: 2014, duration: '169 phút',
    status: 'Hoàn Thành', type: 'phim-le', quality: '4K',
    director: 'Christopher Nolan',
    actors: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    imdb: 8.6, views: 112000, featured: true, visible: true,
    episodes: [{ id: 1, name: 'Full', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    comments: [], createdAt: '2024-03-20'
  },
  {
    id: 5, title: 'Squid Game', slug: 'squid-game',
    originalTitle: '오징어 게임',
    poster: 'https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg',
    banner: 'https://image.tmdb.org/t/p/original/oCC0aRpMBOHPmGnMJO3HF3kREg0.jpg',
    description: 'Hàng trăm người chơi thiếu tiền nhận lời mời tham gia một trò chơi sinh tồn kỳ lạ. Giải thưởng khổng lồ chờ đợi nhưng cái giá phải trả có thể là mạng sống.',
    genres: [8, 1, 9], country: 2, year: 2021, duration: '55 phút/tập',
    status: 'Hoàn Thành', type: 'phim-bo', quality: '4K',
    director: 'Hwang Dong Hyuk',
    actors: 'Lee Jung Jae, Park Hae Soo, Wi Ha Joon, Jung Ho Yeon',
    imdb: 8.0, views: 200000, featured: true, visible: true,
    episodes: Array.from({length: 9}, (_, i) => ({ id: i+1, name: `Tập ${i+1}`, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })),
    comments: [], createdAt: '2024-05-01'
  },
  {
    id: 6, title: 'One Piece', slug: 'one-piece',
    originalTitle: 'ワンピース',
    poster: 'https://image.tmdb.org/t/p/w500/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg',
    banner: 'https://image.tmdb.org/t/p/original/kRRZm5qWkMdliJGRUFnSFk4kN1Z.jpg',
    description: 'Monkey D. Luffy và nhóm bạn hải tặc Mũ Rơm bắt đầu cuộc phiêu lưu tìm kiếm kho báu One Piece huyền thoại để trở thành Vua Hải Tặc.',
    genres: [1, 7, 6, 14], country: 4, year: 1999, duration: '24 phút/tập',
    status: 'Đang Chiếu', type: 'anime', quality: '1080p',
    director: 'Eiichiro Oda',
    actors: 'Mayumi Tanaka, Kazuya Nakai, Akemi Okamura',
    imdb: 8.9, views: 300000, featured: true, visible: true,
    episodes: Array.from({length: 20}, (_, i) => ({ id: i+1, name: `Tập ${i+1}`, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })),
    comments: [], createdAt: '2024-01-01'
  },
  {
    id: 7, title: 'Inception', slug: 'inception',
    originalTitle: 'Inception',
    poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg',
    banner: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    description: 'Dom Cobb là một tên trộm tài năng, chuyên đánh cắp bí mật từ giấc mơ. Anh được giao nhiệm vụ cuối cùng: cấy một ý tưởng vào tiềm thức của mục tiêu.',
    genres: [1, 5, 8], country: 5, year: 2010, duration: '148 phút',
    status: 'Hoàn Thành', type: 'phim-le', quality: '4K',
    director: 'Christopher Nolan',
    actors: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy',
    imdb: 8.8, views: 95000, featured: false, visible: true,
    episodes: [{ id: 1, name: 'Full', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    comments: [], createdAt: '2024-03-15'
  },
  {
    id: 8, title: 'Thất Sơn Tâm Linh', slug: 'that-son-tam-linh',
    originalTitle: 'Thiên Linh Cái',
    poster: 'https://image.tmdb.org/t/p/w500/upnOLaMeJHhdb6MtFcMWxXmYiFC.jpg',
    banner: 'https://image.tmdb.org/t/p/original/upnOLaMeJHhdb6MtFcMWxXmYiFC.jpg',
    description: 'Bộ phim kinh dị Việt Nam lấy bối cảnh vùng Bảy Núi, An Giang. Câu chuyện xoay quanh những hiện tượng tâm linh bí ẩn và tội ác man rợ.',
    genres: [4, 8], country: 1, year: 2019, duration: '100 phút',
    status: 'Hoàn Thành', type: 'phim-le', quality: '1080p',
    director: 'Nguyễn Hữu Hoàng',
    actors: 'Quang Tuấn, Trần Phong, Hoàng Yến Chibi',
    imdb: 6.2, views: 45000, featured: false, visible: true,
    episodes: [{ id: 1, name: 'Full', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    comments: [], createdAt: '2024-06-01'
  },
  {
    id: 9, title: 'Frozen II', slug: 'frozen-2',
    originalTitle: 'Frozen II',
    poster: 'https://image.tmdb.org/t/p/w500/pjeMs3yqRmFL3giJy0PMmu6EHTn.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xJWPZIYOEFIjZpBL7SVBGnzRYXp.jpg',
    description: 'Elsa và Anna cùng Kristoff, Olaf và Sven lên đường đến vùng rừng cổ xưa phía bắc để khám phá nguồn gốc sức mạnh của Elsa và cứu vương quốc.',
    genres: [6, 7], country: 5, year: 2019, duration: '103 phút',
    status: 'Hoàn Thành', type: 'hoat-hinh', quality: '4K',
    director: 'Chris Buck, Jennifer Lee',
    actors: 'Idina Menzel, Kristen Bell, Josh Gad, Jonathan Groff',
    imdb: 6.9, views: 78000, featured: false, visible: true,
    episodes: [{ id: 1, name: 'Full', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    comments: [], createdAt: '2024-04-10'
  },
  {
    id: 10, title: 'Dune: Part Two', slug: 'dune-part-two',
    originalTitle: 'Dune: Part Two',
    poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
    banner: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    description: 'Paul Atreides hợp nhất với người Fremen trong khi đang trên con đường trả thù chống lại những kẻ âm mưu tiêu diệt gia đình anh.',
    genres: [5, 1, 7], country: 5, year: 2024, duration: '166 phút',
    status: 'Hoàn Thành', type: 'phim-chieu-rap', quality: '4K',
    director: 'Denis Villeneuve',
    actors: 'Timothée Chalamet, Zendaya, Austin Butler, Florence Pugh',
    imdb: 8.5, views: 180000, featured: true, visible: true,
    episodes: [{ id: 1, name: 'Full', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }],
    comments: [], createdAt: '2024-03-01'
  },
  {
    id: 11, title: 'Naruto Shippuden', slug: 'naruto-shippuden',
    originalTitle: 'ナルト 疾風伝',
    poster: 'https://image.tmdb.org/t/p/w500/zAYRe2bJxpWTVrwwmBc00VFkAf4.jpg',
    banner: 'https://image.tmdb.org/t/p/original/pjLmM1dN7TvCSJVlbSBSBMrjXgP.jpg',
    description: 'Naruto Uzumaki trở về làng Lá sau 2 năm tu luyện cùng Jiraiya. Cậu phải đối mặt với tổ chức Akatsuki nguy hiểm đang săn lùng các Jinchuuriki.',
    genres: [1, 7, 14], country: 4, year: 2007, duration: '23 phút/tập',
    status: 'Hoàn Thành', type: 'anime', quality: '1080p',
    director: 'Hayato Date',
    actors: 'Junko Takeuchi, Noriaki Sugiyama, Kazuhiko Inoue',
    imdb: 8.6, views: 250000, featured: false, visible: true,
    episodes: Array.from({length: 20}, (_, i) => ({ id: i+1, name: `Tập ${i+1}`, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })),
    comments: [], createdAt: '2024-01-05'
  },
  {
    id: 12, title: 'Running Man', slug: 'running-man',
    originalTitle: '런닝맨',
    poster: 'https://image.tmdb.org/t/p/w500/grWP0zMkgrBOL76cxMXUxjelx3Q.jpg',
    banner: 'https://image.tmdb.org/t/p/original/grWP0zMkgrBOL76cxMXUxjelx3Q.jpg',
    description: 'Chương trình giải trí nổi tiếng của Hàn Quốc với các thử thách vui nhộn, trò chơi xé bảng tên và nhiều khách mời nổi tiếng.',
    genres: [3], country: 2, year: 2010, duration: '90 phút/tập',
    status: 'Đang Chiếu', type: 'tv-show', quality: '1080p',
    director: 'Im Hyung Taek',
    actors: 'Yoo Jae Suk, Kim Jong Kook, Song Ji Hyo, HaHa, Ji Suk Jin',
    imdb: 8.3, views: 120000, featured: false, visible: true,
    episodes: Array.from({length: 10}, (_, i) => ({ id: i+1, name: `Tập ${i+1}`, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' })),
    comments: [], createdAt: '2024-05-15'
  },
];

const UPCOMING_MOVIES = [
  { id: 101, title: 'Avatar 3', year: 2025, poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg', releaseDate: '2025-12-19' },
  { id: 102, title: 'Spider-Man 4', year: 2026, poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', releaseDate: '2026-07-24' },
  { id: 103, title: 'The Batman 2', year: 2026, poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', releaseDate: '2026-10-02' },
];

const ADMIN_DEFAULT = { username: 'admin', password: 'Admin123@@', role: 'admin', displayName: 'Admin', email: 'adadmin349@gmail.com' };

// Database simulation using localStorage
class Database {
  constructor() {
    this.init();
    this.initFirebase();
  }

  init() {
    // === PHÁT HIỆN DỮ LIỆU SCRAPE MỚI ===
    // Nếu nguonc-data.js có stamp mới hơn stamp đã lưu, xóa localStorage cũ
    // để trình duyệt dùng dữ liệu scrape mới nhất
    const currentUpdateStamp = window.pfMoviesUpdateStamp || 0;
    const lastCloudStamp = parseInt(localStorage.getItem('pf_cloud_stamp') || '0');
    if (currentUpdateStamp > lastCloudStamp) {
      console.log(`[PhimFlix] Phát hiện dữ liệu scrape mới (stamp: ${currentUpdateStamp}). Xóa cache cũ để nhận phim mới...`);
      localStorage.setItem('pf_cloud_stamp', currentUpdateStamp.toString());
      localStorage.removeItem('pf_movies'); // BẮT BUỘC XÓA ĐỂ LẤY PHIM TỪ FILE JSON
    }

    if (!localStorage.getItem('pf_movies')) {
      // Nếu có dữ liệu scrape mới, dùng nó; nếu không dùng MOVIES mặc định
      const baseMovies = (window.pfMovies && window.pfMovies.length > 0) ? window.pfMovies : MOVIES;
      // Không lưu vào localStorage ở đây — để getMovies() trả thẳng memoryMovies
      // Chỉ lưu MOVIES mặc định nếu không có scrape data
      if (!window.pfMovies || window.pfMovies.length === 0) {
        localStorage.setItem('pf_movies', JSON.stringify(MOVIES));
      }
    }
    if (!localStorage.getItem('pf_genres')) {
      localStorage.setItem('pf_genres', JSON.stringify(GENRES));
    }
    if (!localStorage.getItem('pf_countries')) {
      localStorage.setItem('pf_countries', JSON.stringify(COUNTRIES));
    }

    const existingUsers = this.get('users');
    const hasAdmin = existingUsers.some(user => user.role === 'admin');
    const updatedUsers = hasAdmin
      ? existingUsers.map(user => user.role === 'admin' ? { ...user, ...ADMIN_DEFAULT } : user)
      : [...existingUsers, ADMIN_DEFAULT];

    localStorage.setItem('pf_users', JSON.stringify(updatedUsers));

    if (!localStorage.getItem('pf_reports')) {
      localStorage.setItem('pf_reports', JSON.stringify([]));
    }
    if (!localStorage.getItem('pf_stats')) {
      localStorage.setItem('pf_stats', JSON.stringify({ today: 1250, week: 8700, month: 35000, year: 420000 }));
    }
  }

  initFirebase() {
    if (typeof window.isFirebaseConfigured !== 'function' || !window.isFirebaseConfigured()) {
        console.warn("Firebase is not configured. Running in Local Mode.");
        return;
    }
    
    this._isSaving = false; // Flag to prevent Firebase listener from overwriting local saves
    
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        this.dbRef = firebase.database().ref('/');
        
        // Sync Firebase to LocalStorage
        this.dbRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Pull movies from Firebase (cross-device sync) if we are not actively saving
                if (data.movies && !this._isSaving) {
                    let memoryMovies = window.pfMovies || [];
                    
                    let lastCloudStamp = parseInt(localStorage.getItem('pf_cloud_stamp') || '0');
                    let currentUpdateStamp = window.pfMoviesUpdateStamp || 0;
                    
                    if (currentUpdateStamp > lastCloudStamp) {
                        console.log("Tìm thấy bản cào dữ liệu phim mới. Đang đồng bộ lên Firebase...");
                        localStorage.setItem('pf_cloud_stamp', currentUpdateStamp);
                        // Xóa episodes cũ để buộc dùng dữ liệu mới từ scrape
                        localStorage.removeItem('pf_episodes');
                        localStorage.removeItem('pf_movies');
                        this.dbRef.child('movies').set(memoryMovies);
                        this._saveMoviesToLocal(memoryMovies);
                    } else {
                        this._saveMoviesToLocal(data.movies);
                    }
                }
                
                if (data.genres) localStorage.setItem('pf_genres', JSON.stringify(data.genres));
                if (data.countries) localStorage.setItem('pf_countries', JSON.stringify(data.countries));
                if (data.users) localStorage.setItem('pf_users', JSON.stringify(data.users));
                if (data.reports) localStorage.setItem('pf_reports', JSON.stringify(data.reports));
                if (data.stats) localStorage.setItem('pf_stats', JSON.stringify(data.stats));
                if (data.watchHistory) localStorage.setItem('pf_watchHistory', JSON.stringify(data.watchHistory));
                if (data.favorites) localStorage.setItem('pf_favorites', JSON.stringify(data.favorites));
                
                window.dispatchEvent(new Event('cloudDataSynced'));
            } else {
                console.log("Cloud is empty. Pushing local data to cloud...");
                this.pushAllToCloud();
            }
        });
    } catch(e) {
        console.error("Firebase init error:", e);
    }
  }

  _blockFirebaseSync(ms = 3000) {
    this._isSaving = true;
    clearTimeout(this._savingTimer);
    this._savingTimer = setTimeout(() => { this._isSaving = false; }, ms);
  }

  pushAllToCloud() {
      if (!this.dbRef) return;
      this.dbRef.set({
          movies: this.getMovies(),
          genres: this.getGenres(),
          countries: this.getCountries(),
          users: this.getUsers(),
          reports: this.getReports(),
          stats: this.getStats(),
          watchHistory: this.getWatchHistory(),
          favorites: this.getFavorites()
      });
  }

  get(key) { return JSON.parse(localStorage.getItem(`pf_${key}`) || '[]'); }
  set(key, data) { localStorage.setItem(`pf_${key}`, JSON.stringify(data)); }

  getEpisodes() {
      try {
          return JSON.parse(localStorage.getItem('pf_episodes') || '{}');
      } catch(e) { return {}; }
  }

  getServers() {
      try {
          return JSON.parse(localStorage.getItem('pf_servers') || '{}');
      } catch(e) { return {}; }
  }

  getMovies() { 
      let memoryMovies = window.pfMovies || [];
      let localMovies = this.get('movies') || [];
      
      let lastCloudStamp = parseInt(localStorage.getItem('pf_cloud_stamp') || '0');
      let currentUpdateStamp = window.pfMoviesUpdateStamp || 0;
      const hasNewScrapeData = currentUpdateStamp > lastCloudStamp;
      
      // Luôn cập nhật stamp mới nhất nếu có
      if (hasNewScrapeData) {
          localStorage.setItem('pf_cloud_stamp', currentUpdateStamp.toString());
      }
      
      // Restore episodes from separate storage
      // QUAN TRỌNG: Nếu có dữ liệu scrape mới, KHÔNG dùng pf_episodes làm override cho phim đã có trong pfMovies
      // vì pf_episodes có thể bị stale (link hỏng, đếm sai do scrape lỗi trước đó)
      const storedEpisodes = hasNewScrapeData ? {} : this.getEpisodes();
      const storedServers = hasNewScrapeData ? {} : this.getServers();
      
      // Build a fast set of IDs that exist in pfMovies for O(1) lookup
      const scrapeMovieIds = new Set(memoryMovies.map(m => m.id));

      localMovies = localMovies.map(m => {
          // Nếu phim này có trong pfMovies → KHÔNG restore episodes từ pf_episodes
          // (pfMovies episodes sẽ thắng trong merge bên dưới)
          if (scrapeMovieIds.has(m.id)) {
              return { ...m, episodes: [], servers: [] }; // Reset về [] để scrape episodes luôn thắng
          }
          // Phim chỉ có trong localStorage (admin thêm thủ công) → dùng pf_episodes
          return {
              ...m,
              episodes: storedEpisodes[m.id] !== undefined ? storedEpisodes[m.id] : (m.episodes || []),
              servers: storedServers[m.id] !== undefined ? storedServers[m.id] : (m.servers || [])
          };
      });
      
      if (localMovies.length > 0 && memoryMovies.length > 0) {
          // Smart Merge: scrape data là base, localStorage chỉ cung cấp các trường admin đã chỉnh sửa
          let merged = [...memoryMovies];
          localMovies.forEach(lm => {
              // Match by ID first (most reliable), then apiUrl, but NOT title alone (too risky — same title ≠ same movie)
              const idx = merged.findIndex(m => m.id === lm.id || 
                                                (lm.apiUrl && m.apiUrl === lm.apiUrl));
              if (idx !== -1) {
                  // scrapeEpisodes luôn là episodes từ pfMovies (đã reset lm.episodes = [] ở trên)
                  // Admin episodes chỉ thắng nếu họ có NHIỀU HƠN (tức admin thêm tập thủ công)
                  const scrapeEpisodes = merged[idx].episodes || [];
                  const adminEpisodes = lm.episodes || [];
                  const finalEpisodes = adminEpisodes.length > scrapeEpisodes.length ? adminEpisodes : scrapeEpisodes;
                  
                  // visible: chỉ ẩn nếu admin rõ ràng set false; undefined/null → dùng true
                  const finalVisible = (lm.visible === false) ? false : true;
                  // featured: giữ từ scrape trừ khi admin bật
                  const finalFeatured = lm.featured === true ? true : merged[idx].featured;

                  merged[idx] = {
                      ...lm,          // Đưa localStorage lên trước (dữ liệu cũ sẽ bị đè)
                      ...merged[idx], // Dữ liệu scrape mới NHẤT ĐỊNH phải thắng (đè lên localStorage)
                      episodes: finalEpisodes,
                      servers: merged[idx].servers || lm.servers || [],
                      // Lấy episode, status, updatedAt từ scrape. 
                      // (Không dùng lm.episode nữa để tránh lỗi kẹt text "Tập 1" từ data cũ)
                      episode: merged[idx].episode,
                      status: merged[idx].status,
                      updatedAt: merged[idx].updatedAt,
                      visible: finalVisible,
                      featured: finalFeatured,
                  };
              } else {
                  // Phim chỉ trong localStorage (admin thêm thủ công) — đảm bảo visible
                  lm.visible = (lm.visible === false) ? false : true;
                  merged.push(lm);
              }
          });
          
          const deletedIds = this.get('deleted_movies') || [];
          return merged
              .filter(m => !deletedIds.includes(m.id))
              .map(m => ({ ...m, visible: m.visible !== false })) // Safety net: đảm bảo visible luôn có giá trị boolean
              .sort((a, b) => b.id - a.id);
      }
      
      const deletedIds = this.get('deleted_movies') || [];
      const result = localMovies.length > 0 ? localMovies : memoryMovies;
      return result
          .filter(m => !deletedIds.includes(m.id))
          .map(m => ({ ...m, visible: m.visible !== false })); // Safety net cho fallback path
  }
  
  _saveMoviesToLocal(m) {
      // Bỏ dòng window.pfMovies = m; để không ghi đè dữ liệu cào (scraped data) bằng dữ liệu cũ từ Firebase
      
      // Save episodes separately to reduce localStorage size
      const episodesMap = {};
      const serversMap = {};
      const moviesWithoutEpisodes = m.map(movie => {
          episodesMap[movie.id] = movie.episodes || [];
          serversMap[movie.id] = movie.servers || [];
          const { episodes, servers, ...rest } = movie;
          return rest;
      });
      
      // Save episodes separately
      try {
          localStorage.setItem('pf_episodes', JSON.stringify(episodesMap));
          localStorage.setItem('pf_servers', JSON.stringify(serversMap));
      } catch(e) {
          console.warn('Episodes too large for localStorage, skipping:', e);
      }
      
      // Save movies (without episodes) - much smaller
      try {
          localStorage.setItem('pf_movies', JSON.stringify(moviesWithoutEpisodes));
      } catch(e) {
          console.error('Movies still too large for localStorage:', e);
          try {
              // Last resort 1: save only essential fields
              const minimal = moviesWithoutEpisodes.map(({ id, title, originalTitle, type, year, poster, banner, featured, visible, status, quality, views, genres, description, director, actors, duration, imdb, slug, apiUrl, createdAt }) =>
                  ({ id, title, originalTitle, type, year, poster, banner, featured, visible, status, quality, views, genres, description, director, actors, duration, imdb, slug, apiUrl, createdAt })
              );
              localStorage.setItem('pf_movies', JSON.stringify(minimal));
          } catch(e2) {
              console.error('Minimal movies too large, stripping long texts:', e2);
              try {
                  // Last resort 2: strip descriptions and long texts completely
                  const ultraMinimal = moviesWithoutEpisodes.map(m => {
                      const um = { ...m };
                      delete um.description;
                      delete um.actors;
                      delete um.director;
                      return um;
                  });
                  localStorage.setItem('pf_movies', JSON.stringify(ultraMinimal));
              } catch(e3) {
                  console.error('Ultra minimal movies still too large. Giving up on localStorage:', e3);
              }
          }
      }
  }
  
  saveMovies(m) { 
      this._saveMoviesToLocal(m);
      if (this.dbRef) {
          try {
              this.dbRef.child('movies').set(m); 
          } catch(e) {
              console.error("Firebase set error:", e);
          }
      }
  }
  
  getGenres() { return this.get('genres'); }
  saveGenres(g) { this._blockFirebaseSync(3000); this.set('genres', g); if (this.dbRef) this.dbRef.child('genres').set(g); }
  
  getCountries() { return this.get('countries'); }
  saveCountries(c) { this._blockFirebaseSync(3000); this.set('countries', c); if (this.dbRef) this.dbRef.child('countries').set(c); }
  
  getUsers() { return this.get('users'); }
  saveUsers(u) { this._blockFirebaseSync(3000); this.set('users', u); if (this.dbRef) this.dbRef.child('users').set(u); }
  
  getReports() { return this.get('reports'); }
  saveReports(r) { this.set('reports', r); if (this.dbRef) this.dbRef.child('reports').set(r); }
  
  getStats() { return JSON.parse(localStorage.getItem('pf_stats') || '{}'); }
  saveStats(s) { localStorage.setItem('pf_stats', JSON.stringify(s)); if (this.dbRef) this.dbRef.child('stats').set(s); }

  getCurrentUser() {
    const u = localStorage.getItem('pf_currentUser');
    return u ? JSON.parse(u) : null;
  }
  setCurrentUser(u) {
    if (u) localStorage.setItem('pf_currentUser', JSON.stringify(u));
    else localStorage.removeItem('pf_currentUser');
  }

  getCurrentAdmin() {
    const a = localStorage.getItem('pf_currentAdmin');
    return a ? JSON.parse(a) : null;
  }
  setCurrentAdmin(a) {
    if (a) localStorage.setItem('pf_currentAdmin', JSON.stringify(a));
    else localStorage.removeItem('pf_currentAdmin');
  }

  getWatchHistory(username) {
    if (username) {
      const raw = localStorage.getItem(`pf_history_${username}`) || '[]';
      return JSON.parse(raw); // returns array of movieIds
    }
    return this.get('watchHistory') || [];
  }
  saveWatchHistory(username, movieId) {
    if (username && movieId !== undefined) {
      // username + movieId mode (called from initWatch)
      const hist = this.getWatchHistory(username);
      const filtered = hist.filter(id => id !== movieId);
      filtered.unshift(movieId); // most recent first
      const trimmed = filtered.slice(0, 100);
      localStorage.setItem(`pf_history_${username}`, JSON.stringify(trimmed));
      if (this.dbRef) this.dbRef.child(`history_${username}`).set(trimmed);
    } else if (username) {
      // legacy: saveWatchHistory(array)
      this.set('watchHistory', username);
      if (this.dbRef) this.dbRef.child('watchHistory').set(username);
    }
  }
  
  getFavorites(username) {
    if (username) {
      const raw = localStorage.getItem(`pf_favs_${username}`) || '[]';
      return JSON.parse(raw); // returns array of movieIds
    }
    return this.get('favorites') || [];
  }
  saveFavorites(username, favIds) {
    if (username && Array.isArray(favIds)) {
      localStorage.setItem(`pf_favs_${username}`, JSON.stringify(favIds));
      if (this.dbRef) this.dbRef.child(`favs_${username}`).set(favIds);
    } else if (username) {
      // legacy: saveFavorites(array)
      this.set('favorites', username);
      if (this.dbRef) this.dbRef.child('favorites').set(username);
    }
  }
  
  addFavorite(username, movieId) {
    const favs = this.getFavorites(username);
    if (!favs.includes(movieId)) {
      favs.push(movieId);
      this.saveFavorites(username, favs);
    }
  }

  removeFavorite(username, movieId) {
    const favs = this.getFavorites(username).filter(id => id !== movieId);
    this.saveFavorites(username, favs);
  }

  getWatchPositions() { return JSON.parse(localStorage.getItem('pf_watchPositions') || '{}'); }
  saveWatchPositions(p) { localStorage.setItem('pf_watchPositions', JSON.stringify(p)); }

  resetAll() {
    const keys = ['movies','genres','countries','users','reports','stats','currentUser','watchHistory','favorites','watchPositions'];
    keys.forEach(k => localStorage.removeItem(`pf_${k}`));
    if (this.dbRef) this.dbRef.remove();
    this.init();
  }

  exportSyncData(username) {
    // Use the new per-username storage keys
    const hist = this.getWatchHistory(username) || []; // array of movieIds
    const favs = this.getFavorites(username) || [];    // array of movieIds
    const data = { hist, favs, time: Date.now() };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  importSyncData(username, syncString) {
    try {
      const data = JSON.parse(decodeURIComponent(escape(atob(syncString))));
      if (data && Array.isArray(data.hist) && Array.isArray(data.favs)) {
        const currentHist = this.getWatchHistory(username) || [];
        const currentFavs = this.getFavorites(username) || [];
        
        // Merge: deduplicate, keep most recent first
        const mergedHist = [...new Set([...data.hist, ...currentHist])].slice(0, 100);
        const mergedFavs = [...new Set([...data.favs, ...currentFavs])];
        
        // Save directly to per-username keys
        localStorage.setItem(`pf_history_${username}`, JSON.stringify(mergedHist));
        localStorage.setItem(`pf_favs_${username}`, JSON.stringify(mergedFavs));
        return true;
      }
    } catch(e) {
      console.error('Sync error', e);
    }
    return false;
  }
}

const db = new Database();

// IndexedDB Helper for Videos
const idbVideo = {
    dbPromise: null,
    init() {
        if (!this.dbPromise) {
            this.dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open('PhimFlix_Videos', 1);
                request.onupgradeneeded = (e) => {
                    e.target.result.createObjectStore('videos');
                };
                request.onsuccess = (e) => resolve(e.target.result);
                request.onerror = (e) => reject(e.target.error);
            });
        }
        return this.dbPromise;
    },
    async saveVideo(id, blob) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite');
            tx.objectStore('videos').put(blob, id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },
    async getVideo(id) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readonly');
            const req = tx.objectStore('videos').get(id);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(tx.error);
        });
    }
};
