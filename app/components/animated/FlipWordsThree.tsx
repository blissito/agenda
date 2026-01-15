// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Children, type ReactNode, useEffect, useState } from "react";
import { stagger, useAnimate, useSpring } from "motion/react";
import { nanoid } from "nanoid";

//@TODO: STILL A WIP, HOW TO STAGGER PAIR LETTERS ??

export const FlipWordsThree = ({
  delay = 0.03,
  children,
}: {
  delay?: number;
  children: ReactNode;
}) => {
  const wordNode = Children.toArray(children)[0] as ReactNode;
  const [letters, setLetters] = useState<string[]>(
    wordNode.props?.children.split("")
  );

  const rotateX = useSpring(0, { bounce: 0 });
  const y = useSpring(0, { bounce: 0 });

  const handleEnter = () => {
    rotateX.set(-90);
    y.set(24);
  };
  const handleLeave = () => {
    rotateX.set(0);
    y.set(0);
  };

  //   useEffect(() => {
  //     replaceNodes();
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  return <BoxLetters letters={letters} />;
};

export const BoxLetters = ({
  children,
  letters,
}: {
  children?: ReactNode;
  letters: string[];
}) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnter = () => {
    animate("li", { y: "50%" }, { delay: stagger(0.1) });
  };

  return (
    <ul
      ref={scope}
      className="flex gap-px"
      style={{
        perspective: 800,
        transformStyle: "preserve-3d",
      }}
    >
      {letters.map((letter, i) => (
        <section key={i}>
          {" "}
          <li key={nanoid()} onMouseEnter={handleEnter}>
            <div className="flex flex-col h-12 w-min overflow-hidden">
              <span key={nanoid()}> {letter}</span>
              <span key={nanoid()}> {letter}</span>
            </div>
          </li>
        </section>
      ))}
    </ul>
  );
};
