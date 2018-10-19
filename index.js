// A WASM memory page has a constant size of 64 KiB
const MEMORY_PAGE_BYTES = 1024 * 64;

/**
 * Instantiates a WASM-module with its own memory
 * @param {string} path Path to the WASM-module
 */
const loadWasmModule = async path => {
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

  const wasm = await WebAssembly.instantiateStreaming(fetch(path), options);

  return {
    ...wasm.instance.exports,
    memory
  };
};

const loadWasm = async () => {
  return await loadWasmModule("./dist/filter.wasm");
};

/**
 * Applies a grayscale-filter to an image
 * @param {ImageData} imageData
 */
const filterImage = (memory, grayscale, imageData) => {
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
  grayscale(moduleMemory, width, height);

  // Read the grayscaled image from the memory
  const filteredPixelData = moduleMemory.subarray(0, pixelData.byteLength);

  return new ImageData(filteredPixelData, width, height);
};

const filterVideo = (videoElement, canvasElement, wam) => {
  const context = canvasElement.getContext("2d");
  const width = videoElement.videoWidth || 640;
  const height = videoElement.videoHeight || 480;

  canvasElement.setAttribute("width", width);
  canvasElement.setAttribute("height", height);

  context.drawImage(videoElement, 0, 0);

  const imageData = context.getImageData(0, 0, width, height);
  const filteredImageData = filterImage(wam.memory, wam._grayscale, imageData);

  context.putImageData(filteredImageData, 0, 0);
};

const drawVideoToCanvas = async (videoElement, canvasElement) => {
  const wam = await loadWasm();

  return videoElement.addEventListener("play", () => {
    const draw = () => {
      if (videoElement.paused) return false;

      filterVideo(videoElement, canvasElement, wam);
      requestAnimationFrame(draw);
    };

    draw();
  });
};

const main = _document => {
  const videoElement = _document.createElement("video");
  const canvasElement = _document.querySelector("canvas");

  drawVideoToCanvas(videoElement, canvasElement);

  const toggleVideo = () => toggleWebcam(videoElement);

  return { toggleVideo };
};

const { toggleVideo } = main(document);
