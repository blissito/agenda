import { ReactNode } from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Facebook } from "~/components/icons/facebook";
import { Checklist } from "~/components/icons/menu/checklist";
import { Landing } from "~/components/icons/menu/landing";
import { Share } from "~/components/icons/menu/share";
import { StepDone } from "~/components/icons/menu/stepdone";
import { Stripe } from "~/components/icons/menu/stripe";
import { User } from "~/components/icons/menu/user";

export default function DashOnboarding() {
  return (
    <main className="max-w-7xl  mx-auto pt-28  max-h-screen  ">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border-[#EFEFEF]">
        <div>
          <h3 className="text-2xl font-satoMiddle">
            ¡Ya casi terminas de configurar tu agenda!
          </h3>
          <p className="text-brand_gray mt-1">
            Estás a unos pasos de empezar a recibir a tus clientes
          </p>
        </div>
        <hr className="h-[1px] border-none bg-brand_stroke my-6" />
        <div className="flex flex-col gap-8">
          <Step
            icon={<User />}
            title="Crea tu cuenta y configura tu horario"
            description="El primer paso ya está hecho "
            cta={<StepCheck />}
          />
          <Step
            icon={<Landing />}
            title="Conoce tu sitio web y agenda una cita de prueba"
            description="Échale un ojo a tu sitio web y pruébalo"
            cta={<PrimaryButton className="h-10">Visitar</PrimaryButton>}
          />
          <Step
            icon={<Stripe />}
            title="Da de alta tu cuenta de pagos (opcional)"
            description="Crea tu cuenta de Stripe y vincúlala a Deník  "
            cta={<PrimaryButton className="h-10">Ir</PrimaryButton>}
          />
          <Step
            icon={<Checklist />}
            title="Crea tu primer servicio"
            description="Agrega uno o todos tus servicios "
            cta={<PrimaryButton className="h-10">Agregar</PrimaryButton>}
          />
          <Step
            icon={<Share />}
            title="Comparte el link con tus clientes"
            description="Prueba el agendamiento desde tu dashboard"
            cta={<PrimaryButton className="h-10">Copiar</PrimaryButton>}
          />
        </div>
      </div>
      <div className="max-w-2xl h-[72px] mx-auto items-center bg-white px-8 py-6 mt-6 rounded-2xl border-[#EFEFEF] flex justify-between overflow-hidden">
        <p>
          ¿Tienes alguna duda?{" "}
          <a className="text-brand_blue underline">Escríbenos</a>{" "}
        </p>
        <img
          className="w-[140px] h-[140px]"
          src="/images/chat.gif"
          alt="dancer"
        />
      </div>
    </main>
  );
}

const StepCheck = () => {
  return (
    <section className="w-[120px] flex justify-center">
      <StepDone />
    </section>
  );
};

const Step = ({
  icon,
  title,
  description,
  cta,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: ReactNode;
}) => {
  return (
    <section className="flex justify-between items-center">
      <div className="flex  gap-4">
        <div className="bg-[#F9F9FB] w-16 h-14 flex justify-center items-center rounded">
          {icon}
        </div>
        <div>
          <p className="font-satoMiddle">{title}</p>
          <p className="text-brand_gray">{description}</p>
        </div>
      </div>
      {cta}
    </section>
  );
};
