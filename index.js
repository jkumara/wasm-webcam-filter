import { drawVideoToCanvas } from "./canvas.mjs";
import { toggleWebcam } from "./webcam.js";

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

var Module = typeof Module !== "undefined" ? Module : {};

const loadWasm2 = () => {
  return new Promise(resolve => {
    Module.onRuntimeInitialized = () =>
      resolve({
        memory: HEAPU8,
        wam: Module.asm
      });

    const script = document.createElement("script");
    script.src = "./dist/filter-emscripten.js";
    document.body.appendChild(script);
  });
};

const loadWasm = async () => {
  return await loadWasmModule("./dist/filter.wasm");
};

const main = _document => {
  const videoElement = _document.createElement("video");
  const canvasElement = _document.querySelector("canvas");

  loadWasm().then(wam => {
    drawVideoToCanvas(videoElement, canvasElement, wam.memory, wam._grayscale);
  });

  // loadWasm2().then(({ memory, wam }) => {
  //   drawVideoToCanvas(videoElement, canvasElement, memory, wam._grayscale);
  // });

  const toggleVideo = () => toggleWebcam(videoElement);

  return { toggleVideo };
};

const { toggleVideo } = main(document);

window.toggleVideo = toggleVideo;
