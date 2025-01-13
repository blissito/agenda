import { type ReactNode, useEffect } from "react";
import { useAnimate } from "motion/react";

export const BorderButton = ({
  children,
  duration = 3,
}: {
  duration?: number;
  children: ReactNode;
}) => {
  const [scope, animate] = useAnimate();

  const move = async () => {
    let { width, height } = scope.current.getBoundingClientRect();
    width -= 8;
    height -= 8;
    animate(
      "#point",
      {
        x: [0, width, width, 0, 0], // @keyframes
        y: [0, 0, height, height, 0], // @keyframes
      },
      {
        duration,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.4, 0.5, 0.9, 1], // repartición del tiempo
      }
    );
    animate(
      "#point2",
      {
        x: [0, width, width, 0, 0], // @keyframes
        y: [0, 0, height, height, 0], // @keyframes
      },
      {
        duration,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.4, 0.5, 0.9, 1], // repartición del tiempo
        delay: 2.5,
      }
    );
  };

  useEffect(() => {
    move();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      ref={scope}
      className="p-1 relative bg-gray-900 rounded-xl overflow-hidden hover:scale-105 transition-all px-4 py-2 font-bold text-xl w-max"
    >
      <p className="text-white relative z-10">{children}</p>
      <div
        id="point"
        className="w-4 h-4 bg-gradient-to-bl from-blue-500 via-indigo-500 to-transparent absolute left-0 top-0 rounded-full blur-sm"
      />
      <div
        id="point2"
        className="w-4 h-4 bg-gradient-to-bl from-yellow-500 via-orange-500 to-transparent absolute left-0 top-0 rounded-full blur-sm"
      />
      <div className="bg-gray-900 inset-1 rounded-lg absolute" />
    </button>
  );
};
