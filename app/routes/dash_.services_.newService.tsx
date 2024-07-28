import { PrimaryButton } from "~/components/common/primaryButton";
import { useFetcher, useNavigate } from "@remix-run/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { BasicInput } from "~/components/forms/BasicInput";
import { TextAreaInput } from "~/components/forms/TextAreaInput";

export default function NewService() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        ¡Empecemos! <br /> Describe tu servicio
      </h2>
      <ServiceGeneralForm />

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
        <PrimaryButton
          isLoading={fetcher.state !== "idle"}
          type="submit"
          as="Link"
          to={"/dash/services/newservicephotos"}
        >
          Continuar
        </PrimaryButton>
      </div>
    </main>
  );
}

export const ServiceGeneralForm = () => {
  return (
    <section className="flex flex-col mx-auto max-w-xl  mt-14">
      <BasicInput label="Nombre del servicio" name="rewards" />

      <BasicInput placeholder="$00.00" label="Precio" name="rewards" />
      <BasicInput
        placeholder="$00.00"
        label="¿A cuántos puntos de recompensas equivale el servicio?"
        name="rewards"
      />
      <TextAreaInput
        placeholder="Cuéntale a tus clientes sobre tu servicio"
        label="Descripción"
        name="description"
      />
    </section>
  );
};
