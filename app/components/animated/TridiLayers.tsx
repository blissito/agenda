import { useAnimate } from "motion/react";
import { ReactNode, useEffect, useState } from "react";
import { cn } from "~/utils/cn";

const initial = { rotateZ: -50, rotateX: 50, rotateY: 10 };

export const TridiLayers = ({
  images = [],
  title,
}: {
  images?: string[];
  title?: ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(true);

  const handleMouse = (type: string) => () => {
    type === "enter" ? setIsHovered(true) : setIsHovered(false);
  };

  return (
    <section
      onMouseEnter={handleMouse("enter")}
      onMouseLeave={handleMouse("leave")}
      style={{
        transformStyle: "preserve-3d",
        perspective: 600,
      }}
      className="flex justify-center py-20 h-screen items-center overflow-hidden"
    >
      <LyingCard isActive={isHovered} type="left" src={images[0]} />
      <LyingCard isActive={isHovered} type="center" src={images[1]} />
      <LyingCard isActive={isHovered} type="right" src={images[2]} />
      <div className="pt-[400px] max-w-lg">
        {title}
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quo
          similique at fuga minima soluta fugit aspernatur numquam aliquam eum
          consequatur. Quis explicabo sit molestias placeat architecto corrupti?
          Earum, recusandae distinctio.
        </p>
      </div>
    </section>
  );
};

export const LyingCard = ({
  type = "center",
  src,
  className,
  isActive = false,
}: {
  isActive?: boolean;
  src: string;
  type?: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();

  const handleLeft = () => {
    isActive
      ? animate(scope.current, {
          rotateZ: 10,
          rotateX: 0,
          rotateY: 0,
          x: -200,
          y: 100,
        })
      : animate(scope.current, { ...initial, x: 0, y: 0 });
  };

  const handleRight = () => {
    isActive
      ? animate(scope.current, {
          rotateZ: -10,
          rotateX: 0,
          rotateY: 0,
          x: 200,
          y: 0,
        })
      : animate(scope.current, { ...initial, x: 0, y: 0 });
  };

  const handleCenter = () => {
    isActive
      ? animate(scope.current, {
          rotateZ: -5,
          rotateX: 0,
          rotateY: 0,
          x: 0,
          y: 0,
        })
      : animate(scope.current, { ...initial, x: 0, y: 0 });
  };

  useEffect(() => {
    animate(scope.current, initial);
    if (type === "left") {
      handleLeft();
    } else if (type === "right") {
      handleRight();
    } else {
      handleCenter();
    }
  }, [isActive]);

  return (
    <img
      ref={scope}
      style={{
        top: type === "left" ? 0 : type === "center" ? 50 : 100,
        zIndex: type === "left" ? 30 : type === "center" ? 20 : 10,
      }}
      className={cn(
        "object-cover w-[320px] h-[320px] border rounded-xl bg-white absolute shadow-md",

        className,
        {
          "shadow-xl": isActive,
        }
      )}
      src={src || "/public/images/star.svg"}
      alt="lying"
    />
  );
};
