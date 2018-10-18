var Module = typeof Module !== 'undefined' ? Module : {};

const loadWasm = () => {
  return new Promise(resolve => {
    Module.onRuntimeInitialized = () => resolve({
      memory: HEAPU8,
      wam: Module.asm
    });

    const script = document.createElement('script');
    script.src = './dist/filter-emscripten.js';
    document.body.appendChild(script);
  })
};

/**
 * Applies a grayscale-filter to an image
 * @param {ImageData} imageData
 */
const filterImage = (memory, grayscale, imageData) => {
  const {data: pixelData, height, width} = imageData;

  const memoryLocation = _malloc(pixelData.length);
  memory.set(pixelData, memoryLocation);
  grayscale(memoryLocation, width, height);
  const filteredPixelData = memory.subarray(memoryLocation, memoryLocation + pixelData.length);
  _free(memoryLocation);

  return new ImageData(new Uint8ClampedArray(filteredPixelData), width, height);
};

const filterWebcam = (videoElement, canvasElement, context, wam, memory) => {
  const width = videoElement.videoWidth || 640;
  const height = videoElement.videoHeight || 480;

  canvasElement.setAttribute("width", width);
  canvasElement.setAttribute("height", height);

  context.drawImage(videoElement, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const filteredImageData = filterImage(memory, wam._grayscale, imageData);

  context.putImageData(filteredImageData, 0, 0);
};

loadWasm().then(({memory, wam}) => {
  const videoElement = document.querySelector("video");

  videoElement.addEventListener("play", () => {
    const canvasElement = document.querySelector("canvas");
    const context = canvasElement.getContext("2d");
  
    const draw = () => {
      if (videoElement.paused) return false;
      filterWebcam(videoElement, canvasElement, context, wam, memory);
      requestAnimationFrame(draw);
    };
  
    draw();
  });
});
