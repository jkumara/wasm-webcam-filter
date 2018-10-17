const setupWebCam = () =>
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .catch(console.error);

const streamToVideo = (stream, videoElement) => {
  videoElement.srcObject = stream;
};

const togglePlayPause = videoElement =>
  !videoElement.paused ? videoElement.pause() : videoElement.play();

const toggleWebCam = async () => {
  const videoElement = document.querySelector("video");

  if (!videoElement.srcObject) {
    const stream = await setupWebCam();
    streamToVideo(stream, videoElement);
    return videoElement.play();
  }

  togglePlayPause(videoElement);
};
