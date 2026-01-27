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
import { ArrowRight } from "~/components/icons/arrowRight";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "react-router";



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
    org,
    stepSlug,
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

const aboutScreen = useMemo(() => {
  const s = searchParams.get("screen");
  const n = s ? Number(s) : 0;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(2, n));
}, [searchParams]);

  const { org, stepSlug } = loaderData;


  const FormComponent = useMemo(() => {
    switch (stepSlug) {
      case "6":
        return LoaderScreen;
      case "5":
        return TimesForm;
      case "4":
        return BussinesTypeForm;
      case "3":
      case "2":
      case "1":
      default:
        return AboutYourCompanyForm;
    }
  }, [stepSlug]);


  const stepNumber =
  stepSlug === "1" || stepSlug === "2" || stepSlug === "3"
    ? aboutScreen + 1 
    : stepSlug === "4"
    ? 4
    : stepSlug === "5"
    ? 5
    : 6;


  const progressPercent = (stepNumber / 6) * 100;

  return (
    <article className="relative min-h-screen w-full bg-white overflow-hidden">
      <div className="absolute left-0 top-0 h-[10px] w-full bg-neutral-100">
        <div
          className="h-full bg-brand_blue transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <header className="relative z-10 flex items-center justify-between px-10 pt-8">
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

      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        
      </div>
      <main className="relative z-10 mx-auto w-full max-w-6xl px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepSlug}
            initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, scale: 0.985, filter: "blur(6px)" }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
          >
            {stepSlug === "1" || stepSlug === "2" || stepSlug === "3" ? (
              <AboutYourCompanyForm org={org} stepSlug={stepSlug} />
            ) : stepSlug === "4" ? (
              <BussinesTypeForm org={org} />
            ) : stepSlug === "5" ? (
              <TimesForm org={org} />
            ) : (
              <LoaderScreen title={org.name} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>



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
  const [text, setText] = useState("¡Tu agenda en línea está lista!");
  const [show, set] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      set(true);
    }, 2000);
  }, []);

  return (
    <section className="absolute inset-0 z-10 bg-white">
      <div className="mx-auto flex min-h-[calc(100vh-170px)] w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <img
          className="h-[312px] w-auto select-none pointer-events-none"
          src="/images/denik.png"
          alt="figura"
          draggable={false}
        />

        <h1 className="font-jakarta-bold font-bold text-4xl leading-[44px] text-brand_dark">{/*4xl= 36 */}
          {text}
        </h1>

        <p className="font-jakarta  text-lg leading-[24px] text-brand_gray mt-4">{/*lg= 18px */}
          Configura tus servicios, comparte tu agenda y empieza a recibir reservas
          desde tu página web en Denik.
        </p>

        <div className="mt-10">
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
                Continuar <ArrowRight />
              </PrimaryButton>

              <EmojiConfetti repeat={1} />
            </>
          ) : (
            <PrimaryButton
              type="button"
              className="px-8 font-satoshi font-medium text-[16px] leading-[24px]"
              isDisabled={false}
              isLoading={true}
            >
              Continuar <ArrowRight />
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
