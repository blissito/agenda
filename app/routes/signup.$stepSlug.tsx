import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData, useNavigate } from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { ReactNode, useMemo } from "react";
import { AboutYourCompanyForm } from "~/components/forms/AboutYourCompanyForm";
import { BussinesTypeForm } from "~/components/forms/BussinesTypeForm";

export const SLUGS = ["sobre-tu-negocio", "tipo-de-negocio"];
export const REQUIRED_MESSAGE = "Este campo es requerido";
const FORM_COMPONENT_NAMES = ["AboutYourCompanyForm", "BussinesTypeForm"];
// @TODO: saving with real user
// @TODO: Show saved values when return (edit)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  // sobre-tu-negocio
  if (intent === SLUGS[0]) {
    const data = JSON.parse(formData.get("data") as string);
    console.log("SAVING: " + SLUGS[0], data);
  }
  // tipo-de-negocio
  if (intent === SLUGS[1]) {
    const data = JSON.parse(formData.get("data") as string);
    console.log("SAVING: " + SLUGS[1], data);
  }
  console.log("REDIRECTING:::");
  return redirect("/signup/" + SLUGS[1]);
};

const getStepComponentNameByStepSlug = (slug?: string) => {
  switch (slug) {
    case SLUGS[1]:
      return FORM_COMPONENT_NAMES[1];
    default:
      return FORM_COMPONENT_NAMES[0];
  }
};

// Section titles
const getTitleByStepSlug = (slug?: string) => {
  switch (slug) {
    case SLUGS[1]:
      return "¿Qué tipo de negocio tienes?";
    default:
      return "Cuéntanos más sobre tu negocio";
  }
};

export const loader = ({ params: { stepSlug } }: LoaderFunctionArgs) => {
  return {
    // stepSlug,
    stepComponentName: getStepComponentNameByStepSlug(stepSlug),
    title: getTitleByStepSlug(stepSlug),
  };
};
export default function Page() {
  const { stepComponentName, title } = useLoaderData<typeof loader>();

  const FormComponent = useMemo(() => {
    switch (stepComponentName) {
      case FORM_COMPONENT_NAMES[1]:
        return BussinesTypeForm;
      default:
        return AboutYourCompanyForm;
    }
  }, [stepComponentName]);

  return (
    <>
      <article className={twMerge("h-screen flex flex-col", "md:flex-row")}>
        <section
          className={twMerge("px-2", "bg-brand_blue", "md:flex-1 py-24")}
        >
          <BackButton />
          <MiniHero title={title} />
        </section>
        <section className="flex-1 overflow-hidden">
          <FormComponent />
        </section>
      </article>
    </>
  );
}

export const MiniHero = ({ title }: { title: ReactNode }) => {
  return (
    <div className="flex flex-col justify-between max-w-xl mx-auto h-[80%] ">
      <h2 className="text-white lg:text-6xl text-4xl font-bold mt-auto">
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
        "active:scale-95", // Improve please! 🥶
        "transition-all rounded-full top-0 left-0 text-white text-3xl justify-center items-center block",
        "max-w-xl mx-auto"
      )}
    >
      <HiOutlineArrowNarrowLeft />
    </button>
  );
};
