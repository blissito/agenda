import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Switch } from "~/components/common/Switch";
import { Image } from "~/components/common/Image";
import { Service } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getServices } from "~/.server/userGetters";
import { cn } from "~/utils/cn";
import { serviceUpdate } from "~/components/forms/form_handlers/serviceGeneralFormHandler";

export const action = async ({ request }: ActionFunctionArgs) => {
  await serviceUpdate(request, { redirectURL: "/dash/website/servicios" });
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const services = await getServices(request);
  return { services };
};

export default function Index() {
  const { services } = useLoaderData<typeof loader>();
  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website">Mi sitio web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website/servicios">
              Servicios
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <ServiceRows services={services} />
        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton
            reloadDocument
            as="Link"
            to="/dash/website"
            className="w-[120px]"
          >
            Volver
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
}

export const ServiceRows = ({
  services = [],
}: {
  services: Partial<Service>[];
}) => {
  const fetcher = useFetcher();
  const generalClassName = "col-span-2";

  const handleChange = (slug: string, bool: boolean) => {
    fetcher.submit(
      {
        data: JSON.stringify({ isActive: bool, slug }),
        intent: "service_update_isActive",
      },
      { method: "POST" }
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
          <span className={generalClassName}>
            <Switch
              defaultChecked={service.isActive}
              setValue={handleChange}
              name={service.slug}
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
