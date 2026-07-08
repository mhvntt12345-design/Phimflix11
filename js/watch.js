// js/watch.js

document.addEventListener('DOMContentLoaded', () => {
    // Theme
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

    // Get Data
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'));
    let currentEpId = parseInt(urlParams.get('ep')) || 1;

    const movies = db.getMovies();
    const movie = movies.find(m => m.id === movieId);

    if (!movie) {
        document.querySelector('.watch-container').innerHTML = '<h2 style="text-align:center; width:100%">Không tìm thấy phim!</h2>';
        return;
    }

    if (!movie.episodes || movie.episodes.length === 0) {
        document.querySelector('.watch-container').innerHTML = '<h2 style="text-align:center; width:100%">Chưa có tập phim!</h2>';
        return;
    }
    const currentEpisode = movie.episodes.find(e => e.id === currentEpId) || movie.episodes[0];
    if (!currentEpisode) return;

    // Render Info & Sidebar
    renderWatchInfo(movie, currentEpisode);
    renderEpisodesList(movie, currentEpisode);

    // Setup Video Player
    setupPlayer(movie, currentEpisode);
});

function renderWatchInfo(movie, episode) {
    const infoContainer = document.getElementById('watchInfo');
    const views = formatViews(movie.views);
    
    infoContainer.innerHTML = `
        <h1 class="watch-title">${movie.title} ${movie.type !== 'phim-le' ? `- ${episode.name}` : ''}</h1>
        <div class="watch-meta">
            <span><i class='bx bxs-star' style="color: var(--accent-secondary)"></i> IMDb: ${movie.imdb}</span>
            <span>${movie.year}</span>
            <span><i class='bx bx-show'></i> ${views} Lượt xem</span>
        </div>
        <p style="color: var(--text-secondary); line-height: 1.6;">${movie.description}</p>
    `;

    document.getElementById('sidebarTitle').textContent = movie.title;
}

