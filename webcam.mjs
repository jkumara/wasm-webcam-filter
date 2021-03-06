const setupWebcam = () =>
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .catch(console.error);

const streamToVideo = (stream, videoElement) => {
  videoElement.srcObject = stream;
};

const togglePlayPause = videoElement =>
  videoElement.paused ? videoElement.play() : videoElement.pause();

export const toggleWebcam = async videoElement => {
  // Initialize when first starting webcam
  if (!videoElement.srcObject) {
    const stream = await setupWebcam();
    streamToVideo(stream, videoElement);
  }

  togglePlayPause(videoElement);
};
