import { Form, useFetcher } from "@remix-run/react";
import { Switch } from "./Switch";
import { PrimaryButton } from "../common/primaryButton";
import { FieldValues, useForm } from "react-hook-form";
import { SLUGS } from "~/routes/signup.$stepSlug";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  getMinutesFromString,
  getStringFromMinutes,
  TimePicker,
} from "./TimePicker";

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
      weekDays: ["lunes"],
    },
  });

  const [rangeTemplate, setRangeTemplate] = useState(["07:00", "19:00"]);

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

    setValue(node.name, [...new Set(values)], { shouldValidate: true });
    if (!values.length) {
      setError(node.name, { message: ERROR_MESSAGE });
    }
    // node.checked ? setValue(node.name, node.value) : setValue(node.name, "");
  };

  const handleRange = (day: string, range: string[]) => {
    console.log("incoming Range: ", range);
    setRangeTemplate(range);
  };

  console.log("Global range? ", rangeTemplate);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={twMerge(
        "h-full pt-20 px-2  max-w-xl mx-auto",
        "flex flex-col justify-evenly h-full gap-5"
      )}
    >
      <DayTimesSelector
        range={rangeTemplate}
        onRange={(range) => handleRange("lunes", range)}
        isActive={getValues().weekDays.includes("lunes")}
      >
        <Switch
          defaultChecked={getValues().weekDays.includes("lunes")}
          name="weekDays"
          value="lunes"
          onChange={handleSwitchChange}
        />
      </DayTimesSelector>

      <DayTimesSelector
        defaultRange={rangeTemplate}
        isActive={getValues().weekDays.includes("martes")}
      >
        <Switch
          defaultChecked={getValues().weekDays.includes("martes")}
          name="weekDays"
          value="martes"
          onChange={handleSwitchChange}
        />
      </DayTimesSelector>

      <DayTimesSelector
        range={rangeTemplate}
        isActive={getValues().weekDays.includes("miércoles")}
      >
        <Switch
          defaultChecked={getValues().weekDays.includes("miércoles")}
          name="weekDays"
          value="miércoles"
          onChange={handleSwitchChange}
        />
      </DayTimesSelector>

      <DayTimesSelector
        range={rangeTemplate}
        onRange={(range) => handleRange("jueves", range)}
        isActive={getValues().weekDays.includes("jueves")}
      >
        <Switch
          defaultChecked={getValues().weekDays.includes("jueves")}
          name="weekDays"
          value="jueves"
          onChange={handleSwitchChange}
        />
      </DayTimesSelector>

      <DayTimesSelector
        range={rangeTemplate}
        isActive={getValues().weekDays.includes("viernes")}
      >
        <Switch
          defaultChecked={getValues().weekDays.includes("viernes")}
          name="weekDays"
          value="viernes"
          onChange={handleSwitchChange}
        />
      </DayTimesSelector>
      <DayTimesSelector
        // range={rangeTemplate}
        isActive={getValues().weekDays.includes("sábado")}
      >
        <Switch name="weekDays" value="sábado" onChange={handleSwitchChange} />
      </DayTimesSelector>
      <DayTimesSelector
        // range={rangeTemplate}
        isActive={getValues().weekDays.includes("domingo")}
      >
        <Switch name="weekDays" value="domingo" onChange={handleSwitchChange} />
      </DayTimesSelector>
      <div className="mt-auto">
        {" "}
        <PrimaryButton
          className="w-full "
          isDisabled={!isValid || (errors.weekDays ? true : false)}
          type="submit"
        >
          Continuar
        </PrimaryButton>
        <p className="m-1 text-red-500 text-xs">{errors.weekDays?.message}</p>
      </div>
    </Form>
  );
};

const DayTimesSelector = ({
  children,
  onRange,
  isActive,
  range,
  defaultRange,
}: {
  defaultRange?: string[];
  onRange?: (arg0: string[]) => void;
  range?: string[];
  isActive?: boolean;
  children?: ReactNode;
}) => {
  const startTime = range?.[0] || defaultRange?.[0];
  const endTime = range?.[1] || defaultRange?.[1];

  const handleChange = (startT: string, endT: string) => {
    onRange?.([startT, endT]);
  };

  const handleSecondChange = (startT: string) => {
    onRange?.([range[0], startT]);
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ y: -10, opacity: 0 }}
            className={twMerge("gap-4 items-center", isActive && "flex")}
          >
            <span>De</span>
            <TimePicker startTime={startTime} onChange={handleChange} />
            <span>a</span>
            <TimePicker startTime={endTime} onChange={handleSecondChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
