import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { IoQrCodeOutline } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { Edit } from "~/components/icons/edit";
import type { Org } from "@prisma/client";
import { TemplateFormModal } from "~/components/ui/dialog";

export const Template = ({
  url,
  qr,
  org,
}: {
  org?: Org;
  qr: string;
  url: string;
}) => {
  const [pop, set] = useState(false);

  return (
    <section className="col-span-6 xl:col-span-2 ">
      <div className="bg-white rounded-2xl overflow-hidden sticky top-8">
        <div className="bg-schedule w-full h-20 flex items-center justify-center px-6 text-white text-xl font-satoMiddle">
          Tu agenda esta lista... ¡Compártela!
        </div>
        <div className="flex justify-between px-4 py-6 items-center ">
          <section className="flex flex-col mb-2 justify-between w-full">
            <div className="flex text-[20px] text-brand_gray justify-between">
              <p className="text-base text-brand_dark font-satoMiddle mr-10">
                Link de tu agenda en línea
              </p>
              <div className="flex gap-4 ">
                <TemplateFormModal
                  org={org}
                  trigger={<Edit className="hover:opacity-50 cursor-pointer" />}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(url);
                    set(true);
                    setTimeout(() => set(false), 1000);
                  }}
                >
                  <FiCopy className="hover:opacity-50 cursor-pointer" />
                </button>

                <a
                  download="código_qr"
                  href={qr}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IoQrCodeOutline className="hover:opacity-50 cursor-pointer" />
                </a>
              </div>
              <p
                id="pop"
                className={twMerge(
                  "bg-brand_dark text-white text-xs min-w-fit p-2 rounded-lg absolute right-0 top-[15%]",
                  pop ? "block" : "hidden"
                )}
              >
                Copiado ✅
              </p>
            </div>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-brand_blue font-satoMiddle"
            >
              {url}
            </a>
          </section>
        </div>
        <hr className="bg-brand_stroke h-[1px] w-[94%] mx-auto border-none " />
        <div className="px-4 mt-4 pb-6">
          <p className="text-base text-brand_dark font-satoMiddle mb-3">
            Plantilla
          </p>
          <img
            className="w-full object-cover rounded-2xl"
            alt="template selected"
            src="https://i.imgur.com/Q7vLmZ0.png"
          />
        </div>
      </div>
    </section>
  );
};
