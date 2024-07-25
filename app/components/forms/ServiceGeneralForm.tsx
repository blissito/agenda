import { ChangeEvent } from "react";
import type { FieldError, FieldValues, UseFormRegister } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { REQUIRED_MESSAGE } from "~/routes/signup.$stepSlug";
import { BasicInput } from "./BasicInput";
import { Options, SelectInput } from "./SelectInput";

const OPTIONS: Options[] = [
  {
    value: "En sucursal",
  },
  {
    value: "A domicilio",
  },
  {
    value: "En línea",
  },
];

type Props = {
  name: string;
  register?: UseFormRegister<FieldValues> | any;
  error?: FieldError;
  label?: string;
  className?: string;
  registerOptions?: { required: string | boolean };
  placeholder?: string;
  // onChange?: (arg0: ChangeEvent<HTMLInputElement>) => void;
};

export const ServiceGeneralForm = () => {
  return (
    <section className="flex flex-col mx-auto max-w-xl  ">
      <BasicInput
        label="Nombre del servicio"
        name="rewards"
        registerOptions={{ required: REQUIRED_MESSAGE }}
      />

      <BasicInput
        label="Precio"
        name="rewards"
        registerOptions={{ required: REQUIRED_MESSAGE }}
      />
      <BasicInput
        label="¿A cuántos puntos de recompensas equivale el servicio?"
        name="rewards"
        registerOptions={{ required: REQUIRED_MESSAGE }}
      />
      <SelectInput
        name="appoitment place"
        placeholder="selecciona"
        label="Tipo de cita"
        options={OPTIONS}
      />

      <BasicInput
        label="Descripción"
        name="rewards"
        registerOptions={{ required: REQUIRED_MESSAGE }}
      />
    </section>
  );
};
