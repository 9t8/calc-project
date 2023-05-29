import type { NdArray } from "ndarray";

export const clamp = (n: number) => Math.max(0, Math.min(n, 255));

export const verifyImg = (img: NdArray) => {
  if (img.dimension !== 3) {
    throw Error("Image must have 3 dimensions (not be animated).");
  }

  if (img.shape[2]! < 3) {
    throw Error("Image must have at least 3 channels.");
  }
};

export const rgbToYcc = (img: NdArray) => {
  verifyImg(img);

  for (let x = 0; x < img.shape[0]!; ++x) {
    for (let y = 0; y < img.shape[1]!; ++y) {
      const R = img.get(x, y, 0);
      const G = img.get(x, y, 1);
      const B = img.get(x, y, 2);
      img.set(x, y, 0, clamp(0.299 * R + 0.587 * G + 0.114 * B));
      img.set(x, y, 1, clamp(-0.1687 * R - 0.3313 * G + 0.5 * B + 128));
      img.set(x, y, 2, clamp(0.5 * R - 0.4187 * G - 0.0813 * B + 128));

      // remove transparency since it fucks everything up somehow
      if (img.shape[2] === 4) {
        img.set(x, y, 3, 255);
      }
    }
  }
};

export const yccToRgb = (img: NdArray) => {
  verifyImg(img);

  for (let x = 0; x < img.shape[0]!; ++x) {
    for (let y = 0; y < img.shape[1]!; ++y) {
      const Y = img.get(x, y, 0);
      const Cb = img.get(x, y, 1);
      const Cr = img.get(x, y, 2);
      img.set(x, y, 0, clamp(Y + 1.402 * (Cr - 128)));
      img.set(x, y, 1, clamp(Y - 0.34414 * (Cb - 128) - 0.71414 * (Cr - 128)));
      img.set(x, y, 2, clamp(Y + 1.772 * (Cb - 128)));
    }
  }
};
