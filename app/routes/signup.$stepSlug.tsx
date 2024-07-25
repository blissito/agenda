import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData, useNavigate } from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { AboutYourCompanyForm } from "~/components/forms/AboutYourCompanyForm";
import { BussinesTypeForm } from "~/components/forms/BussinesTypeForm";
import { TimesForm } from "~/components/forms/TimesForm";
import { Agenda } from "~/components/icons/menu/agenda";
import { PrimaryButton } from "~/components/common/primaryButton";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { aboutYourCompanyHandler } from "~/utils/handlers/aboutYourCompanyHandler";
import { getFirstOrgOrNull } from "~/db/userGetters";

export const REQUIRED_MESSAGE = "Este campo es requerido";
export const SLUGS = [
  "sobre-tu-negocio",
  "tipo-de-negocio",
  "horario",
  "cargando",
];
const FORM_COMPONENT_NAMES = [
  "AboutYourCompanyForm",
  "BussinesTypeForm",
  "TimesForm",
  "Loader",
];

// @TODO: check mobile sizes
// @TODO: saving with real user
// @TODO: Show saved values when return (edit) <=============
// @TODO: secure route
// @todo: in order to reuse action save as functions in a utility
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const data = JSON.parse(formData.get("data") as string);
  console.log("Intent:::", intent);
  // sobre-tu-negocio
  if (intent === SLUGS[0]) return await aboutYourCompanyHandler(request, data);

  // tipo-de-negocio
  if (intent === SLUGS[1]) {
    console.log("SAVING: " + SLUGS[1], data);
    return redirect("/signup/" + SLUGS[2]);
  }
  // horario
  if (intent === SLUGS[2]) {
    console.log("SAVING: " + SLUGS[3], data);
    // @todo: remove back stack
    return redirect("/signup/" + SLUGS[3]);
  }

  return null;
};

const getStepComponentNameByStepSlug = (slug?: string) => {
  switch (slug) {
    case SLUGS[3]:
      return FORM_COMPONENT_NAMES[3];
    case SLUGS[2]:
      return FORM_COMPONENT_NAMES[2];
    case SLUGS[1]:
      return FORM_COMPONENT_NAMES[1];
    default:
      return FORM_COMPONENT_NAMES[0];
  }
};

// Section titles
const getTitleByStepSlug = (slug?: string) => {
  const title = [
    "Cuéntanos más sobre tu negocio",
    "¿Qué tipo de negocio tienes?",
    "Y por último... \n ¿Qué días abre tu negocio?",
    "¡Solo un poco más!... \n Estamos creando tu agenda",
  ];
  switch (slug) {
    case SLUGS[3]:
      return title[3];
    case SLUGS[2]:
      return title[2];
    case SLUGS[1]:
      return title[1];
    default:
      return title[0];
  }
};

export const loader = async ({
  request,
  params: { stepSlug },
}: LoaderFunctionArgs) => {
  // @TODO: Check if start or redirect
  // @TODO: keyboard support
  // @TODO: Load user id?
  // @TODO: if org exists?
  const org = await getFirstOrgOrNull(request);

  return {
    org,
    stepComponentName: getStepComponentNameByStepSlug(stepSlug),
    title: getTitleByStepSlug(stepSlug),
  };
};

export default function Page() {
  const { org, stepComponentName, title } = useLoaderData<typeof loader>();
  // Components here ==================================================================
  const FormComponent = useMemo(() => {
    switch (stepComponentName) {
      case FORM_COMPONENT_NAMES[3]:
        return Loader;
      case FORM_COMPONENT_NAMES[2]:
        return TimesForm;
      case FORM_COMPONENT_NAMES[1]:
        return BussinesTypeForm;
      default:
        return AboutYourCompanyForm;
    }
  }, [stepComponentName]);

  // @todo: make a counter to redirect

  return (
    <>
      <article className={twMerge("h-screen flex flex-col", "md:flex-row")}>
        <section
          className={twMerge("px-2", "bg-brand_blue", "md:flex-1 py-24")}
        >
          <BackButton />
          <LeftHero title={title} />
        </section>
        <section className="flex-1 overflow-x-hidden">
          <FormComponent title={title} org={org} />
        </section>
      </article>
    </>
  );
}

export const Loader = ({ title }: { title: string }) => {
  const [text, setText] = useState(title);
  const [show, set] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      set(true);
      setText("¡Todo esta listo! \n Es hora de agendar ");
    }, 2000);
  }, []);
  return (
    <section className="font-bold absolute z-10 inset-0 bg-brand_blue text-white flex justify-center items-center flex-col">
      <h1 className="pl-12 lg:max-w-4xl max-w-2xl mx-auto flex gap-12 text-5xl">
        <span className={twMerge(show ? "animate-pulse" : "animate-bounce")}>
          <Agenda fill="white" className="scale-[400%]" />
        </span>
        <span style={{ whiteSpace: "pre-wrap" }}>{text}</span>
      </h1>
      {show && (
        <>
          <PrimaryButton
            to="/dash"
            as="Link"
            className="border mt-12 text-neutral-900 bg-white animate-bounce"
            // isDisabled={isDisabled}
            type="submit"
          >
            Continuar
          </PrimaryButton>
          <EmojiConfetti
            mode="emojis"
            emojis={["📆", "💇🏻‍♀️", "👩🏻‍💻", "📍", "🎀", "🥳", "💅🏼"]}
          />
        </>
      )}
    </section>
  );
};

export const LeftHero = ({ title }: { title: ReactNode }) => {
  return (
    <div className="flex flex-col justify-between max-w-xl mx-auto h-[80%] ">
      <h2 className="text-white lg:text-6xl text-5xl font-bold mt-auto">
        {title}
      </h2>
      <img
        className="mt-auto"
        width={80}
        src="/images/brand/logo_white.svg"
        alt="logo"
      />
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
        "transition-all rounded-full top-0 left-0 text-white text-3xl justify-center items-center block",
        "max-w-xl mx-auto",
        "active:opacity-50" // Improve please! 🥶
      )}
    >
      <HiOutlineArrowNarrowLeft />
    </button>
  );
};
