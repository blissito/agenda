import { useState } from "react";
import { Barbershop } from "../icons/business/barbershop";
import { MultipleOptions, Option, Otro } from "./MultipleOptions";
import { Sports } from "../icons/business/sports";
import { FaBusinessTime } from "react-icons/fa";
import { PrimaryButton } from "../common/primaryButton";
import { FieldValues, useForm } from "react-hook-form";
import { Form, useFetcher } from "@remix-run/react";
import { SLUGS } from "~/routes/signup.$stepSlug";
import { Org } from "@prisma/client";

const OPTIONS = [
  "barbería",
  "estética",
  "centro deportivo",
  "consultorio médico",
  "estudios clínicos",
  "clases",
  "podólogo",
  "nutriologo",
  "crossfit",
  "danza / baile",
  "gimnasio",
  "psicologo",
  "salon de belleza",
  "veterinaria",
  "spa",
  "experiencias turisticas",
  "yoga / meditación",
  "coaching",
  "terapia física",
  "otro",
];

const getIconByOption = (string?: string) => {
  switch (string) {
    case "estética":
      return (
        <span className="text-neutral-500">
          <FaBusinessTime />
        </span>
      );
    case "centro deportivo":
      return <Sports />;
    default:
      return <Barbershop fill={"#8391A1"} />;
  }
};

export const BussinesTypeForm = ({ org }: { org?: Org }) => {
  const fetcher = useFetcher();
  const [current, set] = useState<string>(org?.businessType);
  const [isOtro, setIsOtro] = useState(false);
  const {
    formState: { isValid },
    register,
    handleSubmit,
    setValue,
    // watch,
  } = useForm({
    defaultValues: {
      businessType: org?.businessType || "",
    },
  });

  const handleOptionClick = (option: string) => {
    setIsOtro(false);
    set(option);
    setValue("businessType", option, {
      shouldValidate: true,
      //   shouldDirty: true,
      //   shouldTouch: true,
    });
  };

  const handleOtroClick = () => {
    console.log("WTF otro", current);
    setIsOtro(true);
    set("");
    setValue("businessType", "", { shouldValidate: true });
  };

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      // tipo-de-negocio
      { intent: SLUGS[1], data: JSON.stringify(values) },
      { method: "post" }
    );
  };

  return (
    <>
      <Form
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className="gap-4 px-4 h-full flex flex-col place-content-between	pt-0 lg:pt-20  max-w-xl mx-auto"
      >
        <MultipleOptions
          //   error={errors["businessType"]}
          className="grid grid-cols-2 gap-4 md:pt-8"
          name="businessType"
          options={OPTIONS}
          renderFunction={(option: string, index: number) => {
            if (index === OPTIONS.length - 1) {
              return (
                <Otro
                  // className="mt-[35vh]"
                  onCancel={() => setIsOtro(false)}
                  label="Describe tu negocio"
                  name="businessType"
                  isActive={isOtro}
                  key={option}
                  onClick={handleOtroClick}
                  register={register}
                />
              );
            }
            if (isOtro) return null;
            return (
              <Option
                capitalize
                name="businessType"
                register={register}
                transition={{ type: "spring", bounce: 0.3 }}
                onClick={() => handleOptionClick(option)}
                isCurrent={current === option}
                key={option}
                option={option}
                icon={getIconByOption(option)}
              />
            );
          }}
        />
        <PrimaryButton
          isLoading={fetcher.state !== "idle"}
          isDisabled={!isValid}
          className="mt-8 md:mt-auto mb-8"
        >
          Continuar
        </PrimaryButton>
      </Form>
    </>
  );
};
