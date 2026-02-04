import { type Org } from "@prisma/client"
import { motion } from "motion/react"
import { nanoid } from "nanoid"
import { type ReactNode, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaRegTrashCan } from "react-icons/fa6"
import { Form, useFetcher } from "react-router"
import { twMerge } from "tailwind-merge"
import { ArrowRight } from "~/components/icons/arrowRight"
import type { WeekSchema } from "~/utils/zod_schemas"
import { PrimaryButton } from "../common/primaryButton"
import { Switch } from "./Switch"
import {
  getMinutesFromString,
  getStringFromMinutes,
  TimePicker,
} from "./TimePicker"

export type DayTuple = [string, string][]
export type WeekTuples = Record<string, DayTuple | undefined>

const ENTIRE_WEEK = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
]

const DAY_LABELS: Record<string, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miércoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sábado: "Sábado",
  domingo: "Domingo",
}

const initialValues: WeekSchema = {
  lunes: [["09:00", "16:00"]],
}

const RANGE_TEMPLATE = ["09:00", "14:00"]
export const ERROR_MESSAGE = "Debes seleccionar al menos un día"

function _cap(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
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
  noSubmit?: boolean
  cta?: string
  onClose?: () => void
  children?: ReactNode // acting as footer
  onChange?: (data: WeekSchema) => void
  onSubmit?: (data: WeekSchema) => void
  org: Org
}) => {
  const fetcher = useFetcher()
  const [data, setData] = useState<WeekTuples>(
    (org.weekDays as unknown as WeekTuples) || initialValues,
  )
  const initialData = org.weekDays
    ? Object.keys(org.weekDays)
    : Object.keys(initialValues)

  const {
    clearErrors,
    setValue,
    getValues,
    setError,
    formState: { errors, isValid },
    handleSubmit,
  } = useForm<{ weekDays: string[] }>({
    defaultValues: {
      weekDays: initialData,
    },
  })

  const submit = () => {
    if (noSubmit) return

    onSubmit?.(data as WeekSchema)
    fetcher.submit(
      {
        intent: "update_org",
        data: JSON.stringify({ weekDays: data, id: org.id }),
        next: "/signup/6",
      },
      { method: "post" },
    )
    onClose?.()
  }

  const handleSwitchChange = (node: HTMLInputElement) => {
    let action: "adding" | "removing"
    clearErrors()
    const values = [...getValues().weekDays]

    if (node.checked) {
      action = "adding"
      values.push(node.value)
    } else {
      action = "removing"
      const idx = values.findIndex((v: string) => v === node.value)
      if (idx !== -1) values.splice(idx, 1)
    }

    setValue("weekDays", [...new Set(values)], { shouldValidate: true })

    if (!values.length) {
      setError("weekDays", { message: ERROR_MESSAGE })
    }

    // copy ranges for new active day
    toggleRange(action, node.id)
  }

  const toggleRange = (action: "adding" | "removing", dayString: string) => {
    if (action === "adding") {
      const dayValues = Object.values(data).filter(Boolean) as DayTuple[]
      const copy = dayValues.length
        ? dayValues[dayValues.length - 1]
        : [RANGE_TEMPLATE as [string, string]]
      setData((prev) => ({ ...prev, [dayString]: copy }))
    } else if (action === "removing") {
      const d = { ...data }
      delete d[dayString]
      setData(d)
    }
  }

  const addRange = (dayString: string) => {
    const dayData = data[dayString]
    if (dayData?.length) {
      setData((d) => {
        const dd = JSON.parse(JSON.stringify(d)) as WeekTuples
        const dayArr = dd[dayString]
        if (!dayArr) return d
        const lastRange = dayArr[dayArr.length - 1]
        if (!Array.isArray(lastRange)) return d
        const nextH = getStringFromMinutes(
          getMinutesFromString(lastRange[1]) + 30,
        )
        const nextRange: [string, string] = [
          nextH,
          getStringFromMinutes(getMinutesFromString(lastRange[1]) + 60),
        ]
        const currentDay = d[dayString] || []
        return {
          ...d,
          [dayString]: [...currentDay, nextRange],
        }
      })
    }
  }

  const removeRange = (day: string, index: number) => {
    const dayData = data[day]
    if (!dayData) return
    const arr = [...dayData]
    arr.splice(index, 1)
    setData((d) => ({ ...d, [day]: arr as DayTuple }))
  }

  const handleUpdate = (day: string, ranges: [string, string][]) => {
    setData((d) => ({ ...d, [day]: ranges }))
  }

  useEffect(() => {
    onChange?.(data as WeekSchema)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onChange])

  const isDisabled = !isValid || !!errors.weekDays

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      className={twMerge(
        "h-full pt-6 md:pt-20 px-[5%] md:px-2  max-w-xl mx-auto",
        "flex flex-col justify-evenly h-full gap-5 text-brand_dark",
      )}
    >
      {/* Switches */}
      {ENTIRE_WEEK.map((dayString: string) => (
        <DayTimesSelector
          key={dayString}
          ranges={data[dayString] || []}
          addRange={() => addRange(dayString)}
          onRemoveRange={(index) => removeRange(dayString, index)}
          onUpdate={(ranges) =>
            handleUpdate(dayString, ranges as [string, string][])
          }
          isActive={getValues().weekDays.includes(dayString)}
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
  )
}

export const DayTimesSelector = ({
  children,
  addRange,
  onRemoveRange,
  isActive,
  ranges = [],
  onUpdate,
}: {
  ranges: DayTuple
  addRange?: () => void
  onRemoveRange?: (arg0: number) => void
  onUpdate?: (ranges: string[][]) => void
  range?: string[]
  isActive?: boolean
  children?: ReactNode
}) => {
  const handleChange = (index: number, range: [string, string]) => {
    const arr = [...ranges] as [string, string][]
    arr[index] = range
    onUpdate?.(arr)
  }

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
          "text-neutral-600",
        )}
      >
        {ranges.map((range, index) => (
          <div className="flex items-center gap-4" key={nanoid()}>
            <RangeTimePicker
              isDisabled={!isActive}
              index={index}
              onChange={(r) => handleChange(index, r as [string, string])}
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
                    "text-neutral-400 hover:text-neutral-600",
                  )}
                >
                  + Agregar
                </button>
              )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export const RangeTimePicker = ({
  index,
  startTime,
  endTime,
  onChange,
  onDelete,
  isDisabled,
}: {
  isDisabled?: boolean
  index?: number
  onDelete?: () => void
  startTime: string
  endTime: string
  onChange?: (arg0: string[]) => void
}) => {
  const changeStartTime = (time: string) => {
    onChange?.([time, endTime])
  }

  const changeEndTime = (time: string) => {
    onChange?.([startTime, time])
  }

  const _getTime = (startTime: string) => {
    const mins = getMinutesFromString(startTime)
    return getStringFromMinutes(mins)
  }

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
  )
}
