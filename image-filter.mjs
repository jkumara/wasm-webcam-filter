// A WASM memory page has a constant size of 64 KiB
const MEMORY_PAGE_BYTES = 1024 * 64;

export const filterImage = (memory, grayscale, imageData) => {
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


/**
 * Applies a grayscale-filter to an image
 * @param {ImageData} imageData
 */
export const filterImage2 = (memory, grayscale, imageData) => {
  const {data: pixelData, height, width} = imageData;

  const memoryLocation = _malloc(pixelData.length);
  memory.set(pixelData, memoryLocation);
  grayscale(memoryLocation, width, height);
  const filteredPixelData = memory.subarray(memoryLocation, memoryLocation + pixelData.length);
  _free(memoryLocation);

  return new ImageData(new Uint8ClampedArray(filteredPixelData), width, height);
};