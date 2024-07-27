import { PrimaryButton } from "~/components/common/primaryButton";
import { useFetcher, useNavigate } from "@remix-run/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { InputFile } from "~/components/forms/InputFile";
import { AddImage } from "~/components/icons/addImage";
import { Options, SelectInput } from "~/components/forms/SelectInput";
import { Switch } from "~/components/forms/Switch";
import { BasicInput } from "~/components/forms/BasicInput";
import { ReactNode } from "react";

const OPTIONS: Options[] = [
  {
    value: "En sucursal",
  },
  {
    value: "A domicilio",
  },
  {
    value: "En línea",
  },
];

export default function NewServicePhotos() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Un poco más de información del agendamiento
      </h2>
      <ServicePhotoForm />
      <div className="h-[96px] bg-white/40 mx-auto w-full flex absolute backdrop-blur bottom-0  justify-between items-center ">
        <PrimaryButton
          className="bg-transparent text-brand_dark font-satoMiddle 	"
          isLoading={fetcher.state !== "idle"}
          type="submit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <FaArrowLeftLong />
          Volver
        </PrimaryButton>
        <PrimaryButton isLoading={fetcher.state !== "idle"} type="submit">
          Continuar
        </PrimaryButton>
      </div>
    </main>
  );
}

// Swith props pending

export const SwitchOption = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <article className="flex justify-between items-center w-full mb-6">
      <div className="flex flex-col justify-center">
        <p className="text-brand_dark font-satoMiddle">{title}</p>
        <p>{description}</p>
      </div>
      <Switch name="active" />
    </article>
  );
};

export const ServicePhotoForm = () => {
  return (
    <section className="mt-14 ">
      <InputFile
        name="photos"
        title="Imagenes"
        description="  Carga 1 imagen de tu servicio. Te recomendamos que tenga un tamaño
        mínimo de 200x200px y un peso máximo de 1MB."
      >
        <AddImage className="mx-auto mb-3 " />
        <span className=" font-satoshi">
          Arrastra o selecciona tu foto de portada
        </span>
      </InputFile>

      <SelectInput
        className="mt-8"
        options={OPTIONS}
        name="location"
        placeholder="Selecciona una opción"
        label="¿En donde se realiza el servicio?"
      />
      <SwitchOption title="Permitir que este servicio se agende en línea" />
      <SwitchOption title="  Permitir que 2 o más clientes agenden al mismo tiempo" />
      <BasicInput
        placeholder="2"
        label="¿Hasta cuantas sesiones se pueden agendar por hora?"
        name="seats"
      />
    </section>
  );
};
