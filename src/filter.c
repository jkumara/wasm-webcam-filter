#include <inttypes.h>

extern void grayscale(uint8_t* pixel_data, int image_width, int image_height);

void grayscale(uint8_t* pixel_data, int image_width, int image_height) {
  int bit_amount = image_width * image_height * 4;

  for (int i = 0; i < bit_amount; i = i + 4) {
    uint8_t r = pixel_data[i];
    pixel_data[i + 1] = r;
    pixel_data[i + 2] = r;
  }
}