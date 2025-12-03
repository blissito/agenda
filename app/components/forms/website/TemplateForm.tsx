import type { Org } from "@prisma/client";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { UsernameInput } from "./UserNameInput";
import { Plantilla } from "./Plantilla";
import { ColorInput } from "./ColorInput";

export const TemplateForm = ({
  org,
  onClose,
}: {
  onClose?: () => void;
  org: Org;
}) => {
  return (
    <article className="grid">
      <h2 className=" font-satoMiddle text-brand_dark text-2xl mb-8 ">
        Sitio web
      </h2>
      <UsernameInput org={org} />
      <hr className="bg-brand_stroke h-[1px] border-none my-6" />
      <Plantilla org={org} />
      <ColorInput org={org} />
      <nav className="flex mt-16 justify-end gap-6">
        <SecondaryButton className="w-[120px]" onClick={onClose}>
          Terminar
        </SecondaryButton>
      </nav>
    </article>
  );
};
