import { useFetcher, useNavigate } from "@remix-run/react";
import { SecondaryButton } from "~/components/common/secondaryButton";

export default function NewServiceSuccess() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative flex text-center flex-col items-center justify-center ">
      <img className="w-[280px] mb-6" src="/images/success.svg" />
      <h3 className="text-2xl text-brand_dark font-satoMedium mb-4">
        ¡Tu servicio ha sido agregado!
      </h3>
      <p className="text-brand_gray text-lg mb-12">
        Tu servicio{" "}
        <strong className="font-satoMedium">“Clase de canto”</strong> ya se
        encuentra disponible. Edítalo desde la sección «Servicios».
      </p>
      <SecondaryButton as="Link" to={"/dash/services"}>
        Ver mis servicios
      </SecondaryButton>
    </main>
  );
}
