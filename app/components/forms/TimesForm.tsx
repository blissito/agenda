import { Form, useFetcher } from "@remix-run/react";
import { Switch } from "./Switch";
import { PrimaryButton } from "../common/primaryButton";
import { useForm } from "react-hook-form";
import { SLUGS } from "~/routes/signup.$stepSlug";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
// @TODO: improve animation presence
import {
  getMinutesFromString,
  getStringFromMinutes,
  TimePicker,
} from "./TimePicker";
import { nanoid } from "nanoid";

export type DayTuple = [string, string][];
export type WeekTuples = {
  lunes?: DayTuple;
  martes?: DayTuple;
  miércoles?: DayTuple;
  jueves?: DayTuple;
  viernes?: DayTuple;
  sábado?: DayTuple;
  domingo?: DayTuple;
};
const initialValues: WeekTuples = {
  lunes: [
    ["09:00", "14:00"],
    ["15:00", "18:00"],
  ],
};

const RANGE_TEMPLATE = ["09:00", "14:00"];
export const ERROR_MESSAGE = "Debes seleccionar al menos un día";

export const TimesForm = () => {
  const fetcher = useFetcher();
  const [data, setData] = useState<WeekTuples>(initialValues);
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

  const onSubmit = () => {
    // @TODO: validate?
    fetcher.submit(
      // tipo-de-negocio
      { intent: SLUGS[2], data: JSON.stringify(data) },
      { method: "post" }
    );
  };

  const handleSwitchChange = (node: HTMLInputElement) => {
    let action: "adding" | "removing";
    clearErrors();
    const values = getValues()[node.name];
    if (node.checked) {
      action = "adding";
      values.push(node.value);
    } else {
      action = "removing";
      values.splice(
        values.findIndex((v: string) => v === node.value),
        1
      );
    }

    setValue(node.name, [...new Set(values)], { shouldValidate: true });
    if (!values.length) {
      setError(node.name, { message: ERROR_MESSAGE });
    }
    // copy ranges for new active day
    toggleRange(action, node.id);
  };

  const toggleRange = (action: "adding" | "removing", dayString: string) => {
    if (action === "adding") {
      const dayValues = Object.values(data);
      const copy = dayValues.length
        ? dayValues[dayValues.length - 1]
        : [RANGE_TEMPLATE];
      setData((data) => ({ ...data, [dayString]: copy }));
    } else if (action === "removing") {
      const d = { ...data };
      delete d[dayString];
      setData(d);
    }
  };

  const addRange = (dayString: string) => {
    if (data[dayString]?.length) {
      setData((d) => {
        console.log("DATA_INSIDE", d);
        const lastRange = d[dayString][d[dayString].length - 1];
        if (!Array.isArray(lastRange)) return d;
        const nextRange = [
          getStringFromMinutes(getMinutesFromString(lastRange[1]) + 60),
          getStringFromMinutes(getMinutesFromString(lastRange[1]) + 120),
        ];
        return {
          ...d,
          [dayString]: [...d[dayString], nextRange],
        };
      });
    }
  };

  const removeRange = (day: string, index: number) => {
    const arr = [...data[day]];
    const r = arr.splice(index, 1);
    // console.log("REMOVED? ", r);
    setData((d) => ({ ...d, [day]: arr }));
  };

  const handleUpdate = (day: string, ranges: string[][]) => {
    setData((d) => ({ ...d, [day]: ranges }));
  };

  useEffect(() => {
    // console.log("DATA: ", data);
  }, [data]);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className={twMerge(
        "h-full pt-20 px-2  max-w-xl mx-auto",
        "flex flex-col justify-evenly h-full gap-5"
      )}
    >
      {/* Switches */}
      {[
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado",
        "domingo",
      ].map((dayString: string) => (
        <DayTimesSelector
          key={dayString}
          ranges={data[dayString]}
          addRange={() => addRange(dayString)}
          removeRange={(index) => removeRange(dayString, index)}
          updateRanges={(ranges) => handleUpdate(dayString, ranges)}
          // onRange={(range) => handleRange(dayString, range)}
          isActive={getValues().weekDays.includes(dayString)}
          id={dayString}
        >
          <Switch
            defaultChecked={getValues().weekDays.includes(dayString)}
            name="weekDays"
            value={dayString}
            onChange={handleSwitchChange}
          />
        </DayTimesSelector>
      ))}

      <div className="mt-auto">
        {" "}
        <PrimaryButton
          className="w-full mt-auto"
          isDisabled={!isValid || (errors.weekDays ? true : false)}
          type="submit"
        >
          Continuar
        </PrimaryButton>
        <p className="mb-10 ml-2 h-1 text-red-500 text-xs">
          {errors.weekDays?.message}
        </p>
      </div>
    </Form>
  );
};

const DayTimesSelector = ({
  children,
  addRange,
  removeRange,
  isActive,
  ranges = [],
  updateRanges,
}: {
  id: string;
  ranges: string[][];
  addRange?: (arg0: string[]) => void;
  removeRange?: (arg0: number) => void;
  updateRanges?: (ranges: string[][]) => void;
  range?: string[];
  isActive?: boolean;
  children?: ReactNode;
}) => {
  const handleChange = (index: number, range: string[]) => {
    const arr = [...ranges];
    arr[index] = range;
    updateRanges?.(arr);
  };

  return (
    <div>
      {children}

      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ y: -10, opacity: 0 }}
          className={twMerge(
            "gap-4",
            isActive && "flex flex-wrap",
            "text-brand_gray mt-2"
          )}
        >
          {ranges.map((range, index) => (
            <RangeTimePicker
              index={index}
              onChange={(range) => handleChange(index, range)}
              key={nanoid()}
              startTime={range[0]}
              endTime={range[1]}
              onDelete={
                ranges.length - 1 === index
                  ? undefined
                  : () => removeRange?.(index)
              }
            />
          ))}

          <button
            type="button"
            onClick={addRange}
            className="active:text-brand_gray text-brand_gray/80"
          >
            + Agregar
          </button>
        </motion.div>
      )}
    </div>
  );
};

export const RangeTimePicker = ({
  index,
  startTime,
  endTime,
  onChange,
  onDelete,
}: {
  index?: number;
  onDelete?: (arg0: string, arg1: number) => void;
  startTime: string;
  endTime: string;
  onChange?: (arg0: string[]) => void;
}) => {
  const handleChange = (st: string, et: string, isStartTime: boolean) => {
    onChange?.(isStartTime ? [st, endTime] : [startTime, st]);
  };

  // console.log("St end: ", startTime, endTime);

  return (
    <motion.div
    // layoutId={startTime + endTime}
    // initial={{ opacity: 0, x: 20 }}
    // animate={{ opacity: 1, x: 0 }}
    // exit={{ opacity: 0 }}
    >
      {" "}
      <div className="relative flex items-center gap-3">
        <span>De</span>
        <TimePicker
          startTime={startTime}
          onChange={(a, b) => handleChange(a, b, true)}
        />
        <span>a</span>
        <TimePicker
          startTime={endTime}
          onChange={(a, b) => handleChange(a, b, false)}
        />
        {onDelete && (
          <button
            onClick={onDelete}
            type="button"
            className="absolute active:text-red-500 -right-5 top-[28%] text-red-100 hover:text-red-300 transition-all"
          >
            <FaRegTrashCan />
          </button>
        )}
      </div>
    </motion.div>
  );
};
