import React from "react";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Anchor } from "~/components/icons/link";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Lealtad() {
  return (
    <main className=" ">
      <RouteTitle>Evaluaciones</RouteTitle>
      <EmptyStateReviews />
    </main>
  );
}

const EmptyStateReviews = () => {
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto mb-4" src="/images/clients-empty.svg" />
        <p className="font-satoMedium text-xl font-bold">
          ¡Nada por aquí! <span className="text-2xl ">📝</span>{" "}
        </p>
        <p className="mt-2 text-brand_gray">
          La confianza de tus clientes es muy valiosa, sigue compartiendo tu
          agenda
        </p>
        <SecondaryButton
          isDisabled
          className="mx-auto mt-12 bg-transparent border-[1px] border-[#CFCFCF]"
        >
          <span className="text-inherit">
            <Anchor />
          </span>
          <span>Copiar link</span>
        </SecondaryButton>
      </div>
    </div>
  );
};
