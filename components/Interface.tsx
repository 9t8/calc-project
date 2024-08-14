"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { MuiFileInput } from "mui-file-input";

import worker from "@/lib/worker";

export default function Interface() {
  const [img, setImg] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [out, setOut] = React.useState("");
  const [out2, setOut2] = React.useState("");

  const clearOutput = () => {
    setOut("");
    setOut2("");
  };

  useEffect(clearOutput, [img]);

  const loadExample = (src: string) => async () =>
    setImg(new File([await (await fetch(src)).blob()], src));

  const handleClick = (method: "row" | "jpg") => async () => {
    if (!img) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    clearOutput();

    try {
      const arr = await worker(
        new Uint8Array(await img.arrayBuffer()),
        method,
        false
      );

      setOut(URL.createObjectURL(new Blob([arr])));

      const arr2 = await worker(arr, method, true);

      setOut2(URL.createObjectURL(new Blob([arr2])));
    } catch (e) {
      alert(e);
    }

    setLoading(false);
  };

  return (
    <>
      <div>
        <button onClick={loadExample("black.png")} disabled={loading}>
          8x8 Black
        </button>{" "}
        <button onClick={loadExample("white.png")} disabled={loading}>
          8x8 White
        </button>{" "}
        <button onClick={loadExample("earth.png")} disabled={loading}>
          512x256 Color
        </button>{" "}
        <button onClick={loadExample("soldiers.png")} disabled={loading}>
          1024x1024 Grayscale
        </button>
      </div>
      <br />
      <div>
        <MuiFileInput
          value={img}
          onChange={setImg}
          placeholder="Select a file or choose an example."
          disabled={loading}
        />
      </div>
      {img && (
        <>
          <br />
          <Image
            src={URL.createObjectURL(img)}
            alt="input preview"
            width={0}
            height={0}
            style={{ width: "100%", height: "auto" }}
          />
          <div>
            <button onClick={handleClick("jpg")} disabled={loading}>
              2D JPG-Style Transform
            </button>{" "}
            <button onClick={handleClick("row")} disabled={loading}>
              1D Row-by-Row Transform (Slow)
            </button>
          </div>
          <p>This webpage may freeze.</p>
          {out && (
            <>
              <p>Transformed:</p>
              <Image
                src={out}
                alt="transformed"
                width={0}
                height={0}
                style={{ width: "100%", height: "auto" }}
              />
            </>
          )}
          {out2 && (
            <>
              <p>Restored:</p>
              <Image
                src={out2}
                alt="restored"
                width={0}
                height={0}
                style={{ width: "100%", height: "auto" }}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
