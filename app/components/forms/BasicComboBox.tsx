import { RiUserSearchLine } from "react-icons/ri";
import { BasicInput } from "./BasicInput";
import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { cn } from "~/utils/cn";

export const BasicComboBox = ({
  register,
  onNewClientClick,
}: {
  register: any;
  onNewClientClick?: () => void;
}) => {
  const [showClientList, setShowClientList] = useState(false);
  const handleClick = () => {
    onNewClientClick?.();
  };
  return (
    <section
      className="relative"
      onFocus={() => setShowClientList(true)}
      onBlur={() => {
        setTimeout(() => setShowClientList(false), 1000);
      }}
    >
      <BasicInput
        label="Cliente"
        icon={<RiUserSearchLine />}
        name="customer"
        placeholder="Buscar por correo"
        registerOptions={{ required: false }}
        register={register}
      />
      {showClientList && (
        <div className="rounded-2xl bg-white w-full absolute z-10 -bottom-10 grid border py-2 px-2">
          <button
            type="button"
            onClick={handleClick}
            className={cn(
              "flex items-center gap-4 bg-brand_blue/10 rounded-full py-2 px-2",
              "text-brand_blue/80 hover:text-brand_blue"
            )}
          >
            <span>
              <FaPlus />
            </span>
            <span>Agregar cliente</span>
          </button>
        </div>
      )}
    </section>
  );
};
