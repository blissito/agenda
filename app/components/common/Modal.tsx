import type { ReactNode } from "react";
import { RxCross2 } from "react-icons/rx";

export const Modal = ({
  children,
  isOpen,
  onClose,
  title,
}: {
  title: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  children?: ReactNode;
}) => {
  return isOpen ? (
    <article className="fixed bg-brand_blue/50 backdrop-blur-sm z-20 inset-0 grid place-content-center">
      <section className="bg-white rounded-2xl border shadow p-4 w-[320px]">
        <nav className="flex justify-between ">
          {title && <h1>{title}</h1>}
          <button
            onClick={onClose}
            className="hover:bg-gray-200 active:bg-gray-300 rounded-full w-6 grid place-content-center"
          >
            <RxCross2 />
          </button>
        </nav>
        <hr className="mt-2 mb-6 border-brand_blue/20" />
        <div>{children}</div>
      </section>
    </article>
  ) : null;
};
