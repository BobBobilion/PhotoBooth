import Image from "next/image";

interface LayoutOptionButtonProps {
  image: string;
  numPhotos: number;
  selected: number;
  onSelect: (photos: number) => void;
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  title?: string;
  scale?: string;
}

export default function LayoutOptionButton({
  image,
  numPhotos,
  selected,
  onSelect,
  position = {},
  title = "",
  scale = "7%",
}: LayoutOptionButtonProps) {
  let ratio = 1;
  if (numPhotos === 2) ratio = 575 / 880;
  else if (numPhotos === 3) ratio = 570 / 1200;
  else if (numPhotos === 4) ratio = 524 / 1470;

  let underlineDist = 70;
    if (numPhotos === 2) underlineDist = 80;
    else if (numPhotos === 3) underlineDist = 75;
    else if (numPhotos === 4) underlineDist = 70;

  let underline = selected === numPhotos;

  return (
    <div
      style={{
        position: "absolute",
        width: scale,
        ...position,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button
        onClick={() => onSelect(numPhotos)}
        title={title}
        className="transition-transform duration-100 hover:scale-110 active:scale-95"
        style={{
          width: "100%",
          aspectRatio: ratio,
          backgroundImage: `url(${image})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          border: "none",
          cursor: "pointer",
        }}
      />
      {underline && (
        <div className={`relative w-full h-[${underlineDist}px] mt-1`}>
          <Image
            src="/line.png"
            alt="Selected underline"
            fill
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}
