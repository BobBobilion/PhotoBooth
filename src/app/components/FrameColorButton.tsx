import Image from "next/image";

interface FrameColorButtonProps {
  onSelect: (color: string) => void;
  color: string; // e.g. "#FF0000"
  image: string; // e.g. "/buttons/color-pink.png"
  selectedColor?: string; // currently selected color
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  scale?: string; // scale with parent
  title?: string;
}

export default function FrameColorButtons({
  onSelect,
  color,
  image,
  selectedColor,
  position = {},
  title = "",
  scale = "7%",
}: FrameColorButtonProps) {
  const isSelected = selectedColor === color;

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
        onClick={() => onSelect(color)}
        title={title}
        className="transition-transform duration-0 hover:scale-120 active:scale-100"
        style={{
          width: "100%",
          aspectRatio: "1",
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          border: "none",
          cursor: "pointer",
        }}
      />
      {isSelected && (
        <div className="relative w-full h-[5px] mt-1">
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
