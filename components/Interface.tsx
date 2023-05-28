"use client";

import React, { useEffect } from "react";
import { MuiFileInput } from "mui-file-input";
import Image from "mui-image";

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

  const handleClick = async () => {
    if (!img) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);
    clearOutput();

    try {
      const outUrl = await worker(URL.createObjectURL(img), "jpg", false);
      setOut(outUrl);
      setOut2(await worker(outUrl, "jpg", true));
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
        />
      </div>
      <br />
      <div>
        <button onClick={loadExample("black.png")}>8x8 Black</button>{" "}
        <button onClick={loadExample("white.png")}>8x8 White</button>{" "}
        <button onClick={loadExample("earth.png")}>512x256 Colored</button>{" "}
        <button onClick={loadExample("soldiers.png")}>
          1024x1024 Grayscale
        </button>
      </div>
      {img ? (
        <>
          <br />
          <Image
            src={URL.createObjectURL(img)}
            alt="input preview"
            duration={0}
          />
          <br />
          <div>
            <button onClick={handleClick} disabled={loading}>
              Do Stuff
            </button>
          </div>
          {out ? (
            <>
              <p>Processed:</p>
              <Image src={out} alt="processed image" duration={0} />
            </>
          ) : null}
          {out2 ? (
            <>
              <p>Restored:</p>
              <Image src={out2} alt="restored image" duration={0} />
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default Interface;
