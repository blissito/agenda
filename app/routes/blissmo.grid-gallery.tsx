import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";

export default function Page() {
  return (
    <>
      <GridGallery
        images={[
          "https://images.pexels.com/photos/889545/pexels-photo-889545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/903171/pexels-photo-903171.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/34514/spot-runs-start-la.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          "https://images.pexels.com/photos/591646/cow-moooh-meadow-black-591646.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        ]}
      />
    </>
  );
}

const GridGallery = ({ images }: { images: string[] }) => {
  const [selected, set] = useState<null | number>(null);
  const [cache, setCache] = useState<null | number>(null);
  const handleClose = async () => set(null);
  const handleSelect = (index: number) => {
    setCache(index);
    set(index);
  };

  useEffect(() => {
    const handleKeyDown = ({ key }: KeyboardEvent) => {
      if (key === "Escape") {
        handleClose();
      }
    };
    addEventListener("keydown", handleKeyDown);
    return () => removeEventListener("keydown", handleKeyDown);
  }, []);

  console.log("CACHE: ", cache);
  console.log("Selected: ", selected);

  return (
    <article className="flex justify-center items-center h-screen bg-slate-950">
      <section className="grid grid-cols-3 grid-rows-2 gap-2 w-full h-full p-44">
        <Image
          isSelected={selected === 0}
          onClose={handleClose}
          onClick={() => handleSelect(0)}
          className={twMerge("col-span-2")}
          imageClassName={cache === 0 ? "z-20 relative" : undefined}
          src={images[0]}
        />
        <Image
          isSelected={selected === 1}
          src={images[1]}
          onClose={handleClose}
          onClick={() => handleSelect(1)}
          imageClassName={cache === 1 ? "z-20 relative" : undefined}
        />
        <Image
          src={images[2]}
          isSelected={selected === 2}
          onClose={handleClose}
          onClick={() => handleSelect(2)}
          imageClassName={cache === 2 ? "z-20 relative" : undefined}
        />
        <Image
          isSelected={selected === 3}
          onClose={handleClose}
          onClick={() => handleSelect(3)}
          className="col-span-2"
          src={images[3]}
          imageClassName={cache === 3 ? "z-20 relative" : undefined}
        />
      </section>
    </article>
  );
};

const Image = ({
  isSelected,
  src,
  className,
  onClose,
  onClick,
  imageClassName,
}: {
  onClick?: () => void;
  onClose?: () => void;
  isSelected?: boolean;
  className?: string;
  imageClassName?: string;
  src: string;
}) => {
  return (
    <>
      <section className={twMerge("", className)}>
        <div className={twMerge("relative w-full h-full")}>
          {isSelected ? (
            createPortal(
              <>
                <button
                  onClick={onClose}
                  className="absolute inset-0 flex items-center bg-slate-950/80 transition-all px-[5%]"
                >
                  <motion.img
                    role="button"
                    onClick={(e) => e.stopPropagation()}
                    layoutId={src}
                    className={twMerge(
                      "rounded-xl object-cover relative",
                      "z-20"
                    )}
                    alt="gallery pic"
                    src={src}
                  />
                </button>
              </>,
              document.body
            )
          ) : (
            <motion.img
              role="button"
              onClick={onClick}
              layoutId={src}
              className={twMerge(
                "rounded-xl w-full h-full object-cover",
                "absolute inset-0",
                imageClassName
              )}
              alt="gallery pic"
              src={src}
            />
          )}
        </div>
      </section>
    </>
  );
};
