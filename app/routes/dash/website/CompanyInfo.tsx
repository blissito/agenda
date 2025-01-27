import { SecondaryButton } from "~/components/common/secondaryButton";
import { Facebook } from "~/components/icons/facebook";
import { Instagram } from "~/components/icons/insta";
import { Anchor } from "~/components/icons/link";
import { Linkedin } from "~/components/icons/linkedin";
import { Tiktok } from "~/components/icons/tiktok";
import { Twitter } from "~/components/icons/twitter";
import { Youtube } from "~/components/icons/youtube";
import { type Org, type Service } from "@prisma/client";
import { formatRange } from "~/components/common/FormatRange";
import qrcode from "qrcode";
import { InfoBox } from "./InfoBox";
import { InfoService } from "./InfoService";
import { MediaBox } from "./MediaBox";
import { SocialDataFormModal } from "~/components/ui/modals/SocialDataFormModal";

export const CompanyInfo = ({
  services = [],
  isPublic,
  org,
}: {
  isPublic?: boolean;
  services?: Partial<Service>[];
  org: Org;
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 col-span-6 xl:col-span-4 order-last xl:order-first">
      <div className="">
        <div className="flex justify-between items-center">
          {" "}
          <h2 className="text-2xl font-bold">{org?.name} </h2>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/general"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>

        <InfoBox title="Encargad@" value={org?.shopKeeper} />
        <InfoBox title="Teléfono" value="55 662 66 66" />
        <InfoBox title="Dirección" value={org?.address} />
        <InfoBox title="Descripción" value={org?.description} />
        <hr className="bg-brand_stroke my-6" />

        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Horario</h3>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/horario"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>

        <InfoBox title="Lunes" value={formatRange(org?.weekDays?.lunes)} />
        <InfoBox title="Martes" value={formatRange(org?.weekDays?.martes)} />
        <InfoBox
          title="Miércoles"
          value={formatRange(org.weekDays?.["miércoles"])}
        />
        <InfoBox title="Jueves" value={formatRange(org.weekDays?.jueves)} />
        <InfoBox title="Viernes" value={formatRange(org.weekDays?.viernes)} />
        <InfoBox title="Sábado" value={formatRange(org.weekDays?.["sábado"])} />
        <InfoBox title="Domingo" value={formatRange(org.weekDays?.domingo)} />
        <hr className="bg-brand_stroke my-6" />

        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Servicios</h3>
          {!isPublic && (
            <SecondaryButton
              as="Link"
              to="/dash/website/servicios"
              className="h-10"
            >
              {" "}
              Editar
            </SecondaryButton>
          )}
        </div>
        <div className="flex gap-x-6 flex-wrap pr-[10%]">
          {services.map((s) => (
            <InfoService
              title={s.name ?? "untitled"}
              link={s.isActive ? `/agenda/${org.slug}/${s.slug}` : undefined}
              image={s.photoURL ?? undefined}
              key={s.id}
              isActive={s.isActive}
            />
          ))}
        </div>
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Redes sociales</h3>
          {!isPublic && (
            <SocialDataFormModal>
              <SecondaryButton className="h-10"> Editar</SecondaryButton>
            </SocialDataFormModal>
          )}
        </div>

        <MediaBox icon={<Facebook />} link={org?.social?.facebook} />

        <MediaBox icon={<Instagram />} link={org?.social?.instagram} />
        <MediaBox icon={<Twitter />} link={org?.social?.x} />

        <MediaBox icon={<Tiktok />} link={org?.social?.tiktok} />
        <MediaBox icon={<Youtube />} link={org?.social?.youtube} />
        <MediaBox icon={<Linkedin />} link={org?.social?.linkedin} />

        <MediaBox icon={<Anchor />} link={org?.social?.website} />
      </div>
    </div>
  );
};
