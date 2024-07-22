import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  redirect,
  useFetcher,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { PrimaryButton } from "~/components/common/primaryButton";
import { BasicInput } from "~/components/formInputs/BasicInput";
import { MultipleOptions } from "~/components/formInputs/MultipleOptions";
import { FieldValues, useForm } from "react-hook-form";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { useMemo } from "react";

const OPTIONS = ["Solo yo", "2", "3 a 5", "6 a 14", "15 o más"];
const SLUGS = ["sobre-tu-negocio", "tipo-de-negocio"];
export const REQUIRED_MESSAGE = "Este campo es requerido";
const FORM_COMPONENT_NAMES = ["AboutYourCompanyForm", "BussinesTypeForm"];
// @TODO: saving with real user
// @TODO: Show saved values when return (edit)
export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === SLUGS[0]) {
    const data = JSON.parse(formData.get("data") as string);
    console.log("SAVING: ", data);
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
  const navigate = useNavigate();
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
      <article className={twMerge("h-screen flex", "md:flex-row", "flex-col")}>
        <section
          className={twMerge("px-2", "bg-brand_blue", "md:flex-1 py-24")}
        >
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
        </section>
        <section className="flex-1 overflow-hidden">
          <FormComponent />
        </section>
      </article>
    </>
  );
}

const BussinesTypeForm = () => <h1>Form Para tipo de negocio WIP 🚧</h1>;

const AboutYourCompanyForm = () => {
  const fetcher = useFetcher();
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
    // watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      shopkeeper: "",
      numberOfEmployees: "",
      address: "",
    },
  });

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      // about-your-company
      { intent: SLUGS[0], data: JSON.stringify(values) },
      { method: "post" }
    );
  };

  const isDisabled = !isValid;
  console.log("Disabled: ", isDisabled);

  return (
    <>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className={twMerge(
          "relative",
          "flex flex-col mx-auto max-w-xl h-full justify-center px-2"
        )}
      >
        <BasicInput
          label="¿Cómo se llama tu negocio?"
          name="name"
          error={errors["name"]}
          register={register}
          registerOptions={{ required: REQUIRED_MESSAGE }}
        />
        <BasicInput
          name="shopkeeper"
          register={register}
          registerOptions={{ required: REQUIRED_MESSAGE }}
          label="Tu nombre o del profesional que atiende tu negocio"
          error={errors["shopkeeper"]}
        />
        <BasicInput
          name="address"
          registerOptions={{ required: false }}
          label="Dirección de tu negocio (opcional)"
          error={errors["address"]}
          register={register}
        />
        <MultipleOptions
          defaultValue={null}
          error={errors["numberOfEmployees"]}
          label="¿Cuantas personas trabajan en tu negocio?"
          name="numberOfEmployees"
          options={OPTIONS}
          register={register}
          registerOptions={{ required: REQUIRED_MESSAGE }}
        />
        <AbsoluteCentered className="px-2 pb-8">
          <PrimaryButton isDisabled={isDisabled} type="submit">
            Continuar
          </PrimaryButton>
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
