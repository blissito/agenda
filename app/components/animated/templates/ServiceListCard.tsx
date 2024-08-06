import { motion, useInstantTransition } from "framer-motion";
import { Link, useFetcher } from "@remix-run/react";
import { useClickOutside } from "~/utils/hooks/useClickOutside";
import { action } from "../../../routes/signup.$stepSlug";
import { useState } from "react";
import { Tag } from "~/components/common/Tag";

export const ServiceListCard = ({
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

  return (
    <motion.section
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="relative group"
    >
      <Link to={link ? link : "/dash/servicios"} className="group ">
        <section className="bg-white border-[1px] border-[#EFEFEF] flex items-center justify-between rounded-2xl overflow-hidden hover:scale-95 transition-all cursor-pointer">
          <div className="p-3 flex justify-between w-full items-center">
            <div className="flex items-center gap-3">
              <img
                alt="cover"
                className="w-12 h-12 rounded-lg object-cover"
                src={image ? image : "/images/serviceDefault.png"}
              />
              <article>
                <h3 className=" text-brand_dark text-lg font-satoMiddle">
                  {title}
                </h3>
                <p className="text-brand_gray font-satoshi mt-0 text-sm">
                  {duration} min
                  <span className="mx-1">·</span>${price} mxn
                </p>
              </article>
            </div>
            {isActive ? (
              <Tag />
            ) : (
              <Tag className="bg-brand_dark rounded-full h-8 text-white text-xs">
                Agendar
              </Tag>
            )}{" "}
          </div>
        </section>
      </Link>
    </motion.section>
  );
};
