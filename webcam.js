const setupWebcam = () =>
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .catch(console.error);

const streamToVideo = (stream, videoElement) => {
  videoElement.srcObject = stream;
};

const togglePlayPause = videoElement =>
  videoElement.paused ? videoElement.play() : videoElement.pause();

const toggleWebcam = async videoElement => {
  if (!videoElement.srcObject) {
    const stream = await setupWebcam();
    streamToVideo(stream, videoElement);
    return videoElement.play();
  }

  togglePlayPause(videoElement);
};
