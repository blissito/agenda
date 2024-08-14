import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChangeEvent, ReactNode, SyntheticEvent, useState } from "react";
import { SecondaryButton } from "../common/secondaryButton";
import { PrimaryButton } from "../common/primaryButton";
import { twMerge } from "tailwind-merge";
import { Check } from "../icons/check";
import { BasicInput } from "../forms/BasicInput";

export default function Modal({ children }: { children: ReactNode }) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  const config = {
    border: "template2",
  };
  return (
    <>
      <Button onClick={open} className="">
        {children}
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-[rgba(211,211,211,.4)] backdrop-blur">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-4xl rounded-xl bg-white p-8 backdrop-blur-2xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <DialogTitle
                as="h3"
                className=" font-satoMiddle text-brand_dark text-2xl mb-8 "
              >
                Sitio web
              </DialogTitle>
              <div className="border-brand_ash h-12 w-full p-2 border-[1px] rounded-full flex items-center pl-3 gap-3">
                <span>denik.me/</span>
                <input
                  className={twMerge(
                    "placeholder-brand_iron text-brand_gray font-satoshi rounded-full border-none ",
                    "focus:border-brand_blue",
                    "h-8 w-full ",
                    "disabled:bg-brand_stroke disabled:cursor-not-allowed"
                  )}
                />
                <PrimaryButton className="bg-brand_dark h-[36px]">
                  Actualizar
                </PrimaryButton>
              </div>
              <hr className="bg-brand_stroke h-[1px] border-none my-6" />
              <h3 className="text-brand_dark mb-4">Plantilla</h3>
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => handleBorderChange("cuadrado")}
                  className="text-center relative rounded-2xl "
                >
                  {config.border === "template1" && <Palomita />}

                  <div
                    className={twMerge(
                      "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]",
                      config.border === "template1"
                        ? " ring-brand_blue rounded-2xl ring"
                        : null
                    )}
                  >
                    <img
                      className="rounded-2xl w-full object-cover "
                      src="/images/template1.svg"
                      alt="template1"
                    />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleBorderChange("cuadrado")}
                  className="text-center relative flex gap-6"
                >
                  {config.border === "template2" && <Palomita />}

                  <div
                    className={twMerge(
                      "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]",
                      config.border === "template2"
                        ? " ring-brand_blue rounded-md ring"
                        : null
                    )}
                  >
                    <img
                      className="rounded-2xl w-full object-cover "
                      src="/images/template2.svg"
                      alt="template1"
                    />
                  </div>
                </button>
              </div>
              <h3 className="text-brand_dark mb-4 mt-10">
                Color principal de tu sitio
              </h3>

              <label
                htmlFor="color"
                className=" text-xs text-brand_gray flex items-center justify-between relative"
              >
                <input
                  onClick={(e: SyntheticEvent<HTMLInputElement>) =>
                    e.currentTarget.select()
                  }
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    handleColorChange(e.currentTarget.value);
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {}}
                  placeholder="#000000"
                  className="placeholder:text-brand_ash focus:border-brand-blue bg-transparent  focus:ring-brand-blue focus:outline-none ring-transparent  active:ring-transparent pl-8 w-28 py-2 pr-2  border-brand_ash rounded-lg"
                  id="color"
                  type="text"
                />
                <ColorCube
                  style={{ backgroundColor: "#000000" }}
                  className="absolute top-3 left-2"
                />
              </label>
              <div className="flex flex-wrap gap-1 mt-2 ">
                <ColorCube
                  hexColor="#bb333c"
                  onClick={() => handleColorChange("#bb333c")}
                />
                <ColorCube
                  hexColor="#f79c08"
                  onClick={() => handleColorChange("#f79c08")}
                />
                <ColorCube
                  hexColor="#705fe0"
                  onClick={() => handleColorChange("#705fe0")}
                />
                <ColorCube
                  hexColor="#F6C056"
                  onClick={() => handleColorChange("#F6C056")}
                />
                <ColorCube
                  onClick={() => handleColorChange("#69A753")}
                  hexColor="#69A753"
                />
                <ColorCube
                  onClick={() => handleColorChange("#ae7098")}
                  hexColor="#ae7098"
                />
                <ColorCube
                  onClick={() => handleColorChange("#1C7AE9")}
                  hexColor="#1C7AE9"
                />
              </div>
              <div className="flex mt-16 justify-end gap-6">
                <SecondaryButton
                  as="Link"
                  to="/dash/website"
                  className="w-[120px]"
                  onClick={close}
                >
                  Cancelar
                </SecondaryButton>
                <PrimaryButton>Guardar</PrimaryButton>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export const Palomita = ({ className }: { className?: string }) => (
  <span
    className={twMerge(
      "absolute top-2 right-2 text-[8px] text-white w-5 h-5 flex justify-center items-center bg-brand_blue rounded-full ",
      className
    )}
  >
    &#10003;
  </span>
);

export const ColorCube = ({
  className,
  onClick,
  style,
  hexColor = "#bb333c",
}: {
  onClick?: () => void;
  style?: { backgroundColor: string };
  className?: string;
  hexColor?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={twMerge(
      "w-4 h-4 rounded cursor-pointer",
      `bg-[${hexColor}]`,
      className
    )}
    style={{
      backgroundColor: hexColor,
      ...style,
    }}
  />
);
