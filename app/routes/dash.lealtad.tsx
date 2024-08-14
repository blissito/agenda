import React from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import { ArrowRight } from "~/components/icons/arrowRight";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Lealtad() {
  return (
    <main className=" ">
      <RouteTitle>Lealtad</RouteTitle>
      <EmptyStateLoyalty />
    </main>
  );
}

const EmptyStateLoyalty = () => {
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto mb-4" src="/images/no-result.svg" />
        <p className="font-satoMedium text-xl font-bold">
          Activa el programa de lealtad <span className="text-2xl ">🧧</span>{" "}
        </p>
        <p className="mt-2 text-brand_gray">
          Ofrece tarjetas de regalo y descuentos a tus clientes más fieles
        </p>
        <PrimaryButton className="mx-auto mt-12">
          Activar <ArrowRight />{" "}
        </PrimaryButton>
      </div>
    </div>
  );
};
