// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { Form, useFetcher } from "react-router";
import { Switch } from "./Switch";
import { PrimaryButton } from "../common/primaryButton";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";
import {
  getMinutesFromString,
  getStringFromMinutes,
  TimePicker,
} from "./TimePicker";
import { nanoid } from "nanoid";
import { type Org } from "@prisma/client";
import type { WeekSchema } from "~/utils/zod_schemas";
import invariant from "tiny-invariant";
import { ArrowRight } from "~/components/icons/arrowRight";

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

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miércoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sábado: "Sábado",
  domingo: "Domingo",
};

const initialValues: WeekSchema = {
  lunes: [["09:00", "16:00"]],
};

const RANGE_TEMPLATE = ["09:00", "14:00"];
export const ERROR_MESSAGE = "Debes seleccionar al menos un día";

function cap(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const TimesForm = ({
  org,
  cta,
  onChange,
  onSubmit,
  children,
  onClose,
  noSubmit,
}: {
  noSubmit?: boolean;
  cta?: string;
  onClose?: () => void;
  children?: ReactNode; // acting as footer
  onChange?: (data: WeekSchema) => void;
  onSubmit?: (data: WeekSchema) => void;
  org: Org;
}) => {
  const fetcher = useFetcher();
  const [data, setData] = useState<WeekSchema>(org.weekDays || initialValues);
  const initialData = org.weekDays
    ? Object.keys(org.weekDays)
    : Object.keys(initialValues);

  const {
    clearErrors,
    setValue,
    getValues,
    setError,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm({
    defaultValues: {
      weekDays: initialData,
    },
  });

  const submit = () => {
    if (noSubmit) return;

    onSubmit?.(data);
    fetcher.submit(
      {
        intent: "update_org",
        data: JSON.stringify({ weekDays: data, id: org.id }),
        next: "/signup/6",
      },
      { method: "post" }
    );
    onClose?.();
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
        const dd = JSON.parse(JSON.stringify(d));
        const lastRange = dd[dayString].pop();
        const nextH = getStringFromMinutes(
          getMinutesFromString(lastRange[1]) + 30
        );

        if (!Array.isArray(lastRange)) return d;
        const nextRange = [
          nextH,
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
    setData((d) => ({ ...d, [day]: arr }));
  };

  const handleUpdate = (day: string, ranges: string[][]) => {
    setData((d) => ({ ...d, [day]: ranges }));
  };

  useEffect(() => {
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
            label={DAY_LABELS[dayString]}
            onChange={handleSwitchChange}
          />
        </DayTimesSelector>
      ))}

      <div className="mt-auto">
        {children ? (
          children
        ) : noSubmit ? null : (
          <PrimaryButton
            isLoading={fetcher.state !== "idle"}
            className="w-full mt-auto"
            isDisabled={isDisabled}
            type="submit"
          >
            {cta || "Continuar"} <ArrowRight />
          </PrimaryButton>
        )}
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

  type Range = [string, string]; // ['09:00','16:00']

  return (
    <div className="rounded-xl">
      {children}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ y: -8, opacity: 0 }}
        className={twMerge(
          "mt-3 pl-1",
          isActive ? "grid gap-3" : "hidden",
          "text-neutral-600"
        )}
      >
        {ranges.map((range: Range, index) => (
          <div className="flex items-center gap-4" key={nanoid()}>
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
                    "text-sm",
                    "w-auto",
                    "disabled:cursor-not-allowed",
                    "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  + Agregar
                </button>
              )}
          </div>
        ))}
      </motion.div>
    </div>
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
    return getStringFromMinutes(mins);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-neutral-500">De</span>
      <TimePicker
        isDisabled={isDisabled}
        defaultSelected={startTime}
        onChange={changeStartTime}
        all
      />

      <span className="text-sm text-neutral-500">a</span>
      <TimePicker
        isDisabled={isDisabled}
        defaultSelected={endTime}
        onChange={changeEndTime}
      />

      {index !== 0 && (
        <button
          disabled={isDisabled}
          onClick={onDelete}
          type="button"
          className="disabled:hidden text-red-400 hover:text-red-500 transition-all"
        >
          <FaRegTrashCan />
        </button>
      )}
    </div>
  );
};
