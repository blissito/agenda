import { Form, useFetcher } from "@remix-run/react";
import { Switch } from "./Switch";
import { PrimaryButton } from "../common/primaryButton";
import { FieldValues, useForm } from "react-hook-form";
import { SLUGS } from "~/routes/signup.$stepSlug";
import { twMerge } from "tailwind-merge";

export const ERROR_MESSAGE = "Debes seleccionar al menos un día";
export const TimesForm = () => {
  const fetcher = useFetcher();
  const {
    clearErrors,
    setValue,
    getValues,
    setError,
    formState: { isValid, errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      weekDays: ["lunes", "martes", "miércoles", "jueves", "viernes"],
    },
  });

  const onSubmit = (values: FieldValues) => {
    // console.log("VALS?", values);
    if (!values.weekDays.length) {
      setError("weekDays", { message: ERROR_MESSAGE });
    }
    fetcher.submit(
      // tipo-de-negocio
      { intent: SLUGS[2], data: JSON.stringify(values) },
      { method: "post" }
    );
  };

  const handleSwitchChange = (node: HTMLInputElement) => {
    clearErrors();
    const values = getValues()[node.name];
    if (node.checked) {
      values.push(node.value);
    } else {
      values.splice(
        values.findIndex((v: string) => v === node.value),
        1
      );
    }

    setValue(node.name, values, { shouldValidate: true });
    if (!values.length) {
      setError(node.name, { message: ERROR_MESSAGE });
    }
    // node.checked ? setValue(node.name, node.value) : setValue(node.name, "");
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={twMerge(
        "h-full py-20 px-2  max-w-xl mx-auto",
        "flex flex-col justify-evenly h-full"
      )}
    >
      <Switch
        defaultChecked
        name="weekDays"
        value="lunes"
        onChange={handleSwitchChange}
      />
      <Switch
        defaultChecked
        name="weekDays"
        value="martes"
        onChange={handleSwitchChange}
      />
      <Switch
        defaultChecked
        name="weekDays"
        value="miércoles"
        onChange={handleSwitchChange}
      />
      <Switch
        defaultChecked
        name="weekDays"
        value="jueves"
        onChange={handleSwitchChange}
      />
      <Switch
        defaultChecked
        name="weekDays"
        value="viernes"
        onChange={handleSwitchChange}
      />
      <Switch name="weekDays" value="sábado" onChange={handleSwitchChange} />
      <Switch name="weekDays" value="domingo" onChange={handleSwitchChange} />

      <div>
        {" "}
        <PrimaryButton
          className="w-full mt-4"
          isDisabled={!isValid || (errors.weekDays ? true : false)}
          type="submit"
        >
          Continuar
        </PrimaryButton>
        <p className="m-2 text-red-500 text-xs">{errors.weekDays?.message}</p>
      </div>
    </Form>
  );
};
