import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { FaLinkedin } from "react-icons/fa";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@remix-run/react";

const pics = [
  {
    src: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    name: "Mariana López",
    title: "Frontend Developer",
    text: " Las clases de English4profesionals son excepcionales. Katherine es muy amable y siempre se esfuerza por cé aquí. En el tiempo que llevo estudiando, he progresado más de lo que jamás imaginé. Recomiendo esta experiencia al 100%.",
    link: "http://denik.com",
  },
  {
    src: "https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    name: "Claarice López",
    title: "Frontend Developer",
    text: " Lasnglés tan eficazmente hasta que comencé aquí. En el tiempo que llevo estudiando, he progresado más de lo que jamás imaginé. Recomiendo esta experiencia al 100%.",
    link: "https://s3.amazonaws.com/cms.ipressroom.com/338/files/20212/604fb6afb3aed31a0790abdb_Getty+Latin+American+diet+/Getty+Latin+American+diet+_hero.jpg",
  },
  {
    src: "https://images.pexels.com/photos/1933873/pexels-photo-1933873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    name: "Lucia López",
    title: "Frontend Developer",
    text: " Las clasesmencé aquí. En el tiempo que llevo estudiando, he progresado más de lo que jamás imaginé. Recomiendo esta experiencia al 100%.",
    link: "https://static01.nyt.com/images/2023/10/10/multimedia/10Latinismo-04-bcmt/10Latinismo-04-bcmt-videoSixteenByNineJumbo1600.jpg",
  },
  {
    src: "https://images.pexels.com/photos/2072453/pexels-photo-2072453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    name: "Pedro Ortega",
    title: "Frontend Developer",
    text: "Las clases de English4profesionals son excepcionales. Katherine es muy amable y siempre se esfuerza poro que llevo estudiando, he progresado más de lo que jamás imaginé. Recomiendo esta experiencia al 100%.",
    link: "https://facts.net/wp-content/uploads/2024/03/10-facts-you-must-know-about-latin-dance-1709627687.jpg",
  },
  {
    src: "https://images.pexels.com/photos/4058316/pexels-photo-4058316.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    name: "Francisca López",
    title: "Frontend Developer",
    text: " Las clases de English4profesionals son excepcionales. Katherine es muy amable y siempre se esfuerza poexperiencia al 100%.",
    link: "https://www.studyspanishlatinamerica.com/blog/wp-content/uploads/2020/03/most-important-festivals-latin-america.jpg",
  },
  {
    src: "https://images.pexels.com/photos/3565370/pexels-photo-3565370.jpeg",
    name: "Petronila López",
    title: "Backend Developer",
    text: " estudiando, he progresado más de lo que jamás imaginé. Recomiendo esta experiencia al 100%.",
    link: "https://images.pexels.com/photos/3565370/pexels-photo-3565370.jpeg",
  },
];

export default function Page() {
  const [gallery, setGallery] = useState(pics);
  const saved = useRef<Pic | number>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    interval.current && clearInterval(interval.current);
    interval.current = setInterval(() => {
      //   handlePrev();
      handleNext();
    }, 3000);
    return () =>
      (interval.current && clearInterval(interval.current)) ?? undefined;
  }, [gallery]);

  const handleNext = () => {
    const cloned = [...gallery];
    if (saved.current) {
      cloned.unshift(saved.current);
    }
    saved.current = cloned.pop();
    setGallery(cloned);
  };

  const handlePrev = () => {
    const cloned = [...gallery];
    saved.current && cloned.push(saved.current);
    saved.current = cloned.shift();
    setGallery(cloned);
  };

  const handlePicClick = (index: number) => {
    const cloned = [...gallery];
    cloned.splice(cloned.length - 2, 0, cloned.splice(index, 1)[0]);
    setGallery(cloned);
  };

  return (
    <article className="bg-slate-100 h-full grid place-content-center h-screen">
      <h1 className="text-2xl font-bold py-8 text-center">
        Qué opinan nuestros estudiantes
      </h1>

      <main className="bg-white block box-content">
        <article className="flex justify-center items-center h-[40vh]">
          <ul className="flex gap-2 justify-end w-[60%] items-end h-full translate-x-[117px] z-10 relative">
            {gallery.map((pic, i) => {
              const isLast = i === gallery.length - 2;
              return (
                <Image
                  link={pic.link}
                  src={pic.src}
                  key={pic.src}
                  //   isLast={i === activeIndex}
                  isLast={isLast}
                  onClick={() => handlePicClick(i)}
                />
              );
            })}
          </ul>

          <section className="w-[40%] pl-8 pr-4 h-full relative z-20 bg-white">
            <motion.div
              transition={{ type: "spring", duration: 0.5 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              //   exit={{ opacity: 0, scale: 0.8 }}
              key={gallery[gallery.length - 1].src}
              className="absolute inset-0 flex flex-col px-8 justify-center box-border"
            >
              <h2 className="font-bold text-sm">
                {" "}
                {gallery[gallery.length - 1].name}
              </h2>
              <p className="font-thin text-xs mb-6">
                {" "}
                {gallery[gallery.length - 1].title}
              </p>
              <strong className="text-5xl">"</strong>
              <p className="text-xs pr-8 text-center">
                {gallery[gallery.length - 1].text}
              </p>
              <br />
              <strong className="text-5xl block text-right pr-12">" </strong>
            </motion.div>
          </section>
        </article>
        <section className="flex justify-center items-center gap-12 my-2 relative z-10">
          <button
            onClick={handlePrev}
            className="hover:scale-105 active:scale-100 rounded-full h-12 w-12 box-border bg-gray-200 grid place-content-center text-gray-800 transition-all"
          >
            <FaArrowLeft />
          </button>
          <button
            onClick={handleNext}
            className="hover:scale-105 active:scale-100 rounded-full h-12 w-12 box-border bg-gray-200 grid place-content-center text-gray-800 transition-all"
          >
            <FaArrowRight />
          </button>
        </section>
      </main>
    </article>
  );
}

const Image = ({
  onClick,
  isLast,
  link,
  src,
  className,
}: {
  index?: string | number;
  onClick?: () => void;
  isLast?: boolean;
  link?: string;
  className?: string;
  src: string;
}) => {
  return (
    <motion.button
      key={link}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ scale: 1, opacity: 1, x: 0 }}
      //   exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", bounce: 0.3 }}
      onClick={onClick}
      className={twMerge(
        "relative h-44 min-w-28 rounded-lg overflow-hidden",
        isLast && "h-[95%] min-w-40",
        className
      )}
      //   style={{ originY: "bottom" }}
      whileHover={{ scaleY: 1.03, top: -2 }}
    >
      <img
        className={twMerge(
          "w-full h-full object-cover object-center",
          isLast && "object-center"
        )}
        src={src}
        alt="gallery pic"
      />
      {isLast && (
        <Link
          to=""
          className="absolute bottom-0 right-2 text-4xl bg-white py-3 px-2 hover:scale-105 transition-all active:scale-100"
          style={{ borderTopRightRadius: 9, borderTopLeftRadius: 9 }}
        >
          <FaLinkedin />
        </Link>
      )}
    </motion.button>
  );
};
