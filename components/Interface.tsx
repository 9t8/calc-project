"use client";

import React, { useEffect } from "react";
import { MuiFileInput } from "mui-file-input";
import Image from "mui-image";
import { Avatar, Button } from "@mui/material";

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
      {img ? (
        <>
          <Image src={URL.createObjectURL(img)} duration={0} />
          <br />
          <div>
            <Button
              variant="contained"
              onClick={handleClick}
              disabled={loading}
            >
              Do Stuff
            </Button>
          </div>
          {out ? (
            <>
              <p>Processed:</p> <Image src={out} duration={0} />
            </>
          ) : null}
          {out2 ? (
            <>
              <p>Restored:</p> <Image src={out2} duration={0} />
            </>
          ) : null}
        </>
      ) : (
        <>
          <Button
            variant="contained"
            startIcon={<Avatar src="black.png" />}
            onClick={loadExample("black.png")}
          >
            8x8 Black
          </Button>{" "}
          <Button
            variant="contained"
            startIcon={<Avatar src="white.png" />}
            onClick={loadExample("white.png")}
          >
            8x8 White
          </Button>{" "}
          <Button
            variant="contained"
            startIcon={<Avatar src="earth.png" />}
            onClick={loadExample("earth.png")}
          >
            Medium Colored
          </Button>{" "}
          <Button
            variant="contained"
            startIcon={<Avatar src="soldiers.png" />}
            onClick={loadExample("soldiers.png")}
          >
            Large Grayscale
          </Button>
        </>
      )}
    </>
  );
};

export default Interface;