function renderEpisodesList(movie, currentEpisode) {
    const listContainer = document.getElementById('episodesList');
    
    if (movie.episodes.length === 0) {
        listContainer.innerHTML = '<div style="padding: 1rem; color: var(--text-muted)">Chưa có tập nào</div>';
        return;
    }

    let html = '';
    movie.episodes.forEach(ep => {
        const isActive = ep.id === currentEpisode.id ? 'active' : '';
        html += `
            <a href="watch.html?id=${movie.id}&ep=${ep.id}" class="ep-item ${isActive}">
                <div class="ep-name"><i class='bx ${isActive ? 'bx-play-circle' : 'bx-movie-play'}'></i> ${ep.name}</div>
                <div class="ep-duration">24:00</div>
            </a>
        `;
    });

    listContainer.innerHTML = html;

    // Scroll to active episode
    setTimeout(() => {
        const activeEl = listContainer.querySelector('.active');
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function formatViews(views) {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Custom Player Logic
function setupPlayer(movie, episode) {
    const video = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('videoContainer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = playBtn.querySelector('i');
    const progressBar = document.getElementById('progressBar');
    const progressFilled = document.getElementById('progressFilled');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = muteBtn.querySelector('i');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const pipBtn = document.getElementById('pipBtn');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsMenu = document.getElementById('settingsMenu');
    const speedBtn = document.getElementById('speedBtn');
    const speedValue = document.getElementById('speedValue');

    // Set source
    if (episode.videoUrl && (episode.videoUrl.startsWith('data:') || episode.videoUrl.startsWith('http') || episode.videoUrl.startsWith('blob:'))) {
        video.src = episode.videoUrl;
        video.load();
    } else if (episode.videoUrl && episode.videoUrl.startsWith('indexeddb:')) {
        // Legacy: support old indexeddb videos if any
        const videoId = episode.videoUrl.split(':')[1];
        if (typeof idbVideo !== 'undefined') {
            idbVideo.getVideo(videoId).then(blob => {
                if (blob) {
                    const videoBlob = new Blob([blob], { type: blob.type || 'video/mp4' });
                    video.src = URL.createObjectURL(videoBlob);
                    video.load();
                } else {
                    console.warn('Video not found in IndexedDB:', videoId);
                }
            }).catch(err => {
                console.error('IndexedDB video load error:', err);
            });
        }
    } else {
        video.src = episode.videoUrl || '';
        video.load();
    }

    // Toggle Play/Pause
    function togglePlay() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    function updatePlayIcon() {
        if (video.paused) {
            playIcon.className = 'bx bx-play';
            videoContainer.classList.add('paused');
        } else {
            playIcon.className = 'bx bx-pause';
            videoContainer.classList.remove('paused');
        }
    }

    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayIcon);
    video.addEventListener('pause', updatePlayIcon);

    // Progress Bar Update
    function handleProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progressFilled.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(video.currentTime);
    }

    video.addEventListener('timeupdate', handleProgress);

    // Loaded metadata
    video.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(video.duration);
    });

    // Scrub Progress Bar
    function scrub(e) {
        const scrubTime = (e.offsetX / progressBar.offsetWidth) * video.duration;
        video.currentTime = scrubTime;
    }

    let mousedown = false;
    progressBar.addEventListener('click', scrub);
    progressBar.addEventListener('mousemove', (e) => mousedown && scrub(e));
    progressBar.addEventListener('mousedown', () => mousedown = true);
    progressBar.addEventListener('mouseup', () => mousedown = false);

    // Volume
    function handleVolumeUpdate() {
        video.volume = volumeSlider.value;
        if (video.volume === 0) {
            muteIcon.className = 'bx bx-volume-mute';
            video.muted = true;
        } else if (video.volume < 0.5) {
            muteIcon.className = 'bx bx-volume-low';
            video.muted = false;
        } else {
            muteIcon.className = 'bx bx-volume-full';
            video.muted = false;
        }
    }

    volumeSlider.addEventListener('input', handleVolumeUpdate);

    muteBtn.addEventListener('click', () => {
        if (video.muted || video.volume === 0) {
            video.muted = false;
            volumeSlider.value = video.volume > 0 ? video.volume : 1;
            video.volume = volumeSlider.value;
        } else {
            video.muted = true;
            volumeSlider.value = 0;
        }
        handleVolumeUpdate();
    });

    // Skip
    rewindBtn.addEventListener('click', () => video.currentTime -= 10);
    forwardBtn.addEventListener('click', () => video.currentTime += 10);

    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
            fullscreenBtn.querySelector('i').className = 'bx bx-exit-fullscreen';
        } else {
            document.exitFullscreen();
            fullscreenBtn.querySelector('i').className = 'bx bx-fullscreen';
        }
    });

    // PiP
    pipBtn.addEventListener('click', async () => {
        try {
            if (video !== document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error('PiP error', error);
        }
    });

    // Settings Menu Toggle
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        settingsMenu.classList.remove('show');
    });

    settingsMenu.addEventListener('click', (e) => e.stopPropagation());

    // Playback Speed
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeedIdx = 2; // 1x
    speedBtn.addEventListener('click', () => {
        currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
        video.playbackRate = speeds[currentSpeedIdx];
        speedValue.textContent = speeds[currentSpeedIdx] === 1 ? 'Chuẩn' : `${speeds[currentSpeedIdx]}x`;
    });

    // Save Position Logic
    video.addEventListener('timeupdate', () => {
        if (video.currentTime > 5) {
            const positions = db.getWatchPositions();
            positions[`${movie.id}_${episode.id}`] = video.currentTime;
            db.saveWatchPositions(positions);
        }
    });

    // Restore Position
    const positions = db.getWatchPositions();
    const savedTime = positions[`${movie.id}_${episode.id}`];
    if (savedTime && savedTime > 0) {
        // Just for demo, you'd usually ask "Resume from X:XX?"
        video.currentTime = savedTime;
    }

    // Auto Play Next Episode
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    let autoPlayEnabled = true;
    autoPlayBtn.addEventListener('click', () => {
        autoPlayEnabled = !autoPlayEnabled;
        autoPlayBtn.querySelector('i').style.color = autoPlayEnabled ? 'var(--accent-primary)' : 'white';
    });

    video.addEventListener('ended', () => {
        if (autoPlayEnabled) {
            const currentIdx = movie.episodes.findIndex(e => e.id === episode.id);
            if (currentIdx !== -1 && currentIdx < movie.episodes.length - 1) {
                const nextEp = movie.episodes[currentIdx + 1];
                window.location.href = `watch.html?id=${movie.id}&ep=${nextEp.id}`;
            }
        }
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
            case 'KeyK':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                video.currentTime += 10;
                break;
            case 'ArrowLeft':
                video.currentTime -= 10;
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeSlider.value = video.volume;
                handleVolumeUpdate();
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeSlider.value = video.volume;
                handleVolumeUpdate();
                break;
            case 'KeyF':
                fullscreenBtn.click();
                break;
        }
    });
}
