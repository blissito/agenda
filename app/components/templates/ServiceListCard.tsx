import { motion } from "motion/react";
import { Link } from "react-router";
import { Tag } from "~/components/common/Tag";

export const ServiceListCard = ({
  title,
  image,
  duration,
  price,
  link,
}: {
  title: string;
  image?: string | null;
  duration: number | bigint;
  price: number | bigint | string;
  link?: string;
}) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="relative group"
    >
      <Link to={link || "#"} className="group ">
        <section className="bg-white border-[1px] border-[#EFEFEF] flex items-center justify-between rounded-2xl overflow-hidden hover:scale-95 transition-all cursor-pointer">
          <div className="p-3 flex justify-between w-full items-center">
            <div className="flex items-center gap-3">
              <img
                alt="cover"
                className="w-16 h-12 rounded-lg object-cover"
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
            <Tag className="bg-brand_dark rounded-full h-8 text-white text-xs">
              Agendar
            </Tag>
          </div>
        </section>
      </Link>
    </motion.section>
  );
};
