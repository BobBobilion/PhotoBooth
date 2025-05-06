"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, ArrowUp } from "lucide-react";
import Image from "next/image";
import FrameButton from "./components/FrameColorButton";
import LayoutOptionButton from "./components/LayoutOptionButton";


export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [streaming, setStreaming] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [numPhotos, setNumPhotos] = useState(4);
  const [showPhotos, setShowPhotos] = useState(false);
  const [bgColor, setBgColor] = useState("#ddffd6"); // Default light yellow
  const [showGoUp, setShowGoUp] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState(false);
  const photoStripRef = useRef<HTMLDivElement>(null);
  const [slideInPhoto, setSlideInPhoto] = useState(false);
  const showToggleRef = useRef<HTMLButtonElement | null>(null);
  const shutterAudio = useRef<HTMLAudioElement | null>(null);
  const beepAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    shutterAudio.current = new Audio("/shutter.mp3");
    beepAudio.current = new Audio("/beep.mp3");
  }, []);






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
    setShowPhotos(false); // hide previous photos
    const countdownDuration = 3; // seconds before photo
  
    setIsCapturing(true);
    const newImages: string[] = [];
    setCapturedImages([]);
    setFinalImage(null);
  
    for (let i = 0; i < numPhotos; i++) {
      for (let j = countdownDuration; j >= 0; j--) {
        setCountdown(j);
  
        // Capture photo + play shutter at countdown = 0
        if (j === 0) {
          shutterAudio.current?.play();
          const dataUrl = await capturePhoto();
          newImages.push(dataUrl);
        } else {
          beepAudio.current?.play();
        }
  
        await new Promise((res) => setTimeout(res, 1000));
      }
      setCountdown(null);
    }
  
    setCapturedImages(newImages);
    setIsCapturing(false);
  };
  

  const capturePhoto = (): Promise<string> => {
    shutterAudio.current?.play();
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
      const img = new window.Image(); // browser-safe
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
  

  const videoPosition = "absolute top-[21%] left-[26.5%] w-[47.5%] h-[43.65%]"

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#3b556e] to-[#121a21] flex items-center justify-center px-4 py-10">
      <div className="max-w-7xl w-full bg-[#8fafcf] shadow-lg rounded-xl p-6 flex flex-col items-center gap-6 border border-[#3c4a5a]">

        
        <div className="relative w-full max-w-[1000px] aspect-[1026/669] mx-auto bg-cover bg-center" style={{ backgroundImage: "url('/cropedBooth3.png')" }}>{/*"url('/cropedBooth.png')" }}>*/}
          {/* Video feed inside the screen */}
          <div className={`${videoPosition} relative`}>
            {/* Webcam Feed */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full rounded-md scale-x-[-1] object-cover"
              autoPlay
              muted
              playsInline
            />

            {/* Flash Overlay */}
            {flash && (
              <div className="absolute inset-0 bg-white opacity-90 rounded-md animate-fade-out pointer-events-none" />
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                <span className="text-white text-6xl font-bold">{countdown != 0 ? countdown : ""}</span>
              </div>
            )}
          </div>



          {/* Insert Coin Button */}
          <div
            className="absolute bottom-[56%] right-[9.8%] flex flex-col items-center pulse" 
            style={{ width: "7.8%" }}
          >
            {/* <span className="text-black text-sm font-semibold mb-1 animate-bounce bg-[#e8e8e8] border border-black px-2 py-0.5 rounded cursor-default">
              {isCapturing ? "" : "Push!"}
            </span> */}


            
<div className="w-full aspect-square relative">
  <button
    onClick={startPhotoBooth}
    disabled={isCapturing}
    className={`
      w-full h-full relative rounded-md overflow-hidden
      transition-transform duration-100
      ${isCapturing ? "opacity-50 cursor-not-allowed" : "hover:scale-115 active:scale-100"}
    `}
    style={{ border: "none", padding: 0 }}
  >
    <Image
      src="/takePictureButton.png"
      alt="Click!"
      fill
      className="object-contain pointer-events-none"
    />
  </button>
</div>


          </div>
          

          <FrameButton
            image="/colorButtons-Red.png"
            position={{ bottom: "14.3%", left: "43.32%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#febdbc"
            scale="3.95%"
          />
          <FrameButton
            image="/colorButtons-Orange.png"
            position={{ bottom: "14.5%", left: "48.9%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#feecdd"
            scale="3.8%"
          />
          <FrameButton
            image="/colorButtons-Yellow.png"
            position={{ bottom: "14.45%", left: "54.5%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#fef3cf"
            scale="3.8%"
          />
          <FrameButton
            image="/colorButtons-Green.png"
            position={{ bottom: "14.5%", left: "60.05%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#ddffd6"
            scale="3.75%"
          />

          <FrameButton
            image="/colorButtons-Blue.png"
            position={{ bottom: "5.8%", left: "43.32%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#d0e4fe"
            scale="3.8%"
          />
          <FrameButton
            image="/colorButtons-Purple.png"
            position={{ bottom: "5.9%", left: "48.9%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#efccff"
            scale="3.94%"
          />
          <FrameButton
            image="/colorButtons-Black.png"
            position={{ bottom: "6.1%", left: "54.4%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#202020"
            scale="3.75%"
          />
          <FrameButton
            image="/colorButtons-White.png"
            position={{ bottom: "5.95%", left: "60.2%" }}
            onSelect={setBgColor}
            selectedColor= {bgColor}
            color="#ffffff"
            scale="3.75%"
          />

          <LayoutOptionButton
            image="/frame1.png"
            numPhotos={2}
            selected={numPhotos}
            onSelect= {setNumPhotos}
            position={{ top: "77.4%", left: "7.6%" }}
            scale="4.4%"
          />
          <LayoutOptionButton
            image="/frame2.png"
            numPhotos={3}
            selected={numPhotos}
            onSelect= {setNumPhotos}
            position={{ top: "74.4%", left: "12.5%" }}
            scale="4.3%"
          />
          <LayoutOptionButton
            image="/frame3.png"
            numPhotos={4}
            selected={numPhotos}
            onSelect= {setNumPhotos}
            position={{ top: "71.4%", left: "18%" }}
            scale="4.1%"
          />
          
          
          {finalImage && !showPhotos && (
            <div // should expand height based on number of photos
              className={'absolute top-[89%] right-[7.25%] w-[8.5%] ${capturedImages.length * 18} overflow-hidden'}
              style={{ transform: "translateX(-50%)" }}
            >
              <div
                className={`w-full cursor-pointer ${slideInPhoto ? "slide-down-out" : ""}`}
                onClick={() => {
                  setShowPhotos(true);
                  setSlideInPhoto(false); // reset for next time

                  setTimeout(() => {
                    photoStripRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 50);

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

        </div>
          
        <div className="flex flex-col items-center w-[50%] gap-6">         

          {/* Show photos toggle */}
          {capturedImages.length === numPhotos && (
            <button
              ref={showToggleRef}
              onClick={() => setShowPhotos((prev) => !prev)}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded"
            >
              {showPhotos ? "Hide Photos" : "Show Photos"}
            </button>
          )}


          {/* Final photostrip */}
          {finalImage && showPhotos && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-gray-800 font-medium font-semibold">Background:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: "Pink", color: "#febdbc" },
                    { name: "Orange", color: "#feecdd" },
                    { name: "Yellow", color: "#fef3cf" },
                    { name: "Green", color: "#ddffd6" },
                    { name: "Sky Blue", color: "#d0e4fe" },
                    { name: "Lavender", color: "#efccff" },
                    { name: "Black", color: "#202020" },
                    { name: "White", color: "#ffffff" },
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
              <div ref={photoStripRef} className="text-center mt-6 w-full">
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">Your Photostrip</h2>
                <div className={`relative w-full max-w-xs mx-auto aspect-[1:${numPhotos * 0.75}]`}>
                  <img
                    src={finalImage}
                    alt="Photostrip"
                    className="object-contain rounded-lg shadow-lg bg-[#FFF7D1] hover:scale-103 transition-transform duration-200"
                  />
                </div>

                

                <a
                  href={finalImage}
                  download="photostrip.png"
                  className="mt-6 inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-5 rounded-full shadow-lg transition duration-200"
                >
                  <Download size={18} />
                  Download Photostrip
                </a>

              </div>
            </div>
          )}
        </div>


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