import { useEffect, useState } from "react";
import { MultipleOptions, Option, Otro } from "./MultipleOptions";
import { PrimaryButton } from "../common/primaryButton";
import { type FieldValues, useForm } from "react-hook-form";
import { Form, useFetcher } from "react-router";
import { type Org } from "@prisma/client";

import { Barbershop } from "../icons/business/barbershop";
import { Beauty } from "../icons/business/beauty";
import { Sports } from "../icons/business/sports";
import { Clinic } from "../icons/business/clinic";
import { Class as ClassIcon } from "../icons/business/class";
import { Crossfit } from "../icons/business/corssfit";
import { Dance } from "../icons/business/dance";
import { Gym } from "../icons/business/gym";
import { Hair } from "../icons/business/hair";
import { Pet } from "../icons/business/pet";
import { Spa } from "../icons/business/spa";
import { Tourism } from "../icons/business/tourism";
import { Courses } from "../icons/business/courses";
import { Equipment } from "../icons/business/equipment";
import { Brain } from "../icons/business/brain";
import { Mat } from "../icons/business/mat";
import { Reformer } from "../icons/business/reformer";
import { Couch } from "../icons/business/couch";
import { Apple } from "../icons/business/apple";
import { ArrowRight } from "~/components/icons/arrowRight";

export const OPTIONS = [
  "barbería",
  "estética",
  "centro deportivo",
  "consultorio médico",
  "estudios clínicos",
  "crossfit",
  "coaching",
  "tutorias",
  "gimnasio",
  "yoga / meditación",
  "spa",
  "centro de idiomas",
  "nutriologo",
  "veterinaria",
  "danza / baile",
  "terapia física",
  "psicologo",
  "experiencias turisticas",
  "salon de belleza",
  "reparaciones",
  "hojalatería",
  "code review",
  "uñas",
  "otro",
];

const getIconByOption = (string?: string, fill = "#8391A1") => {
  switch (string) {
    case "barbería":
      return <Barbershop fill={fill} />;
    case "estética":
      return <Beauty fill={fill} />;
    case "centro deportivo":
      return <Sports fill={fill} />;
    case "consultorio médico":
      return <Clinic fill={fill} />;
    case "estudios clínicos":
      return <Clinic fill={fill} />;
    case "crossfit":
      return <Crossfit fill={fill} />;
    case "coaching":
      return <Couch fill={fill} />;
    case "tutorias":
      return <ClassIcon fill={fill} />;
    case "gimnasio":
      return <Gym fill={fill} />;
    case "yoga / meditación":
      return <Mat fill={fill} />;
    case "spa":
      return <Spa fill={fill} />;
    case "centro de idiomas":
      return <Courses fill={fill} />;
    case "nutriologo":
      return <Apple fill={fill} />;
    case "veterinaria":
      return <Pet fill={fill} />;
    case "danza / baile":
      return <Dance fill={fill} />;
    case "terapia física":
      return <Reformer fill={fill} />;
    case "psicologo":
      return <Brain fill={fill} />;
    case "experiencias turisticas":
      return <Tourism fill={fill} />;
    case "salon de belleza":
      return <Hair fill={fill} />;
    case "reparaciones":
      return <Equipment fill={fill} />;
    case "hojalatería":
      return <Equipment fill={fill} />;
    case "code review":
      return <Courses fill={fill} />;
    case "uñas":
      return <Beauty fill={fill} />;
    default:
      return <Barbershop fill={fill} />;
  }
};

export const BussinesTypeForm = ({ org }: { org: Org }) => {
  const fetcher = useFetcher();

  const initialCurrent = org.businessType || "";
  const initialCurrentNormalized = initialCurrent.trim().toLowerCase();
  const isOtherInitial =
    initialCurrent !== "" && !OPTIONS.includes(initialCurrentNormalized);

  const [current, setCurrent] = useState<string>(initialCurrent);
  const [isOtro, setIsOtro] = useState(isOtherInitial);

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
        next: "/signup/5",
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

  const currentNormalized = (current || "").trim().toLowerCase();

  return (
    <Form
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      className={[
        "w-full",
        "min-h-[calc(100vh-190px)]",
        "flex flex-col",
        "justify-center",
        "px-4 lg:px-0",
        "pt-10 lg:pt-0",
      ].join(" ")}
    >
      <div className="w-full max-w-6xl">
        <a
          href="/signup/3?screen=2"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
        >
          <span className="text-lg leading-none">‹</span> Volver
        </a>

        <h1 className="font-jakarta text-[24px] font-bold text-brand_dark">
          ¿Qué tipo de negocio tienes?
        </h1>

        <div className="mt-6">
          <MultipleOptions
            name="businessType"
            className="flex flex-wrap gap-3"
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

              if (isOtro) return null;

              const selected = currentNormalized === option.trim().toLowerCase();

              return (
                <Option
                  key={option}
                  label={option}
                  onClick={() => handleSelection(option)}
                  name="businessType"
                  icon={getIconByOption(option, selected ? "#5158F6" : "#8391A1")}
                  capitalize
                  isCurrent={selected}
                  register={register}
                  transition={{ type: "spring", bounce: 0.3 }}
                />
              );
            }}
            
          />
        </div>

        <div className="mt-10">
          <PrimaryButton
            isLoading={fetcher.state !== "idle"}
            isDisabled={!isValid}
            className="w-[190px]"
          >
            Continuar <ArrowRight />
          </PrimaryButton>
        </div>
      </div>
    </Form>
  );
};
