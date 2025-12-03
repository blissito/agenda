import type { Service } from "@prisma/client";
import { useFetcher } from "react-router";
import { Image } from "~/components/common/Image";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Switch } from "~/components/common/Switch";
import { cn } from "~/utils/cn";

export default function ServicesForm({
  onCancel,
  services,
}: {
  services: Service[];
  onCancel?: () => void;
}) {
  return (
    <div className="rounded-2xl max-w-3xl mt-6">
      <ServiceRows services={services} />
      <div className="absolute bottom-10 right-10">
        <SecondaryButton onClick={onCancel} className="w-[120px] mt-auto">
          Volver
        </SecondaryButton>
      </div>
    </div>
  );
}

export const ServiceRows = ({ services = [] }: { services: Service[] }) => {
  const fetcher = useFetcher();
  const generalClassName = "col-span-2";

  const handleChange = (id: string, bool: boolean) => {
    fetcher.submit(
      {
        data: JSON.stringify({ isActive: bool, id }),
        intent: "service_update",
      },
      { method: "post", action: "/api/services" }
    );
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-3 items-center text-sm font-semibold mb-4">
        <span className={generalClassName}>Portada</span>
        <span className={cn(generalClassName, "col-span-4")}>Nombre</span>
        <span className={generalClassName}>Duración</span>
        <span className={generalClassName}>Precio</span>
        <span className={generalClassName}>Público</span>
      </div>

      {services.map((service) => (
        <div
          key={service.id}
          className="grid grid-cols-12 text-xs gap-3 items-center mt-3"
        >
          <Image
            src={service.photoURL ?? undefined}
            className="col-span-2 h-12 rounded"
          />
          <span className={cn(generalClassName, "col-span-4")}>
            {service.name}
          </span>
          <span className={generalClassName}>{service.duration} min</span>
          <span className={generalClassName}>${service.price}MXN</span>
          <span className={generalClassName + " flex justify-start"}>
            <Switch
              defaultChecked={service.isActive}
              onChange={(bool) => handleChange(service.id, bool)}
              name={service.id}
            />
          </span>
        </div>
      ))}
    </>
  );
};

export const ServiceItem = ({
  serviceName,
  img,
}: {
  serviceName: string;
  img?: string;
}) => {
  return (
    <div className="flex gap-4 items-center">
      <Image className="w-16 h-10 object-cover rounded-lg" src={img} />
      <h3 className="font-satoMiddle text-brand_dark">{serviceName}</h3>
    </div>
  );
};
