"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { MuiFileInput } from "mui-file-input";

import worker from "@/lib/worker";

const Interface = () => {
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
      const outUrl = await worker(URL.createObjectURL(img), method, false);
      setOut(outUrl);
      setOut2(await worker(outUrl, method, true));
    } catch (e) {
      alert(e);
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <MuiFileInput
          value={img}
          onChange={setImg}
          placeholder="Select a file or choose an example."
          disabled={loading}
        />
      </div>
      <br />
      <div>
        <button onClick={loadExample("black.png")} disabled={loading}>
          8x8 Black
        </button>{" "}
        <button onClick={loadExample("white.png")} disabled={loading}>
          8x8 White
        </button>{" "}
        <button onClick={loadExample("earth.png")} disabled={loading}>
          512x256 Colored
        </button>{" "}
        <button onClick={loadExample("soldiers.png")} disabled={loading}>
          1024x1024 Grayscale
        </button>
      </div>
      {img ? (
        <>
          <br />
          <Image
            src={URL.createObjectURL(img)}
            alt="input preview"
            width={0}
            height={0}
            style={{ width: "100%", height: "auto" }}
          />
          <br />
          <div>
            <button onClick={handleClick("jpg")} disabled={loading}>
              2D JPG-Style Transform
            </button>{" "}
            <button onClick={handleClick("row")} disabled={loading}>
              1D Row-by-Row Transform (Slow!)
            </button>
          </div>
          {out ? (
            <>
              <p>Transformed:</p>
              <Image
                src={out}
                alt="transformed image"
                width={0}
                height={0}
                style={{ width: "100%", height: "auto" }}
              />
            </>
          ) : null}
          {out2 ? (
            <>
              <p>Restored:</p>
              <Image
                src={out2}
                alt="restored image"
                width={0}
                height={0}
                style={{ width: "100%", height: "auto" }}
              />
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default Interface;
