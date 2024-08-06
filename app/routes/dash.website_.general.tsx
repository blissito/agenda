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

export default function Index() {
  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website">Mi sitio web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website/general">
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
          placeholder="Estudio Westeros"
          label="Nombre de tu negocio"
          name="name"
        />
        <BasicInput
          placeholder="Estudio Westeros"
          label="Tu nombre o del profesional que atiende tu negocio"
          name="shopKeeper"
        />
        <BasicInput
          name="address"
          placeholder="Av. Camps Elisés"
          label="Dirección de tu negocio (opcional)"
        />
        <BasicInput
          as="textarea"
          name="businessDescription"
          placeholder="Cuéntale a tus clientes sobre tu negocio"
          label="Descripción"
        />
        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton as="Link" to="/dash/website" className="w-[120px]">
            Cancelar
          </SecondaryButton>
          <PrimaryButton>Guardar</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
