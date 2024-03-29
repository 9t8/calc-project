import type { NdArray } from "ndarray";
import { getPixels, savePixels } from "ndarray-pixels";

import { clamp, rgbToYcc, verifyImg, yccToRgb } from "@/lib/utils";

const C = (N: number) => (N === 0 ? Math.SQRT1_2 : 1);

const orthoDct = (inverse: boolean, row: NdArray) => {
  if (row.dimension !== 1) {
    throw RangeError("Row must be 1-dimensional.");
  }

  const N = row.shape[0]!;

  const range = Array.from(Array(N).keys());

  const x = range.map((i) => row.get(i) - 128);

  range.forEach((k) =>
    row.set(
      k,
      clamp(
        128 +
          (inverse
            ? range.reduce(
                (currSum, n) =>
                  currSum +
                  x[n]! *
                    C(n) *
                    Math.SQRT2 *
                    Math.cos((Math.PI / N) * (k + 0.5) * n),
                0
              )
            : range.reduce(
                (currSum, n) =>
                  currSum + x[n]! * Math.cos((Math.PI / N) * (n + 0.5) * k),
                0
              ) *
              ((C(k) * Math.SQRT2) / N))
      )
    )
  );
};

const F = (inverse: boolean, chunk: NdArray) => {
  if (chunk.dimension !== 2) {
    throw RangeError("Chunk must be 2-dimensional.");
  }

  if (chunk.shape[0] !== 8 || chunk.shape[1] !== 8) {
    throw RangeError("Chunk must be 8x8 elements.");
  }

  const range = Array.from(Array(8).keys());

  const f = range.map((x) => range.map((y) => chunk.get(x, y) - 128));

  range.forEach((u) =>
    range.forEach((v) =>
      chunk.set(
        u,
        v,
        clamp(
          128 +
            (inverse
              ? range.reduce(
                  (currSum, x) =>
                    currSum +
                    range.reduce(
                      (colSum, y) =>
                        colSum +
                        2 *
                          C(x) *
                          C(y) *
                          f[x]![y]! *
                          Math.cos(((u + 0.5) * x * Math.PI) / 8) *
                          Math.cos(((v + 0.5) * y * Math.PI) / 8),
                      0
                    ),
                  0
                )
              : range.reduce(
                  (currSum, x) =>
                    currSum +
                    range.reduce(
                      (colSum, y) =>
                        colSum +
                        f[x]![y]! *
                          Math.cos(((x + 0.5) * u * Math.PI) / 8) *
                          Math.cos(((y + 0.5) * v * Math.PI) / 8),
                      0
                    ),
                  0
                ) *
                ((C(u) * C(v)) / 32))
        )
      )
    )
  );
};

const processImg = (method: "row" | "jpg", inverse: boolean, img: NdArray) => {
  verifyImg(img);

  for (let channel = 0; channel < 3; ++channel) {
    const mono = img.pick(null, null, channel);

    if (method === "row") {
      for (let y = 0; y < img.shape[1]!; ++y) {
        orthoDct(inverse, mono.pick(null, y));
      }
    } else {
      if (img.shape[0]! % 8 !== 0 || img.shape[1]! % 8 !== 0) {
        throw RangeError("Image dimensions must be multiples of 8.");
      }

      for (let x = 0; x < img.shape[0]! / 8; ++x) {
        for (let y = 0; y < img.shape[1]! / 8; ++y) {
          F(inverse, mono.lo(x * 8, y * 8).hi(8, 8));
        }
      }
    }
  }
};

const worker = async (
  data: Uint8Array,
  method: "row" | "jpg",
  inverse: boolean
) => {
  // img: Uint8[x-coord][y-coord][RGBA]
  const img = await getPixels(data, "");
  if (!inverse) {
    rgbToYcc(img);
  }
  processImg(method, inverse, img);
  if (inverse) {
    yccToRgb(img);
  }
  return savePixels(img, "png");
};

export default worker;
