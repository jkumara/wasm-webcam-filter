import { drawVideoToCanvas } from "./canvas.mjs";
import { toggleWebcam } from "./webcam.mjs";
import { filterImage, filterImage2 } from "./image-filter.mjs";

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

const loadWasmManually = async () => {
  return await loadWasmModule("./dist/filter.wasm");
};

const loadWasmWithEmscripten = () => {
  window.Module = typeof window.Module !== "undefined" ? window.Module : {};
  return new Promise(resolve => {
    window.Module.onRuntimeInitialized = () =>
      resolve({
        memory: HEAPU8,
        wam: Module.asm
      });

    const script = document.createElement("script");
    script.src = "./dist/filter-emscripten.js";
    document.body.appendChild(script);
  });
};

const loadWasmAndFilterVideo = async (videoElement, canvasElement, wasmLoadStyle) => {
  if (wasmLoadStyle === LOAD_WASM_MANUALLY) {
    const wam = await loadWasmManually();
    const filter = filterImage(wam.memory, wam._grayscale);
    drawVideoToCanvas(videoElement, canvasElement, filter);
  }

  if (wasmLoadStyle === LOAD_WASM_WITH_EMSCRIPTEN) {
    const { memory, wam } = await loadWasmWithEmscripten();
    const filter = filterImage2(memory, wam._grayscale);
    drawVideoToCanvas(videoElement, canvasElement, filter);
  }
};

const main = _document => {
  const videoElement = _document.createElement("video");
  const canvasElement = _document.querySelector("canvas");

  loadWasmAndFilterVideo(videoElement, canvasElement, LOAD_WASM_MANUALLY);

  const toggleVideo = () => toggleWebcam(videoElement);

  return { toggleVideo };
};

const LOAD_WASM_WITH_EMSCRIPTEN = 'LOAD_WASM_WITH_EMSCRIPTEN';
const LOAD_WASM_MANUALLY = 'LOAD_WASM_MANUALLY';

const { toggleVideo } = main(document);

// Expose function to be used in the view
window.toggleVideo = toggleVideo;
