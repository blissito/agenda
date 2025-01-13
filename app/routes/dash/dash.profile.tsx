import { useLoaderData } from "react-router";
import type { ReactNode } from "react";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Camera } from "~/components/icons/camera";
import { Check } from "~/components/icons/check";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getUserOrRedirect } from "~/.server/userGetters";

export const loader = async ({ request }) => {
  const user = await getUserOrRedirect(request);
  return { user };
};
export default function Profile() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <main className=" ">
      <RouteTitle>Mi perfil </RouteTitle>
      <section className="flex gap-3 md:gap-8 items-center bg-white p-6 rounded-2xl max-w-3xl">
        <div className="w-20 h-20 md:w-[108px] md:h-[108px] rounded-full border-[1px] border-brand_stroke relative">
          {user.providerId ? null : (
            <Camera className="absolute right-0 bottom-0" />
          )}

          <img
            className="w-20 h-20 md:w-[108px] md:h-[108px] rounded-full object-cover "
            src={user.photoURL ? user.photoURL : "/images/avatar.svg"}
            alt="avatar"
          />
        </div>
        <div>
          <div className="flex gap-3 items-center">
            <h3 className="text-brand_dark font-bold text-xl md:text-2xl">
              {user.displayName}
            </h3>
            {/* {user.providerId ? null : <Edit />} */}
          </div>
          <p className="text-brand_gray font-satoshi mt-1 text-sm md:text-base">
            {user.email}
          </p>
        </div>
      </section>
      <section>
        <PlanCard
          plan="Plan Profesional"
          price="199.00 mxn"
          nextPayment="18 de Agosto 2024"
        >
          <ul className="text-left flex gap-4 flex-col text-lg text-brand_gray font-satoshi ">
            <li className="flex gap-3">
              {" "}
              <Check /> Agenda en línea
            </li>
            <li className="flex gap-3">
              {" "}
              <Check /> Recordatorios automáticos
            </li>
            <li className="flex gap-3">
              {" "}
              <Check /> Sitio web para citas
            </li>
            <li className="flex gap-3">
              {" "}
              <Check /> Pagos en línea
            </li>
            <li className="flex gap-3">
              <Check /> Programa de lealtad, descuentos y tarjetas de regalo
            </li>
            <li className="flex gap-3">
              {" "}
              <Check /> Encuesta de satisfacción
            </li>
            <li className="flex gap-3">
              {" "}
              <Check /> de clientes
            </li>
          </ul>
        </PlanCard>
      </section>
    </main>
  );
}

const PlanCard = ({
  children,
  nextPayment,
  price,
  plan,
}: {
  children: ReactNode;
  nextPayment?: string;
  price: string;
  plan: string;
}) => {
  return (
    <section className="flex flex-col gap-4 bg-white p-6 rounded-2xl max-w-3xl my-8">
      <div className="flex justify-between items-center flex-wrap">
        <h3 className="mb-4 md:mb-6 text-2xl font-bold font-title">{plan}</h3>
        <p className="mb-4 md:mb-6 text-2xl font-satoshi font-bold">
          ${price} / mes
        </p>
      </div>
      {children}
      <hr />
      <div className="flex justify-between items-center flex-wrap">
        {" "}
        <p className="text-brand_gray font-satoshi">
          Próxima fecha de pago
          <span className="ml-2 font-bold  font-satoMedium">{nextPayment}</span>
        </p>
        <SecondaryButton className="h-10 md:mt-0 mt-6">
          {" "}
          Administrar Plan
        </SecondaryButton>
      </div>
    </section>
  );
};
