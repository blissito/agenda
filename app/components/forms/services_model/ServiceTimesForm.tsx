import { twMerge } from "tailwind-merge";
import { type Option, SelectInput } from "../SelectInput";
import { useForm } from "react-hook-form";
import { Form, useFetcher } from "react-router";
import { REQUIRED_MESSAGE } from "~/routes/login/signup.$stepSlug";
import { useState, type RefObject } from "react";
import { z } from "zod";
import { TimesForm } from "../TimesForm";
import type { WeekSchema } from "~/utils/zod_schemas";

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

type ServiceTimesFields = z.infer<typeof serviceTimesSchema>;

const OPTIONS: Option[] = [
  {
    title: "15 minutos",
    value: 15,
  },
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
export const ServiceTimesForm = ({
  defaultValues = initialValues,
  onTimesChange,
  formRef,
}: {
  onTimesChange?: (t: WeekSchema) => void;
  formRef?: RefObject<HTMLFormElement>;
  defaultValues: ServiceTimesFields;
}) => {
  const fetcher = useFetcher();
  const [week, setWeek] = useState(defaultValues.weekDays);
  const {
    // getValues,
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      ...defaultValues,
      localWeekDays: defaultValues.weekDays ? "specific" : "inherit",
    },
  });

  const onSubmit = (values) => {
    const fullObj = {
      ...values,
      weekDays: localWeekDays === "specific" ? week : "",
    };

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
      <Form ref={formRef} className="mt-14">
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
      </Form>
      {localWeekDays === "specific" && (
        <>
          <TimesForm
            noSubmit
            org={{ weekDays: week }} // @TODO: hack, please improve
            submitButton={<></>}
            onChange={(data: WeekDaysType) => {
              console.info("TIMES: ", data); // remove?
              onTimesChange?.(data);
              const initialValues = {
                lunes: [
                  ["09:00", "16:00"],
                  ["17:00", "18:00"],
                ],
              };
              // console.log("?? ", data, !!Object.keys(data).length);
              if (Object.keys(data).length < 1) {
                setWeek(initialValues);
                setValue("localWeekDays", "inherit");
              } else {
                setWeek(data);
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
