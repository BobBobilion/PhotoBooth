"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, ArrowUp } from "lucide-react";


export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [streaming, setStreaming] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [numPhotos, setNumPhotos] = useState(2);
  const [showPhotos, setShowPhotos] = useState(false);
  const [bgColor, setBgColor] = useState("#FFF7D1"); // Default light yellow
  const [showGoUp, setShowGoUp] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const photoStripRef = useRef<HTMLDivElement>(null);
  const [slideInPhoto, setSlideInPhoto] = useState(false);




  useEffect(() => {
    const onScroll = () => {
      setShowGoUp(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  


  useEffect(() => {
    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }
    startCamera();
  }, []);
  

  useEffect(() => {
    if (capturedImages.length === numPhotos) {
      combineImages(capturedImages, bgColor);
    }
  }, [bgColor, capturedImages]);
  
  useEffect(() => {
    if (finalImage && !showPhotos) {
      setSlideInPhoto(true);
    }
  }, [finalImage]);
  

  const startPhotoBooth = async () => {
    setShowPhotos(false); // hide photos
    const countdownDuration = 1; // seconds

    setIsCapturing(true);         // 🚫 disable buttons
    const newImages: string[] = [];
    setCapturedImages([]); // clear UI view
    setFinalImage(null);
  
    for (let i = countdownDuration; i >= 1; i--) {
      setCountdown(i);
      await new Promise((res) => setTimeout(res, 1000));
    }
    setCountdown(null);
  
    for (let i = 0; i < numPhotos; i++) {
      const dataUrl = await capturePhoto();
      newImages.push(dataUrl);
      if (i < numPhotos - 1) {
        for (let j = countdownDuration; j >= 1; j--) {
          setCountdown(j);
          await new Promise((res) => setTimeout(res, 1000));
        }
        setCountdown(null);
      }
    }
  
    setCapturedImages(newImages); // update UI
    setIsCapturing(false);
  };

  const capturePhoto = (): Promise<string> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return resolve("");
  
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");
  
      // Trigger flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 300); // quick flash
  
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
  
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
  
      const dataUrl = canvas.toDataURL("image/png");
      resolve(dataUrl);
    });
  };
  
  
  

  const combineImages = (images: string[], backgroundColor: string) => {
    const imgElements = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    Promise.all(
      imgElements.map(
        (img) =>
          new Promise<HTMLImageElement>((resolve) => {
            img.onload = () => resolve(img);
          })
      )
    ).then((loadedImgs) => {
      const padding = 20;
      const gap = 30;
      const borderRadius = 40;
      const width = loadedImgs[0].width;
      const height = loadedImgs[0].height;

      const canvasWidth = width + padding * 2;
      const canvasHeight = images.length * (height + gap) - gap + padding * 2;

      const stackedCanvas = document.createElement("canvas");
      stackedCanvas.width = canvasWidth;
      stackedCanvas.height = canvasHeight;

      const ctx = stackedCanvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      loadedImgs.forEach((img, i) => {
        const x = padding;
        const y = padding + i * (height + gap);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + borderRadius, y);
        ctx.lineTo(x + width - borderRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + borderRadius);
        ctx.lineTo(x + width, y + height - borderRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - borderRadius, y + height);
        ctx.lineTo(x + borderRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - borderRadius);
        ctx.lineTo(x, y + borderRadius);
        ctx.quadraticCurveTo(x, y, x + borderRadius, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, width, height);
        ctx.restore();
      });

      const combined = stackedCanvas.toDataURL("image/png");
      setFinalImage(combined);
    });
  };

  

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#3b556e] to-[#121a21] flex items-center justify-center px-4 py-10">
      

      <div className="max-w-2xl w-full bg-[#8fafcf] shadow-lg rounded-xl p-6 flex flex-col items-center gap-6 border border-[#3c4a5a]">
        <h1 className="text-4xl font-bold text-center text-gray-900">📸 Photobooth</h1>
        <div className="relative w-[600px] h-[600px] mx-auto bg-cover bg-center" style={{ backgroundImage: "url('/photobooth-bg.png')" }}>
          {/* Video feed inside the screen */}
          <video
            ref={videoRef}
            className="absolute top-[21.85%] left-[29.5%] w-[40%] h-[21%] rounded-md scale-x-[-1] object-cover"
            autoPlay
            muted
            playsInline
          />
          {flash && (
            <div className="absolute top-[21.85%] left-[29.5%] w-[40%] h-[21%] bg-white opacity-90 rounded-md animate-fade-out pointer-events-none" />
          )}

          {/* Countdown overlay (optional) */}
          {countdown !== null && (
            <div className="absolute top-[21.85%] left-[29.5%] w-[40%] h-[21%] flex items-center justify-center bg-black/20 rounded-md">
              <span className="text-white text-6xl font-bold">{countdown}</span>
            </div>
          )}

          {/* Insert Coin Button */}
          <div
          className="absolute bottom-[32.9%] right-[29.73%] flex flex-col items-center"
          style={{ width: "9.35%" }}
        >
          <span className="text-white text-s font-bold mb-1 animate-bounce">
          {isCapturing ? "" : "Click!"}
          </span>
          <div className="w-full aspect-square">
            <button
              onClick={startPhotoBooth}
              disabled={isCapturing}
              className={`w-full h-full rounded-full bg-yellow-400 shadow-lg border-2 border-yellow-600 transition-all duration-500
                ${isCapturing ? "opacity-20 cursor-not-allowed" : "animate-pulse"}
              `}
            />
          </div>
        </div>

      </div>
          
        <div className="flex flex-col items-center w-full gap-6">
          {/* Controls */}
          <div className="flex flex-col gap-4  max-w-sm text-gray-800">
            <label className="text-lg font-medium">
              Number of Photos:
              <input
                type="number"
                min={1}
                max={10}
                value={numPhotos}
                onChange={(e) => setNumPhotos(parseInt(e.target.value))}
                className={`ml-2 border rounded px-2 py-1 w-20 transition
                  ${isCapturing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
                `}
                disabled={isCapturing}
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-gray-800 font-medium">Background:</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "Yellow", color: "#FFF7D1" },
                  { name: "Pink", color: "#FEE2E2" },
                  { name: "Purple", color: "#EDE9FE" },
                  { name: "White", color: "#FFFFFF" },
                  { name: "Sky Blue", color: "#E0F2FE" },
                  { name: "Mint", color: "#D1FAE5" },
                  { name: "Peach", color: "#FFE5B4" },
                  { name: "black", color: "#000000" },
                ].map(({ name, color }) => (
                  <button
                    key={name}
                    onClick={() => setBgColor(color)}
                    disabled={isCapturing}
                    className={`w-8 h-8 rounded-full border-2 border-gray-400 transition
                      ${bgColor === color ? "ring-2 ring-offset-1 ring-gray-700" : ""}
                      ${isCapturing ? "opacity-50 cursor-not-allowed" : "hover:ring-2"}
                    `}
                    style={{ backgroundColor: color }}
                    title={name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div> 
        



  
        {/* Show photos toggle */}
        {capturedImages.length === numPhotos && (
          <button
            onClick={() => setShowPhotos((prev) => !prev)}
            className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded"
          >
            {showPhotos ? "Hide Photos" : "Show Photos"}
          </button>
        )}

{finalImage && !showPhotos && (
  <div // should expand height based on number of photos
    className={'absolute bottom-[6%] left-1/2 w-24 ${capturedImages.length * 18} overflow-hidden'}
    style={{ transform: "translateX(-50%)" }}
  >
    <div
      className={`w-full cursor-pointer ${slideInPhoto ? "slide-down-out" : ""}`}
      onClick={() => {
        photoStripRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowPhotos(true);
        setSlideInPhoto(false); // reset for next time
      }}
    >
      <img
        src={finalImage}
        alt="Photostrip"
        className="w-full h-auto rounded-md shadow-lg"
      />
    </div>
  </div>
)}





  
        {/* Final photostrip */}
        {finalImage && showPhotos && (
          <div ref={photoStripRef} className="text-center mt-6 w-full">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Your Photostrip</h2>
            <img
              src={finalImage}
              alt="Photostrip"
              className="mx-auto border-4 border-white shadow-lg rounded-lg bg-[#FFF7D1]"
            />
            

            <a
              href={finalImage}
              download="photostrip.png"
              className="mt-6 inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition duration-200"
            >
              <Download size={18} />
              Download Photostrip
            </a>

                      </div>
                    )}

            {showGoUp && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3 shadow-lg transition duration-200 z-50"
                title="Go to top"
              >
                <ArrowUp size={20} />
              </button>
            )}

  
        {/* Hidden canvas */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </main>
  );
}