import { drawVideoToCanvas } from "./canvas.mjs";
import { toggleWebcam } from "./webcam.mjs";

const loadWasmModule = async () => {
  // Create memory and instantiate the filter.wasm here

  // Return the instantiated module and the memory
  return {};
};

export const getImageFilterFn = (memory, filter) => imageData => {
  // Filter the imageData and return a new ImageData object
  // https://developer.mozilla.org/en-US/docs/Web/API/ImageData
  return imageData;
};

const main = async () => {
  const videoElement = document.createElement("video");
  const canvasElement = document.querySelector("canvas");

  const wam = await loadWasmModule();
  const filter = getImageFilterFn(wam.memory, wam._grayscale);
  drawVideoToCanvas(videoElement, canvasElement, filter);

  // Expose function to be used in the view
  window.toggleVideo = () => toggleWebcam(videoElement);
};

main();
