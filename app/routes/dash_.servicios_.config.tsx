import { PrimaryButton } from "~/components/common/primaryButton";
import { useFetcher, useNavigate } from "@remix-run/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { RadioButton } from "~/components/forms/services_model/ServiceTimesForm";
import { SwitchOption } from "~/components/forms/services_model/ServicePhotoForm";

export default function NewServicePayment() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tus cobros y recordatorios
      </h2>
      <ServicePaymentForm />
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
          to={"/dash/services/newservicesuccess"}
        >
          Continuar
        </PrimaryButton>
      </div>
    </main>
  );
}

const ServicePaymentForm = () => {
  return (
    <section className="mt-14">
      <div className="text-brand_gray">
        <p className="text-brand_dark font-satoMiddle">
          ¿En que horario ofrecerás este servicio?
        </p>
        <RadioButton
          name="payment"
          value="required"
          label="Al agendar (tu cliente paga para poder reservar la sesión)"
        />
        <RadioButton
          name="payment"
          value="norequired"
          label="  Después de agendar (tu cliente no necesita pagar para reservar, podrás cobrarle en el establecimiento)"
        />
        <p className="mt-8 mb-3 text-brand_dark font-satoMiddle">
          ¿Qué notificaciones quieres que enviemos a tus clientes?
        </p>
        <SwitchOption
          title="Mail de confirmación"
          description="Lo enviaremos en cuanto se complete la reservación"
        />
        <SwitchOption
          title="Whats app de recordatorio"
          description="Lo enviaremos 4hrs antes de la sesión"
        />

        <SwitchOption
          title="  Mail de evaluación"
          description="Lo enviaremos 10 min después de terminar la sesión"
        />
      </div>
    </section>
  );
};
