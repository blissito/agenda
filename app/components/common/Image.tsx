import { useRef, useState, type ChangeEvent, type SyntheticEvent } from "react";
import { twMerge } from "tailwind-merge";

export const ImageInput = ({ src }: { src?: string }) => {
  const [imageSrc, setImageSrc] = useState(src);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    setImageSrc(URL.createObjectURL(file));
    // @todo upload image & update DB
  };
  return (
    <section>
      <button
        onClick={() => {
          inputRef.current?.click();
        }}
      >
        <Image className="h-[200px] w-[400px] rounded-2xl" src={imageSrc} />
      </button>
      <input
        onChange={handleFileChange}
        ref={inputRef}
        type="file"
        className="hidden"
        name="file"
      />
    </section>
  );
};

export const Image = ({
  src = "",
  className,
  alt = "illustration",

  ...props
}: {
  photoURL?: string;
  className?: string;
  src?: string;
  props?: unknown;
  alt?: string;
}) => {
  const defaultSrc = "/images/serviceDefault.png";
  return (
    <img
      alt={alt}
      {...props}
      className={twMerge("w-full h-full object-cover object-top", className)}
      src={src || defaultSrc}
      onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
        (e.target as HTMLInputElement).onerror = null; // previene el loop
        (e.target as HTMLInputElement).src = defaultSrc;
      }}
    />
  );
};
