import { H as Hls } from "./hls.js";

var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-player]"));

players.forEach(function (stage) {
    var video = stage.querySelector("video");
    var button = stage.querySelector("[data-play-button]");
    var source = stage.getAttribute("data-video-src");
    var status = stage.querySelector("[data-video-status]");
    var hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function attachSource() {
        if (video.getAttribute("data-ready") === "true") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    setStatus("网络恢复中，请稍候");
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    setStatus("播放器恢复中，请稍候");
                } else {
                    hlsInstance.destroy();
                    setStatus("播放器暂时无法加载，请刷新页面重试");
                }
            });
        } else {
            video.src = source;
        }

        video.setAttribute("data-ready", "true");
    }

    function playVideo() {
        attachSource();
        video.controls = true;
        stage.classList.add("is-playing");
        setStatus("正在加载正片");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                setStatus("点击视频区域继续播放");
            });
        }
    }

    stage.addEventListener("click", function (event) {
        if (event.target === video) {
            return;
        }
        playVideo();
    });

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            playVideo();
        });
    }
});
