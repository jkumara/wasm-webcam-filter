import { drawVideoToCanvas } from "./canvas.mjs";
import { toggleWebcam } from "./webcam.mjs";

const MEMORY_PAGE_BYTES = 1024 * 64;

const loadWasmModule = async() => {
  const memory = new WebAssembly.Memory({ initial: 256 });

  const options = {
    env: {
      memory,
      // We won't be using a table in this example, so set its initial size to 0
      table: new WebAssembly.Table({
        initial: 0,
        maximum: 10,
        element: "anyfunc"
      }),
      // Rest of the options are boilerplate for emsdk
      memoryBase: 1024,
      tableBase: 0,
      STACKTOP: 0,
      STACK_MAX: memory.buffer.byteLength,
      abortStackOverflow: () => {
        throw new Error("Stack overflow");
      }
    }
  };

  const wasm = await WebAssembly.instantiateStreaming(fetch("./dist/filter.wasm"), options);

  return {
    ...wasm.instance.exports,
    memory
  };
};

export const filterImage = (memory, filter) => imageData => {
  const { data: pixelData, height, width } = imageData;

  // Calculate how much memory we have available
  const currentMemoryAmount = memory.buffer.byteLength / MEMORY_PAGE_BYTES;
  // Calculate how much memory we need to for the pixel data of the image
  const requiredMemoryAmount = Math.ceil(
    pixelData.byteLength / MEMORY_PAGE_BYTES
  );

  // If we don't have enough memory, grow its size
  if (currentMemoryAmount < requiredMemoryAmount) {
    memory.grow(requiredMemoryAmount - currentMemoryAmount);
  }

  // Create a TypedArray and use it to set the pixel data to the WASM memory
  const moduleMemory = new Uint8ClampedArray(
    memory.buffer,
    0,
    pixelData.byteLength
  );
  moduleMemory.set(pixelData);

  // With the pixel data in the WASM memory, we can now grayscale it
  filter(moduleMemory, width, height);

  // Read the grayscaled image from the memory
  const filteredPixelData = moduleMemory.subarray(0, pixelData.byteLength);

  return new ImageData(filteredPixelData, width, height);
};


const main = async() => {
  const videoElement = document.createElement("video");
  const canvasElement = document.querySelector("canvas");

  const wam = await loadWasmModule();
  const filter = filterImage(wam.memory, wam._grayscale);
  drawVideoToCanvas(videoElement, canvasElement, filter);

  // Expose function to be used in the view
  window.toggleVideo = () => toggleWebcam(videoElement);;
};

main();