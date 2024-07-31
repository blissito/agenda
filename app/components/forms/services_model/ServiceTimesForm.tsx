import { twMerge } from "tailwind-merge";
import { Option, SelectInput } from "../SelectInput";
import { useForm } from "react-hook-form";
import { Form, useFetcher } from "@remix-run/react";
import { ServiceFormFooter } from "./ServiceGeneralForm";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";
import { WeekDaysType } from "../form_handlers/aboutYourCompanyHandler";
import { useState } from "react";
import { z } from "zod";
import { TimesForm } from "../TimesForm";

const tuple = z.array(z.array(z.string(), z.string())).optional();
const weekDaysSchema = z.object({
  lunes: tuple,
  martes: tuple,
  miércoles: tuple,
  jueves: tuple,
  sábado: tuple,
  domingo: tuple,
  viernes: tuple,
});
export const serviceTimesSchema = z.object({
  duration: z.coerce.number(),
  weekDays: weekDaysSchema.nullable(),
});

const OPTIONS: Option[] = [
  {
    title: "30 minutos",
    value: 30,
  },
  {
    title: "45 minutos",
    value: 45,
  },
  {
    title: "60 minutos",
    value: 60,
  },
  {
    title: "1 hora 15 minutos",
    value: 75,
  },
  {
    title: "1 hora 30 minutos",
    value: 90,
  },
  {
    title: "2 horas",
    value: 120,
  },
];
const initialValues = {
  duration: 30,
  weekDays: {},
};
export const ServiceTimesForm = () => {
  const fetcher = useFetcher();
  const [week, setWeek] = useState([]);
  const {
    // getValues,
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: { ...initialValues, localWeekDays: "inherit" },
  });

  const onSubmit = (values) => {
    const fullObj = {
      ...values,
      weekDays: localWeekDays === "specific" ? week : "",
    };
    console.log("fullObj:", fullObj);
    fetcher.submit(
      {
        data: JSON.stringify(fullObj),
        intent: "update_service",
      },
      { method: "post" }
    );
  };

  const localWeekDays: "inherit" | "specific" | string = watch("localWeekDays");

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)} className="mt-14">
        <SelectInput
          register={register}
          className="mt-8"
          options={OPTIONS}
          name="duration"
          placeholder="Selecciona una opción"
          label="¿Cuánto dura cada sesión?"
        />
        <div className="text-brand_gray">
          <p className="text-brand_dark font-satoMiddle">
            ¿En que horario ofrecerás este servicio?
          </p>
          <RadioButton
            name="localWeekDays"
            value="inherit"
            label="El mismo horario que mi negocio"
            register={register}
          />
          <RadioButton
            register={register}
            name="localWeekDays"
            value="specific"
            label="Un horario específico para este servicio"
          />
        </div>

        <ServiceFormFooter backButtonLink={""} isDisabled={!isValid} />
      </Form>
      {localWeekDays === "specific" && (
        <>
          <TimesForm
            submitButton={<></>}
            onChange={(data: WeekDaysType) => {
              setWeek(data);
              if (!Object.keys(data).length) {
                setValue("localWeekDays", "inherit");
              }
            }}
          />
        </>
      )}
    </>
  );
};

export const RadioButton = ({
  name,
  value,
  label,
  className,
  register,
  registerOptions = { required: REQUIRED_MESSAGE },
}: {
  register?: any;
  registerOptions?: any;
  name: string;
  value: string;
  label: string;
  className?: string;
}) => {
  return (
    <label
      htmlFor={value}
      className={twMerge("flex  items-start gap-2 mt-3", className)}
    >
      <input
        className="mt-1"
        type="radio"
        id={value}
        name={name}
        value={value}
        {...register?.(name, registerOptions)}
      />
      <span className="font-satoshi">{label}</span>
    </label>
  );
};
