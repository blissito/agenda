import { Link, useFetcher } from "@remix-run/react";
import { Tag } from "~/components/common/Tag";
import { Plus } from "~/components/icons/plus";
import { TbDots } from "react-icons/tb";
import { FaRegTrashCan } from "react-icons/fa6";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { action } from "~/routes/dash_.servicios_.nuevo";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "~/components/common/Spinner";
import { useClickOutside } from "~/utils/hooks/useClickOutside";
import { twMerge } from "tailwind-merge";

export const ServiceCard = ({
  title,
  image,
  duration,
  price,
  link,
  id,
  isActive,
}: {
  isActive: boolean;
  id: string;
  title: string;
  image?: string;
  duration: number;
  price: string;
  status: string;
  link?: string;
}) => {
  // lets try with an api endpoint...
  const fetcher = useFetcher<typeof action>();
  const [show, setShow] = useState(false);
  const ref = useClickOutside<HTMLDivElement>({
    onOutsideClick: () => {
      setShow(false);
    },
    isActive: show,
    includeEscape: true, // captures [Esc] key press
  });

  const handleToggleDeactivation = () => {
    fetcher.submit(
      {
        intent: "api_update_service",
        data: JSON.stringify({ serviceId: id, isActive: !isActive }),
      },
      { method: "post", action: "/dash/servicios/nuevo" }
    );
  };

  const handleDelete = () => {
    if (
      !confirm(
        "¿Estás segura de eliminar este servicio? Esta acción es irreversible. ⚠️"
      )
    ) {
      setShow(false);
      return;
    }
    fetcher.submit(
      {
        intent: "api_update_service",
        data: JSON.stringify({ serviceId: id, archived: true }),
      },
      { method: "post", action: "/dash/servicios/nuevo" }
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="relative group"
    >
      <button
        onClick={() => {
          setShow((s) => !s);
        }}
        type="button"
        className={twMerge(
          "transition-all absolute top-3 right-3 py-2 px-2 text-3xl rounded-full  bg-transparent z-10 text-transparent active:scale-95 hover:shadow focus:text-white focus:bg-gray-400/70",
          "opacity-1 group-hover:bg-gray-400/70 group-hover:text-white",
          show && "text-white bg-gray-400/70 "
        )}
      >
        <TbDots />
      </button>
      <AnimatePresence>
        {show && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="z-10 absolute bg-white shadow-lg text-brand_gray rounded-3xl top-16 right-4 w-[60%] px-4 py-3 flex flex-col gap-5"
          >
            <button
              onClick={handleDelete}
              className="transition-all gap-3 items-center flex text-red-700 hover:text-red-600 active:scale-95"
            >
              <span className="text-md">
                <FaRegTrashCan />
              </span>
              <span className="capitalize">eliminar</span>
            </button>
            <button
              onClick={handleToggleDeactivation}
              className="transition-all flex gap-3 items-center hover:text-brand_gray/80 active:scale-95"
            >
              {fetcher.state === "idle" ? (
                <>
                  <span className="text-md">
                    {isActive ? <FiToggleLeft /> : <FiToggleRight />}
                  </span>
                  <span className="capitalize">
                    {isActive ? "desactivar" : "activar"}
                  </span>
                </>
              ) : (
                <>
                  <Spinner className="scale-[20%]" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <Link to={link ? link : "/dash/servicios"} className="group ">
        <section className="bg-white rounded-2xl overflow-hidden hover:animate-movement-effect cursor-pointer">
          <img
            alt="cover"
            className="w-full h-[160px] object-cover"
            src={image ? image : "/images/serviceDefault.png"}
          />
          <div className="p-4 flex justify-between items-center">
            <article>
              <h3 className=" text-brand_dark text-lg font-satoMiddle">
                {title}
              </h3>
              <p className="text-brand_gray font-satoshi mt-1">
                {duration}
                <span className="mx-1">·</span>${price}
              </p>
            </article>
            {isActive ? (
              <Tag />
            ) : (
              <Tag className="bg-brand_light_gray text-brand_gray text-xs">
                Desactivado
              </Tag>
            )}
          </div>
        </section>
      </Link>
    </motion.section>
  );
};

export const AddService = () => {
  return (
    <Link to="/dash/servicios/nuevo">
      <button className="group h-full  bg-transparent  rounded-2xl border-[1px] border-brand_gray  border-dashed w-full flex justify-center items-center text-center ">
        <div>
          <Plus className="mx-auto group-hover:scale-125 transition-all" />
          <p className="font-satoshi text-brand_gray mt-4 group-hover:scale-110 transition-all">
            Agrega un nuevo servicio
          </p>
        </div>
      </button>
    </Link>
  );
};
