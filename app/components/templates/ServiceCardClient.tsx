// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { motion } from "motion/react";
import { Link } from "react-router";
import { useCallback } from "react";
import { Tag } from "~/components/common/Tag";
import { getServicePublicUrl } from "~/utils/urls";

export const ServiceCardClient = ({
  title,
  image,
  duration,
  price,
  link = "",
  serviceSlug,
  slug,
}: {
  slug: string;
  title: string;
  image?: string;
  duration: number;
  price: string;
  link?: string;
  serviceSlug?: string;
}) => {
  const getLink = useCallback(
    (serviceSlug: string) => getServicePublicUrl(slug, serviceSlug),
    [slug]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="relative group"
    >
      <Link to={link} className="group ">
        <section className="bg-white border-[1px] border-[#EFEFEF] rounded-2xl overflow-hidden hover:scale-95 transition-all cursor-pointer">
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
                {duration} min
                <span className="mx-1">·</span>${price} mxn
              </p>
            </article>
            <Link to={getLink(serviceSlug)}>
              <Tag className="bg-brand_dark rounded-full h-8 text-white text-xs">
                Agendar
              </Tag>
            </Link>
          </div>
        </section>
      </Link>
    </motion.section>
  );
};
