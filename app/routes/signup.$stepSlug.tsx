import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { AboutYourCompanyForm } from "~/components/forms/AboutYourCompanyForm";
import { BussinesTypeForm } from "~/components/forms/BussinesTypeForm";
import { TimesForm } from "~/components/forms/TimesForm";
import { Agenda } from "~/components/icons/menu/agenda";
import { PrimaryButton } from "~/components/common/primaryButton";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { getFirstOrgOrNull } from "~/db/userGetters";
import {
  aboutYourCompanyHandler,
  timesHandler,
  typeOfBusinessHandler,
} from "~/components/forms/form_handlers/aboutYourCompanyHandler";
import { Denik } from "~/components/icons/denik";

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
  "LoaderScreen",
];

// @TODO: check mobile sizes
// @TODO: saving with real user  1/3[]
// @TODO: Show saved values when return (edit) 1/3[]
// @TODO: secure route loader?
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const data = JSON.parse(formData.get("data") as string);
  // sobre-tu-negocio
  if (intent === SLUGS[0]) return await aboutYourCompanyHandler(request, data);
  // tipo-de-negocio
  if (intent === SLUGS[1]) return await typeOfBusinessHandler(request, data);
  // horario
  // @todo: remove back stack
  if (intent === SLUGS[2]) return await timesHandler(request, data);
  console.log("MISSING:::Intent:::", intent);
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
  // Components here ========================================================================================= <=
  const FormComponent = useMemo(() => {
    switch (stepComponentName) {
      case FORM_COMPONENT_NAMES[3]:
        return LoaderScreen;
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
    <article className={twMerge("h-screen flex flex-col", "md:flex-row")}>
      <section
        className={twMerge(
          "md:px-2 flex flex-col justify-between px-[5%] sticky",
          "bg-brand_blue",
          "md:flex-1 pt-8  md:pt-10 pb-8"
        )}
      >
        <BackButton />
        <LeftHero title={title} />
        <DenikWatermark />
      </section>
      <section className="flex-1 ">
        <FormComponent title={title} org={org} />
      </section>
    </article>
  );
}

export const LoaderScreen = ({ title }: { title: string }) => {
  const [text, setText] = useState(title);
  const [show, set] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      set(true);
      setText("¡Todo esta listo! \n Es hora de agendar ");
    }, 2000);
  }, []);
  return (
    <section className="font-bold absolute z-10 inset-0 bg-brand_blue  text-white flex justify-center items-center flex-col">
      <h1 className="px-[5%] md:px-10 min-w-7xl  mx-auto flex flex-col items-center md:flex-row gap-6 md:gap-12 text-3xl text-center md:text-left md:text-5xl ">
        <img className="w-[120px] h-[120px]" src="/images/calendar.gif" />
        <span className="leading-tight" style={{ whiteSpace: "pre-wrap" }}>
          {text}
        </span>
      </h1>
      {show && (
        <>
          <PrimaryButton
            to="/dash"
            as="Link"
            className="border mt-12 text-brand_dark bg-white font-satoMiddle "
            // isDisabled={isDisabled}
            type="submit"
          >
            ¡Ver mi agenda!
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
        "active:opacity-50" // Improve please! 🥶
      )}
    >
      <HiOutlineArrowNarrowLeft />
      <Denik fill="#ffffff" className="block lg:hidden h-10" />
    </button>
  );
};

export const DenikWatermark = () => {
  const navigate = useNavigate();
  return (
    <div
      className={twMerge(
        " w-full",
        "transition-all top-0 left-0 text-white text-3xl justify-center items-center block",
        "max-w-xl mx-auto",
        "active:opacity-50" // Improve please! 🥶
      )}
    >
      <Denik fill="#ffffff" className="hidden lg:block" />
    </div>
  );
};
