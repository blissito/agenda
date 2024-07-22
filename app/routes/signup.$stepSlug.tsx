import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { PrimaryButton } from "~/components/common/primaryButton";
import { BasicInput } from "~/components/formInputs/BasicInput";
import { MultipleOptions } from "~/components/formInputs/MultipleOptions";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];
const SLUGS = ["sobre-tu-negocio", "tipo-de-negocio"];

const getStepComponentNameByStepSlug = (slug?: string) => {
  switch (slug) {
    case SLUGS[1]:
      return "BussinesType";
    default:
      return "AboutYourCompany";
  }
};

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
    stepSlug,
    stepComponentName: getStepComponentNameByStepSlug(stepSlug),
    title: getTitleByStepSlug(stepSlug),
  };
};
export default function Page() {
  const { stepSlug, stepComponentName, title } = useLoaderData<typeof loader>();

  const Component = () => {
    switch (stepComponentName) {
      default:
        return <AboutYourCompany />;
    }
  };

  console.log("stepSlug: ", stepSlug);

  return (
    <>
      <article className="h-screen flex">
        <section
          // style={{ display: "none" }}
          className={twMerge(
            "px-2",

            "bg-brand_blue flex-1 md:grid hidden"
          )}
        >
          <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
            <h2 className="text-white lg:text-6xl text-4xl font-bold">
              {title}
            </h2>
            <AbsoluteCentered className="pb-8 px-2">
              <img
                width={80}
                className="mt-auto"
                src="/images/brand/logo_white.svg"
                alt="logo"
              />
            </AbsoluteCentered>
          </div>
        </section>
        <section className="flex-1 overflow-hidden">
          <Component />
        </section>
      </article>
    </>
  );
}

const AboutYourCompany = () => {
  return (
    <>
      <Form
        className={twMerge(
          "relative",
          "flex flex-col mx-auto max-w-xl h-full justify-center px-2"
        )}
      >
        <BasicInput name="name" label="¿Cómo se llama tu negocio?" />
        <BasicInput
          name="shopkeeper"
          label="Tu nombre o del profesional que atiende tu negocio "
        />
        <BasicInput name="address" label="Ubicación de tu negocio (opcional)" />
        <MultipleOptions
          label="¿Cuantas personas trabajan en tu negocio?"
          name="numberOfEmployees"
          options={OPTIONS}
        />
        <AbsoluteCentered className="px-24 pb-8">
          <PrimaryButton>Continuar</PrimaryButton>
        </AbsoluteCentered>
      </Form>
    </>
  );
};

export const AbsoluteCentered = ({
  className,
  ...props
}: {
  className?: string;
  [props: string]: any;
}) => (
  <div
    className={twMerge(
      "absolute bottom-0 w-full left-0 flex flex-col",
      className
    )}
    {...props}
  />
);
