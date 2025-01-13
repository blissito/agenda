import { Link } from "react-router";
import React, { type ReactNode, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

import { motion } from "framer-motion";
import { cn } from "~/utils/cn";

export const DialogButton = ({
  className,
  children,
  isDisabled,
  isLoading,
  as,
  to = "",
  onClick,
  ...props
}: {
  onClick?: () => void;
  as?: "Link";
  to?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
  className?: string;
  children: ReactNode;
  [x: string]: any;
}) => {
  const Element = as === "Link" ? Link : "button";
  const [isOpen, setOpen] = useState(false);
  const ref = useRef();

  const openModal = () => {
    setOpen(true);
    // const modal = document.createElement("div");
    document.body.appendChild(ref.current);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const jsx = (
    <div
      ref={ref}
      className={cn(
        "fixed z-50  inset-0 top-0 flex items-center justify-center",
        {
          visible: isOpen,
          invisible: !isOpen,
        }
      )}
    >
      <motion.div
        initial={{ backdropFilter: "blur(0px)", opacity: 1 }}
        animate={{ backdropFilter: "blur(12px)", opacity: 1 }}
        exit={{ backdropFilter: "blur(0px)", opacity: 1 }}
        transition={{ duration: 2 }}
        className="w-full  bg-brand_ash/50  absolute inset-0"
      ></motion.div>
      <div className="max-w-2xl bg-white dark:bg-dark overflow-hidden  z-40 rounded-3xl">
        <div className="flex ">
          <img
            className="w-[320px] h-[500px] object-cover hidden md:block"
            src="/banner.png"
          />
          <div className="pt-10 relative">
            <button onClick={closeModal}>
              <img
                className="absolute right-4 top-4 cursor-pointer w-10"
                src="/closeDark.png"
              />
            </button>
            <h3 className="text-2xl  leading-8 text-evil text-brand_dark font-bold ml-10 pr-10">
              {" "}
              Únete a la lista de espera
            </h3>
            <p className="text-lg text-iron dark:text-metal font-light leading-6 mt-4 ml-10 pr-10">
              Sé de los primeros en enterarte del lanzamiento de Deník, la mejor
              agenda para tu negocio.
            </p>
            <div className="ml-5 mt-6 mr-5 ">
              <iframe
                frameBorder="0"
                id="formmy-iframe"
                title="formmy"
                width="100%"
                height="260"
                src="https://formmy.app/embed/67771a4de7be8ee0389e7eb5"
                style={{ margin: "0 auto", display: "block" }}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Element
        onClick={onClick ? onClick : openModal}
        to={to}
        disabled={isDisabled}
        {...props}
        className={twMerge(
          "rounded-full hover:-translate-y-1 transition-all bg-fish text-base md:text-lg bg-brand_blue text-white h-12 md:h-12 px-6 flex gap-2 items-center justify-center font-light",
          "disabled:bg-slate-300 disabled:pointer-events-none",
          className
        )}
      >
        {!isLoading && children}
        {isLoading && (
          <div className="w-6 h-6 rounded-full animate-spin border-4 border-t-indigo-500" />
        )}
      </Element>
      {jsx}
    </>
  );
};
