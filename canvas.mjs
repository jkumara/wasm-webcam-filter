const videoToCanvas = (videoElement, canvasElement) => {
  const context = canvasElement.getContext("2d");
  const width = videoElement.videoWidth || 640;
  const height = videoElement.videoHeight || 480;

  canvasElement.setAttribute("width", width);
  canvasElement.setAttribute("height", height);

  context.drawImage(videoElement, 0, 0);
};

const filterCanvas = (canvasElement, filter) => {
  const context = canvasElement.getContext("2d");
  const imageData = context.getImageData(
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );
  const filteredImageData = filter(imageData);

  context.putImageData(filteredImageData, 0, 0);
};

export const drawVideoToCanvas = (videoElement, canvasElement, filter) => {
  return videoElement.addEventListener("play", () => {
    const draw = () => {
      if (videoElement.paused) return false;
      videoToCanvas(videoElement, canvasElement);
      filterCanvas(canvasElement, filter);
      requestAnimationFrame(draw);
    };

    draw();
  });
};