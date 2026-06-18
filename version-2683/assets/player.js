import { H as Hls } from './hls-dru42stk.js';

const DEFAULT_HLS_SOURCE = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

function initPlayer(player) {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-play-button]');
  const status = player.querySelector('[data-player-status]');
  const source = player.dataset.src || DEFAULT_HLS_SOURCE;
  let hlsInstance = null;
  let hasLoaded = false;

  if (!video || !button) {
    return;
  }

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const attachSource = () => {
    if (hasLoaded) {
      return;
    }
    hasLoaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('正在使用浏览器原生 HLS 播放。');
      return;
    }

    if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('HLS 播放源已加载。');
      });
      hlsInstance.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          setStatus('播放源加载异常，请刷新页面后重试。');
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        }
      });
      return;
    }

    setStatus('当前浏览器不支持 HLS 播放。');
  };

  const startPlayback = async () => {
    attachSource();
    video.controls = true;
    player.classList.add('is-playing');
    try {
      await video.play();
      setStatus('正在播放。');
    } catch (error) {
      player.classList.remove('is-playing');
      setStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
    }
  };

  button.addEventListener('click', startPlayback);
  player.addEventListener('click', (event) => {
    if (event.target === video) {
      return;
    }
    if (!player.classList.contains('is-playing')) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.js-player').forEach(initPlayer);
});
