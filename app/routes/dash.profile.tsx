import { Children, ReactNode } from "react";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Check } from "~/components/icons/check";
import { Edit } from "~/components/icons/edit";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Profile() {
  return (
    <main className=" ">
      <RouteTitle>Mi perfil </RouteTitle>
      <section className="flex gap-8 items-center bg-white p-6 rounded-2xl max-w-3xl">
        <img
          className="w-[108px] h-[108px] rounded-full object-cover"
          src="/images/img2.jpg"
          alt="avatar"
        />
        <div>
          <div className="flex gap-3 items-center">
            <h3 className="text-brand_dark font-bold text-2xl">
              Brenda Ortega
            </h3>
            <Edit />
          </div>
          <p className="text-brand_gray font-satoshi mt-1">
            isabela_lozano_lonez@gmail.com
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
        <h3 className="mb-6 text-2xl font-bold">{plan}</h3>
        <p className="mb-6 text-2xl font-satoshi font-bold">${price} / mes</p>
      </div>
      {children}
      <hr />
      <div className="flex justify-between items-center flex-wrap">
        {" "}
        <p className="text-brand_gray font-satoshi">
          Próxima fecha de pago
          <span className="ml-2 font-bold  font-satoMedium">{nextPayment}</span>
        </p>
        <SecondaryButton className="h-10"> Administrar Plan</SecondaryButton>
      </div>
    </section>
  );
};
