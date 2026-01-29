// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Link, useFetcher } from "react-router";
import { Tag } from "~/components/common/Tag";
import { Plus } from "~/components/icons/plus";
import { TbDots } from "react-icons/tb";
import { FaLink, FaRegTrashCan } from "react-icons/fa6";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Spinner } from "~/components/common/Spinner";
import { useClickOutside } from "~/utils/hooks/useClickOutside";
import { ConfirmModal } from "~/components/common/ConfirmModal";
import { twMerge } from "tailwind-merge";
import { useCopyLink } from "~/components/hooks/useCopyLink";
import { Image } from "~/components/common/Image";
import type { Service } from "@prisma/client";

export const ServiceCard = ({
  service,
  title,
  image,
  duration,
  price,
  link,
  path,
  id,
  isActive,
}: {
  service: Service;
  isActive: boolean;
  id: string;
  title: string;
  image?: string;
  duration: number;
  price: string;
  status: string;
  link: string;
  path: string;
}) => {
  // lets try with an api endpoint...
  const fetcher = useFetcher<typeof action>();
  const [show, setShow] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const ref = useClickOutside<HTMLDivElement>({
    onOutsideClick: () => {
      setShow(false);
    },
    isActive: show,
    includeEscape: true, // captures [Esc] key press
  });

  const { ref: copiadoRef, setLink } = useCopyLink(link);

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
    setShow(false);
    setShowDelete(true);
  };

  const handleDeleteConfirm = () => {
    setShowDelete(false);
    fetcher.submit(
      {
        intent: "update_service",
        data: JSON.stringify({ id, archived: true }),
      },
      { method: "post" }
    );
  };

  const handleCopyLink = () => {
    setLink();
    setShow(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="relative group shadow hover:shadow-lg rounded-xl transition-all"
    >
      <button
        onClick={() => {
          setShow((s) => !s);
        }}
        type="button"
        className={twMerge(
          "transition-all absolute top-3 right-3 py-2 px-2 text-3xl rounded-full  bg-transparent z-10 text-transparent active:scale-95 focus:text-white focus:bg-gray-400/70",
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
            className="z-10 bg-white absolute shadow-lg text-brand_gray rounded-3xl top-16 right-4 w-[60%] px-4 py-3 flex flex-col gap-5"
          >
            <button
              onClick={handleCopyLink}
              ref={copiadoRef}
              className="transition-all gap-3 items-center flex text-brand_blue/80 hover:text-brand_blue active:scale-95"
            >
              <span className="text-md">
                <FaLink />
              </span>
              <span className="capitalize">copiar link</span>
            </button>

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

      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Seguro que quieres eliminar este servicio? 🫣"
        description="Al eliminarlo también eliminaremos todas las citas agendadas del servicio. Enviaremos una notificación a cada client@."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <Link to={path ? path : "/dash/servicios"} className="group ">
        <section className="bg-white h-full rounded-2xl overflow-hidden hover:scale-105 transition-all cursor-pointer flex flex-col">
          <Image alt="service" src={image} />
          <div className="my-2 px-3 flex flex-col  justify-between">
            <h3 className=" text-brand_dark text-lg font-satoMiddle">
              {service.name}
            </h3>
            <article className="flex items-end justify-between pt-auto pb-1">
              <p className="text-brand_gray font-satoshi mt-1">
                {duration} min
                <span className="mx-1">·</span>${price}
              </p>

              {isActive ? (
                <Tag />
              ) : (
                <Tag className="bg-brand_light_gray text-brand_gray text-sm">
                  Inactivo
                </Tag>
              )}
            </article>
          </div>
        </section>
      </Link>
    </motion.section>
  );
};

export const AddService = () => {
  const fetcher = useFetcher();
  return (
    <Link to="/dash/servicios/nuevo">
      <button
        className="group min-h-[200px]  h-full  bg-transparent  rounded-2xl border-[1px] border-brand_gray  border-dashed w-full flex justify-center items-center text-center"
      >
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
