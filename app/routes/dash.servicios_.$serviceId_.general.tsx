import { BasicInput } from "~/components/forms/BasicInput";
import { ServicePhotoForm } from "~/components/forms/services_model/ServicePhotoForm";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { action } from "./dash_.servicios_.nuevo";
import { InputFile } from "~/components/forms/InputFile";
import { AddImage } from "~/components/icons/addImage";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const serviceId = params.serviceId;
  const service = await db.service.findUnique({ where: { id: serviceId } });
  if (!service) return json(null, { status: 404 });
  return { service };
};

export default function Index() {
  const { service } = useLoaderData<typeof loader>();

  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios">Servicios</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios">
              {service.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/servicios/general">
              General
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <h2
          className="font-satoMiddle mb-8 text-xl
        "
        >
          Información General
        </h2>
        {/* Revisar props */}
        <div className="flex gap-6">
          {/* <InputFile // @TODO: this should contain an input with string value coming from upload
            action={action}
            name="photoURL"
            title="Foto de portada"
            description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un aspect ratio 16:9 y un peso máximo de 1MB."
            register={register}
            registerOptions={{ required: false }}
          >
            <AddImage className="mx-auto mb-3" />
            <span className="font-satoshi">
              Arrastra o selecciona tu foto de portada
            </span>
          </InputFile>
          <InputFile // @TODO: this should contain an input with string value coming from upload
            action={action}
            name="photoURL"
            title="Foto de portada"
            description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un aspect ratio 16:9 y un peso máximo de 1MB."
            register={register}
            registerOptions={{ required: false }}
          >
            <AddImage className="mx-auto mb-3" />
            <span className="font-satoshi">
              Arrastra o selecciona tu foto de portada
            </span>
          </InputFile> */}
        </div>
        <BasicInput
          placeholder="Clase de piano"
          label="Nombre del servicio"
          name="name"
        />
        <BasicInput
          placeholder="$0.00"
          label="Precio"
          name="price"
          type="number"
        />
        <BasicInput
          name="points"
          placeholder="100"
          label="¿A cuántos puntos de recompensas equivale el servicio?"
        />
        <BasicInput
          as="textarea"
          name="description"
          placeholder="Cuéntale a tus clientes sobre tu servicio"
          label="Descripción"
        />

        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton as="Link" to="/dash/servicios" className="w-[120px]">
            Cancelar
          </SecondaryButton>
          <PrimaryButton>Guardar</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
