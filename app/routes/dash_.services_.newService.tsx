import { Children, ReactNode } from "react";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Check } from "~/components/icons/check";
import { Edit } from "~/components/icons/edit";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import React from "react";
import { ServiceGeneralForm } from "~/components/forms/ServiceGeneralForm";
import { AbsoluteCentered } from "~/components/forms/AboutYourCompanyForm";
import { PrimaryButton } from "~/components/common/primaryButton";
import { useFetcher } from "@remix-run/react";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function NewService() {
  const fetcher = useFetcher();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        ¡Empecemos! <br /> Describe tu servicio
      </h2>
      <div className="mt-14">
        <ServiceGeneralForm />
      </div>
      <div className="h-[96px] bg-white/40 mx-auto w-full flex absolute backdrop-blur bottom-0  justify-between items-center ">
        <PrimaryButton
          className="bg-transparent text-brand_dark font-satoMiddle 	"
          isLoading={fetcher.state !== "idle"}
          type="submit"
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
