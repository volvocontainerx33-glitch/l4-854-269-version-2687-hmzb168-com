import { H as Hls } from './hls-vendor-dru42stk.js';

function setMessage(shell, text) {
    const message = shell.querySelector('[data-player-message]');
    if (message) {
        message.textContent = text || '';
    }
}

function createPlayer(shell) {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('.player-overlay');
    const source = shell.getAttribute('data-src');
    let initialized = false;
    let hlsInstance = null;

    if (!video || !overlay || !source) {
        return;
    }

    function initialize() {
        if (initialized) {
            return Promise.resolve();
        }
        initialized = true;
        setMessage(shell, '正在加载播放源...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            return new Promise((resolve, reject) => {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                    setMessage(shell, '');
                    resolve();
                });
                hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    setMessage(shell, '播放源加载失败，请刷新页面后重试。');
                    reject(new Error(data.type || 'HLS playback error'));
                });
            });
        }

        setMessage(shell, '当前浏览器不支持 HLS 播放，请更换新版浏览器。');
        return Promise.reject(new Error('HLS is not supported'));
    }

    function play() {
        initialize()
            .then(() => video.play())
            .then(() => {
                shell.classList.add('is-playing');
                setMessage(shell, '');
            })
            .catch(() => {
                overlay.style.display = '';
            });
    }

    overlay.addEventListener('click', play);
    video.addEventListener('play', () => shell.classList.add('is-playing'));
    video.addEventListener('pause', () => shell.classList.remove('is-playing'));
    video.addEventListener('ended', () => shell.classList.remove('is-playing'));

    window.addEventListener('beforeunload', () => {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

document.querySelectorAll('[data-player]').forEach(createPlayer);
