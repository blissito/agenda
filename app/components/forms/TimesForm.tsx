import { Form, useFetcher } from "react-router";
import { Switch } from "./Switch";
import { PrimaryButton } from "../common/primaryButton";
import { useForm } from "react-hook-form";
import { SLUGS } from "~/routes/login/signup.$stepSlug";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { type ReactNode, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
// @TODO: improve animation presence
import {
  getMinutesFromString,
  getStringFromMinutes,
  TimePicker,
} from "./TimePicker";
import { nanoid } from "nanoid";
import { type Org } from "@prisma/client";

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

const ENTIRE_WEEK = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];
// @TODO: remove unnecesary types
const initialValues: WeekDaysType = {
  lunes: [["09:00", "16:00"]],
};

const RANGE_TEMPLATE = ["09:00", "14:00"];
export const ERROR_MESSAGE = "Debes seleccionar al menos un día";

export const TimesForm = ({
  org,
  onChange,
  onSubmit,
  children,
}: {
  children?: ReactNode; // acting as footer
  onChange?: (data: WeekDaysType) => void;
  onSubmit?: (data: WeekDaysType) => void;
  org?: Org;
}) => {
  const fetcher = useFetcher();
  const [data, setData] = useState<WeekDaysType>(
    org?.weekDays || initialValues // @TODO custom aliases
  );
  const initialData = org?.weekDays
    ? Object.keys(org?.weekDays as WeekDaysType)
    : Object.keys(initialValues);
  const {
    clearErrors,
    setValue,
    getValues,
    setError,
    formState: { isValid, errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      weekDays: initialData,
    },
  });

  const submit = () => {
    if (onSubmit) {
      onSubmit(data);
      return; // @todo this is no necessary, is doing the same ?
    }
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
      // if (data[dayString].length > 5) return console.error("ONLY 6 PERMITED");
      setData((d) => {
        const dd = JSON.parse(JSON.stringify(d));
        const lastRange = dd[dayString].pop();
        const nextH = getStringFromMinutes(
          getMinutesFromString(lastRange[1]) + 30
        );

        if (!Array.isArray(lastRange)) return d;
        const nextRange = [
          nextH,
          // getStringFromMinutes(getMinutesFromString(lastRange[1])),
          getStringFromMinutes(getMinutesFromString(lastRange[1]) + 60),
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
    arr.splice(index, 1);
    // console.log("REMOVED? ", r);
    setData((d) => ({ ...d, [day]: arr }));
  };

  const handleUpdate = (day: string, ranges: string[][]) => {
    // console.log("UPDATE", day, ranges);
    setData((d) => ({ ...d, [day]: ranges }));
  };

  useEffect(() => {
    // console.log("DATA: ", data);
    onChange?.(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isDisabled = !isValid || (errors.weekDays ? true : false);

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className={twMerge(
        "h-full pt-6 md:pt-20 px-[5%] md:px-2  max-w-xl mx-auto",
        "flex flex-col justify-evenly h-full gap-5 text-brand_dark"
      )}
    >
      {/* Switches */}
      {ENTIRE_WEEK.map((dayString: string) => (
        <DayTimesSelector
          key={dayString}
          ranges={data[dayString]}
          addRange={() => addRange(dayString)}
          onRemoveRange={(index) => removeRange(dayString, index)}
          onUpdate={(ranges) => handleUpdate(dayString, ranges)}
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
        {children ? (
          children
        ) : (
          <PrimaryButton
            isLoading={fetcher.state !== "idle"}
            className="w-full mt-auto"
            isDisabled={isDisabled}
            type="submit"
          >
            Continuar
          </PrimaryButton>
        )}
        <p className="mb-8 ml-2 h-auto text-red-500 text-xs">
          {errors.weekDays?.message}
        </p>
      </div>
    </Form>
  );
};

export const DayTimesSelector = ({
  children,
  addRange,
  onRemoveRange,
  isActive,
  ranges = [],
  onUpdate,
}: {
  ranges: DayTuple;
  addRange?: () => void;
  onRemoveRange?: (arg0: number) => void;
  onUpdate?: (ranges: string[][]) => void;
  range?: string[];
  isActive?: boolean;
  children?: ReactNode;
}) => {
  const handleChange = (index: number, range: string[]) => {
    const arr = [...ranges];
    arr[index] = range;
    onUpdate?.(arr);
  };

  // const r = [...ranges];
  // const lastRange = r.pop();
  // console.log("ranges?: ", lastRange, ranges);
  // const lastHourMins = getMinutesFromString(lastRange?.[1]);

  // console.log("LAst Hot", lastHourMins, getStringFromMinutes(lastHourMins));

  return (
    <>
      {children}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ y: -10, opacity: 0 }}
        className={twMerge("gap-2", isActive && "grid", "text-brand_gray mt-2")}
      >
        {ranges.map((range, index) => (
          <div className="flex gap-4" key={nanoid()}>
            <RangeTimePicker
              isDisabled={!isActive}
              index={index}
              onChange={(range) => handleChange(index, range)}
              startTime={range[0]}
              endTime={range[1]}
              onDelete={() => onRemoveRange?.(index)}
            />
            {index === 0 &&
              Number(ranges[ranges.length - 1][1].split(":")[0]) < 22 && (
                <button
                  disabled={!isActive}
                  type="button"
                  onClick={addRange}
                  className={twMerge(
                    // "col-start-2 row-start-1",
                    "w-24",
                    "disabled:cursor-not-allowed",
                    "not:disabled:active:text-brand_gray text-brand_gray/70 hover:text-brand_gray/90 lg:text-left"
                  )}
                >
                  + Agregar
                </button>
              )}
          </div>
        ))}
      </motion.div>
    </>
  );
};

export const RangeTimePicker = ({
  index,
  startTime,
  endTime,
  onChange,
  onDelete,
  isDisabled,
}: {
  isDisabled?: boolean;
  index?: number;
  onDelete?: () => void;
  startTime: string;
  endTime: string;
  onChange?: (arg0: string[]) => void;
}) => {
  const changeStartTime = (time: string) => {
    onChange?.([time, endTime]);
  };

  const changeEndTime = (time: string) => {
    onChange?.([startTime, time]);
  };

  const getTime = (startTime: string) => {
    const mins = getMinutesFromString(startTime);
    // console.log("Mins: ", mins, getStringFromMinutes(mins));
    return getStringFromMinutes(mins);
  };

  return (
    <div>
      <div className="relative flex items-center gap-3">
        <span>De</span>
        <TimePicker
          isDisabled={isDisabled}
          initialTime={startTime}
          onChange={changeStartTime}
          all
        />
        <span>a</span>
        <TimePicker
          isDisabled={isDisabled}
          defaultSelected={endTime}
          initialTime={getTime(endTime)}
          onChange={changeEndTime}
        />
        {index !== 0 && (
          <button
            disabled={isDisabled}
            onClick={onDelete}
            type="button"
            className=" disabled:hidden active:text-red-500 right-0 top-[28%] text-red-400 hover:text-red-500 transition-all"
          >
            <FaRegTrashCan />
          </button>
        )}
      </div>
    </div>
  );
};
