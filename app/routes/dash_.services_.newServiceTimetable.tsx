import { PrimaryButton } from "~/components/common/primaryButton";
import { useFetcher, useNavigate } from "@remix-run/react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { BasicInput } from "~/components/forms/BasicInput";
import { TextAreaInput } from "~/components/forms/TextAreaInput";
import { Options, SelectInput } from "~/components/forms/SelectInput";
import { twMerge } from "tailwind-merge";

const OPTIONS: Options[] = [
  {
    value: "30 minutos",
  },
  {
    value: "45 minutos",
  },
  {
    value: "60 minutos",
  },
  {
    value: "1 hora 15 minutos",
  },
  {
    value: "1 hora 30 minutos",
  },
  {
    value: "2 horas",
  },
];

export default function NewServiceTimetable() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <main className="max-w-xl mx-auto pt-20  min-h-screen relative ">
      <h2 className="text-4xl font-bold font-title text-center leading-tight">
        Define tu horario
      </h2>
      <ServiceTimetableForm />
      <div className="h-[96px] bg-white/40 mx-auto w-full flex absolute backdrop-blur bottom-0  justify-between items-center ">
        <PrimaryButton
          className="bg-transparent text-brand_dark font-satoMiddle 	"
          isLoading={fetcher.state !== "idle"}
          type="submit"
          onClick={() => {
            navigate(-1);
          }}
        >
          <FaArrowLeftLong />
          Volver
        </PrimaryButton>
        <PrimaryButton isLoading={fetcher.state !== "idle"} type="submit">
          Continuar
        </PrimaryButton>
      </div>
    </main>
  );
}

const ServiceTimetableForm = () => {
  return (
    <section className="mt-14">
      <SelectInput
        className="mt-8"
        options={OPTIONS}
        name="location"
        placeholder="Selecciona una opción"
        label="¿Cuánto dura cada sesión?"
      />
      <div className="text-brand_gray">
        <p className="text-brand_dark font-satoMiddle">
          ¿En que horario ofrecerás este servicio?
        </p>
        <RadioButton
          name="week"
          value="timeTable"
          label="El mismo horario que mi negocio"
        />
        <RadioButton
          name="week"
          value="specifictime"
          label="  Un horario específico para este servicio"
        />
      </div>
    </section>
  );
};

export const RadioButton = ({
  name,
  value,
  label,
  className,
}: {
  name: string;
  value: string;
  label: string;
  className?: string;
}) => {
  return (
    <div className={twMerge("flex  items-start gap-2 mt-3", className)}>
      <input
        className="mt-1"
        type="radio"
        id={value}
        name={name}
        value={value}
      />
      <label htmlFor="timetable " className="font-satoshi">
        {label}
      </label>
    </div>
  );
};
