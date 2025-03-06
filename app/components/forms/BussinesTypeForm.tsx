import { useEffect, useState } from "react";
import { Barbershop } from "../icons/business/barbershop";
import { MultipleOptions, Option, Otro } from "./MultipleOptions";
import { Sports } from "../icons/business/sports";
import { FaBusinessTime } from "react-icons/fa";
import { PrimaryButton } from "../common/primaryButton";
import { type FieldValues, useForm } from "react-hook-form";
import { Form, useFetcher } from "react-router";
import { type Org } from "@prisma/client";

export const OPTIONS = [
  "barbería",
  "estética",
  "centro deportivo",
  "consultorio médico",
  "estudios clínicos",
  "tutorias",
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
  "reparaciones",
  "hojalatería",
  "code review",
  "uñas",
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

export const BussinesTypeForm = ({ org }: { org: Org }) => {
  const fetcher = useFetcher();
  const [current, setCurrent] = useState<string>(org.businessType || "");
  const isOther = current !== "" && !OPTIONS.includes(current);
  const [isOtro, setIsOtro] = useState(isOther);
  const {
    formState: { isValid },
    register,
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      id: org.id,
      businessType: org?.businessType || "",
    },
  });

  useEffect(() => {
    register("businessType", { required: true });
  }, []);

  const handleOtroClick = () => {
    setIsOtro(true);
    setCurrent("");
    setValue("businessType", "", { shouldValidate: true });
  };

  const onSubmit = (values: FieldValues) => {
    fetcher.submit(
      {
        intent: "update_org",
        data: JSON.stringify(values),
        next: "/signup/3",
      },
      { method: "post" }
    );
  };

  const onCancel = () => {
    setValue("businessType", "", { shouldValidate: true });
    setCurrent("");
    setTimeout(() => {
      setIsOtro(false);
    }, 300);
  };

  const handleSelection = (option: string) => {
    setValue("businessType", option, { shouldValidate: true });
    setCurrent(option);
  };

  return (
    <>
      <Form
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        className="gap-4 px-4 h-full flex flex-col place-content-between	pt-0 lg:pt-20  max-w-xl mx-auto"
      >
        <MultipleOptions
          className="grid grid-cols-2 gap-4 md:pt-8"
          name="businessType"
          options={OPTIONS}
          renderFunction={(option: string, index: number) => {
            if (index === OPTIONS.length - 1) {
              return (
                <Otro
                  onCancel={onCancel}
                  label="Describe tu negocio"
                  name="businessType"
                  isActive={isOtro}
                  key={option}
                  onClick={handleOtroClick}
                  register={register}
                />
              );
            }
            if (isOtro) return null; // @todo remove?
            return (
              <Option
                key={option}
                label={option}
                onClick={() => handleSelection(option)}
                name="businessType"
                icon={getIconByOption(option)}
                capitalize
                isCurrent={current === option}
                register={register}
                transition={{ type: "spring", bounce: 0.3 }}
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
