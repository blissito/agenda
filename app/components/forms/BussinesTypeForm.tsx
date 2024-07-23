import { useEffect, useState } from "react";
import { Barbershop } from "../icons/business/barbershop";
import { MultipleOptions, Option, Otro } from "./MultipleOptions";
import { Sports } from "../icons/business/sports";
import { FaBusinessTime } from "react-icons/fa";
import { PrimaryButton } from "../common/primaryButton";
import { FieldValues, useForm } from "react-hook-form";
import { Form, useFetcher } from "@remix-run/react";
import { SLUGS } from "~/routes/signup.$stepSlug";

const OPTIONS = [
  "barbería",
  "estética",
  "centro deportivo",
  "consultorio médico",
  "estudios clínicos",
  "clases",
  "centro de idiomas",
  "nutriologo",
  "crossfit",
  "danza / baile",
  "gimnasio",
  "psicologo",
  "salon de belleza",
  "veterinaria",
  "spa",
  "experiencias futurísticas",
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

export const BussinesTypeForm = () => {
  const fetcher = useFetcher();
  const [current, set] = useState<string>("");
  const [isOtro, setIsOtro] = useState(false);
  const {
    formState: { isValid, errors },
    register,
    handleSubmit,
    setValue,
    // watch,
  } = useForm({
    defaultValues: {
      businessType: "",
    },
  });

  const handleOptionClick = (option: string) => {
    console.log("WTF option", option);
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
        onSubmit={handleSubmit(onSubmit)}
        className="gap-4 px-4 h-full flex flex-col place-content-center pt-8 max-w-xl mx-auto"
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
                  className="mt-[35vh]"
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
        <PrimaryButton isDisabled={!isValid} className="mt-auto mb-8">
          Continuar
        </PrimaryButton>
      </Form>
    </>
  );
};
