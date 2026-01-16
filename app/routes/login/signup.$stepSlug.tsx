import { useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AboutYourCompanyForm } from "~/components/forms/AboutYourCompanyForm";
import { BussinesTypeForm } from "~/components/forms/BussinesTypeForm";
import { TimesForm } from "~/components/forms/TimesForm";
import { PrimaryButton } from "~/components/common/primaryButton";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { getOrCreateOrgOrRedirect, updateOrg } from "~/.server/userGetters";
import { Denik } from "~/components/icons/denik";
import type { Route } from "./+types/signup.$stepSlug";
import { cn } from "~/utils/cn";

export const REQUIRED_MESSAGE = "Este campo es requerido";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_org") {
    return await updateOrg(formData, params.stepSlug);
  }
  return null;
};

export const loader = async ({
  request,
  params: { stepSlug },
}: Route.LoaderArgs) => {
  const org = await getOrCreateOrgOrRedirect(request); // redirect if isActive
  return {
    org, // @todo send only needed by each step
    stepSlug,
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { org, stepSlug } = loaderData;

  const FormComponent = useMemo(() => {
    switch (stepSlug) {
      case "4":
        return LoaderScreen;
      case "3":
        return TimesForm;
      case "2":
        return BussinesTypeForm;
      default:
        return AboutYourCompanyForm;
    }
  }, [stepSlug]);

  const progressPercent =
    stepSlug === "1" ? 25 : stepSlug === "2" ? 50 : stepSlug === "3" ? 75 : 100;

  return (
    <article className="relative min-h-screen w-full bg-white overflow-hidden">
      {/* =========================
          BARRA DE PROGRESO (UI)
          ========================= */}
      <div className="absolute left-0 top-0 h-[3px] w-full bg-neutral-100">
        <div
          className="h-full bg-brand_blue transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* =========================
          HEADER (logo + ayuda)
          ========================= */}
      <header className="relative z-10 flex items-center justify-between px-10 pt-8">
        {/* Logo como SVG (componente) */}
        <div className="flex items-center gap-2">
          <Denik fill="#4F63FF" className="h-8 w-auto" />
        </div>

        <button
          type="button"
          className="rounded-full bg-neutral-50 px-5 py-2 text-sm text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-100"
        >
          Ayuda
        </button>
      </header>

      {/* Fondo suave (solo UI) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute -left-40 top-16 h-[520px] w-[520px] rounded-full bg-brand_blue/10 blur-3xl" />
        <div className="absolute -right-44 bottom-10 h-[520px] w-[520px] rounded-full bg-brand_blue/10 blur-3xl" />
      </div>

      {/* =========================
          CONTENIDO
          ========================= */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-10">
        {/* NOTA: no cambiamos props ni lógica, solo el contenedor */}
        <FormComponent title={org.name} org={org} />
      </main>

      {/* =========================
          FOOTER
          ========================= */}
      <footer className="absolute bottom-6 left-0 right-0 px-10 text-xs text-neutral-400">
        <div className="flex items-center justify-between">
          <span>Todos los derechos reservados Denik® 2024</span>
          <a className="hover:text-neutral-600" href="#">
            Política de privacidad
          </a>
        </div>
      </footer>
    </article>
  );
}

export const LoaderScreen = ({ title }: { title: string }) => {
  const [text, setText] = useState(title);
  const [show, set] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      set(true);
      setText("¡Tu agenda en línea está lista!");
    }, 2000);
  }, []);

  return (
   
    <section className="absolute inset-0 z-10 bg-white">
      <div className="mx-auto flex min-h-[calc(100vh-170px)] w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <img
          className="h-[180px] w-auto select-none pointer-events-none"
          src="/images/denik.svg"
          alt="figura"
          draggable={false}
        />

        
        <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
          {text}
        </h1>

        <p className="mt-2 max-w-lg text-sm text-neutral-500">
          Configura tus servicios, comparte tu agenda y empieza a recibir reservas desde tu
          página web en Denik.
        </p>

        
        <div className="mt-7">
          {show ? (
            <>
              <PrimaryButton
                to="/dash"
                as="Link"
                className="px-8"
                type="button"
                isDisabled={false}
                isLoading={false}
              >
                Continuar
              </PrimaryButton>

           
              <EmojiConfetti repeat={1} />
            </>
          ) : (
            // Mientras carga (2s), deja el botón “apagado” para que no brinque el layout
            <PrimaryButton
              type="button"
              className="px-8 opacity-60 pointer-events-none"
              isDisabled
              isLoading={false}
            >
              Continuar
            </PrimaryButton>
          )}
        </div>
      </div>
    </section>
  );
};

export const LeftHero = ({ title }: { title: ReactNode }) => {
  return (
    <div className="flex justify-center items-center  max-w-xl mx-auto grow ">
      <h2 className="text-white lg:text-5xl  text-3xl font-bold !leading-tight		">
        {title}
      </h2>
    </div>
  );
};

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={twMerge(
        "mb-12 h-4 w-full",
        "transition-all rounded-full top-0 left-0 text-white text-3xl justify-between items-center flex",
        "max-w-xl mx-auto",
        "active:opacity-50"
      )}
    >
      <HiOutlineArrowNarrowLeft />
      <Denik fill="#ffffff" className="block lg:hidden h-10" />
    </button>
  );
};

export const DenikWatermark = () => {
  return (
    <div
      className={twMerge(
        "transition-all top-0 left-0 text-white text-3xl justify-center items-center block",
        "max-w-xl mx-auto",
        "active:opacity-50"
      )}
    >
      <Denik fill="#ffffff" />
    </div>
  );
};
