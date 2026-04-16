import { AnimatePresence, motion } from "motion/react"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { FaRegTrashAlt } from "react-icons/fa"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { cn } from "~/utils/cn"
import { DAY_LABELS } from "~/utils/weekDays"
import { SelectInput } from "../SelectInput"

type Gap = [string, string]
type Gaps = Gap[]
export type Week = {
  monday?: Gaps
  tuesday?: Gaps
  wednesday?: Gaps
  thursday?: Gaps
  friday?: Gaps
  saturday?: Gaps
  sunday?: Gaps
  [key: string]: Gaps | undefined
}
type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type ScheduleMode = "inherit" | "specific"

export type SchedulePayload = {
  duration: number
  breakTime: number
  mode: ScheduleMode
  weekDays: Week | null
}

const DURATION_OPTIONS = [
  { title: "15 minutos", value: "15" },
  { title: "30 minutos", value: "30" },
  { title: "45 minutos", value: "45" },
  { title: "60 minutos", value: "60" },
  { title: "1 hora 15 minutos", value: "75" },
  { title: "1 hora 30 minutos", value: "90" },
  { title: "2 horas", value: "120" },
]

const BREAK_OPTIONS = [
  { title: "Sin descanso", value: "0" },
  { title: "5 minutos", value: "5" },
  { title: "10 minutos", value: "10" },
  { title: "15 minutos", value: "15" },
  { title: "20 minutos", value: "20" },
  { title: "30 minutos", value: "30" },
  { title: "45 minutos", value: "45" },
  { title: "60 minutos", value: "60" },
]

export const SimpleTimeSelector = ({
  onSubmit,
  isLoading,
  defaultValue,
  defaultDuration = 60,
  defaultBreakTime = 0,
  cancelHref = "/dash/servicios",
}: {
  isLoading?: boolean
  defaultValue?: Week
  defaultDuration?: number
  defaultBreakTime?: number
  cancelHref?: string
  onSubmit: (payload: SchedulePayload) => void
}) => {
  const [week, setWeek] = useState<Week>(defaultValue || {})
  const [duration, setDuration] = useState<number>(defaultDuration)
  const [breakTime, setBreakTime] = useState<number>(defaultBreakTime)
  const [mode, setMode] = useState<ScheduleMode>(
    defaultValue ? "specific" : "inherit",
  )

  const handleDayChange = (dayName: DayName) => (gaps: Gaps) => {
    const w = { ...week }
    w[dayName] = gaps
    setWeek(w)
  }

  const handleRemove = (dayName: DayName) => () => {
    const w = { ...week }
    delete w[dayName]
    setWeek(w)
  }

  const handleSubmit = () => {
    onSubmit?.({
      duration,
      breakTime,
      mode,
      weekDays: mode === "specific" ? week : null,
    })
  }

  return (
    <article className="my-3 rounded-2xl bg-white shadow p-4 md:p-8 max-w-3xl flex flex-col">
      <h2 className="font-satoBold text-xl text-brand_dark mb-4 md:mb-8">Horario</h2>

      <div className="mb-4 md:mb-6">
        <label className="block text-brand_dark font-satoMiddle mb-1">
          ¿Cuánto dura cada sesión?
        </label>
        <SelectInput
          options={DURATION_OPTIONS}
          value={String(duration)}
          onChange={(e) => setDuration(Number(e.currentTarget.value))}
          placeholder="Selecciona una opción"
        />
      </div>

      <div className="mb-4 md:mb-6">
        <label className="block text-brand_dark font-satoMiddle mb-1">
          ¿De cuánto tiempo es el descanso entre sesiones?
        </label>
        <SelectInput
          options={BREAK_OPTIONS}
          value={String(breakTime)}
          onChange={(e) => setBreakTime(Number(e.currentTarget.value))}
          placeholder="Selecciona una opción"
        />
      </div>

      <div className="text-brand_gray mb-2">
        <p className="text-brand_dark font-satoMiddle">
          ¿En que horario ofrecerás este servicio?
        </p>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="radio"
            name="scheduleMode"
            value="inherit"
            checked={mode === "inherit"}
            onChange={() => setMode("inherit")}
            className="accent-brand_blue"
          />
          <span className="font-satoshi">El mismo horario que mi negocio</span>
        </label>
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
          <input
            type="radio"
            name="scheduleMode"
            value="specific"
            checked={mode === "specific"}
            onChange={() => setMode("specific")}
            className="accent-brand_blue"
          />
          <span className="font-satoshi">
            Un horario específico para este servicio
          </span>
        </label>
      </div>

      {mode === "specific" && (
        <section className="border-t border-gray-100 mt-4 pt-2">
          {[
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ].map((dayName) => (
            <DaySelector
              defaultValue={week[dayName]}
              key={dayName}
              onDeactivate={handleRemove(dayName as DayName)}
              dayName={dayName}
              onChange={handleDayChange(dayName as DayName)}
            />
          ))}
        </section>
      )}

      <nav className="flex gap-6 justify-end mt-12">
        <SecondaryButton as="Link" to={cancelHref} className="w-[120px]">
          Cancelar
        </SecondaryButton>
        <PrimaryButton isLoading={isLoading} onClick={handleSubmit}>
          Guardar
        </PrimaryButton>
      </nav>
    </article>
  )
}

const DaySelector = ({
  dayName,
  onChange,
  onDeactivate,
  defaultValue,
}: {
  defaultValue?: Gaps
  onChange?: (arg0: Gaps) => void
  dayName: string
  onDeactivate?: () => void
}) => {
  const [isActive, setIsActive] = useState(!!defaultValue)
  const [gaps, setGaps] = useState<Gaps>(defaultValue || [["09:00", "16:00"]])
  const handleChange = (index: number, gap: [string, string]) => {
    const gps = [...gaps]
    if (Array.isArray(gap) && gap[0] && gap[1]) {
      gps.splice(index, 1, gap)
    } else {
      gps.splice(index, 1)
    }
    setGaps(gps)
    isActive && onChange?.(gps)
  }

  const handleActivation = (bool: boolean) => {
    if (bool) {
      onChange?.(gaps)
    } else {
      onDeactivate?.()
    }
    setIsActive(bool)
  }

  const handleAddGap = () => {
    const gs = [...gaps]
    gs.push(["09:00", "17:00"])
    setGaps(gs)
    onChange?.(gs)
  }

  const handleRemove = (index: number) => {
    const gs = [...gaps]
    gs.splice(index, 1)
    setGaps(gs)
    onChange?.(gs)
  }

  return (
    <section className="flex items-start gap-8 py-[5px]">
      <header className="flex gap-4 py-[5px] min-w-[180px]">
        <h4 className="w-20 text-brand_dark">
          {DAY_LABELS[dayName as keyof typeof DAY_LABELS] || dayName}
        </h4>
        <SimpleSwitch value={isActive} onChange={handleActivation} />
      </header>
      {isActive && (
        <main className="flex items-start">
          <section>
            <AnimatePresence>
              {gaps.map((gap, i) => (
                <Gap
                  index={i}
                  onRemove={i === 0 ? undefined : () => handleRemove(i)}
                  onChange={(newGap) => handleChange(i, newGap)}
                  gap={gap}
                  key={i}
                />
              ))}
            </AnimatePresence>
          </section>

          <button
            disabled={!isActive}
            onClick={handleAddGap}
            className={cn(
              "text-brand_gray enabled:hover:text-brand_dark p-3 whitespace-nowrap",
              "disabled:text-gray-300",
            )}
          >
            + Agregar
          </button>
        </main>
      )}
      {!isActive && <span className="text-gray-400 py-3">Cerrado</span>}
    </section>
  )
}

const generateHours = () => {
  const hrs = Array.from({ length: 24 }).map((_, i) => {
    const h = i < 10 ? `0${i}` : i
    return {
      value: `${h}:00`,
      title: `${h}:00`,
    }
  })
  return hrs
}

const Gap = ({
  onChange,
  gap,
  index,
  onRemove,
}: {
  gap?: Gap
  index: number
  onRemove?: () => void
  onError?: () => void
  onChange?: (arg0: Gap) => void
}) => {
  const [range, setRange] = useState<Gap>(gap || ["09:00", "16:00"])
  const [error, setError] = useState<string | null>(null)
  const options = generateHours()
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)

  const isValid = (pair: [string, string]) => {
    timeout.current && clearTimeout(timeout.current)
    let err = null
    const n1 = Number(pair[0].split(":")[0])
    const n2 = Number(pair[1].split(":")[0])
    const valid = n1 < n2
    if (!valid) {
      err = "La hora final, no puede ser menor."
    }
    setError(err)
    timeout.current = setTimeout(() => setError(null), 3000)
    return n1 < n2
  }

  const handleUpdate = (update: Gap) => {
    if (isValid(update)) {
      setRange(update)
      onChange?.(update)
    }
  }

  const handleChange =
    (index: number) => (ev: ChangeEvent<HTMLSelectElement>) => {
      const val = ev.currentTarget.value
      const update = [...range] as [string, string]
      update.splice(index, 1, val)
      handleUpdate(update)
    }

  return (
    <motion.section
      transition={{ delay: index * 0.05 }}
      initial={{ opacity: 0, filter: "blur(4px)", y: -10 }}
      exit={{ opacity: 0, filter: "blur(4px)", x: -10 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    >
      <div className="flex items-center gap-2">
        <span>De</span>
        <SelectInput
          onChange={handleChange(0)}
          value={range[0]}
          options={options}
        />
        <span>a</span>
        <SelectInput
          onChange={handleChange(1)}
          value={range[1]}
          options={options}
        />
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-500 text-xs p-2 hover:scale-105 transition-all"
          >
            <FaRegTrashAlt />
          </button>
        )}
      </div>
      <p className="text-red-500 text-xs">{error}</p>
    </motion.section>
  )
}

export const SimpleSwitch = ({
  isDisabled,
  name,
  value,
  onChange,
}: {
  isDisabled?: boolean
  name?: string
  value?: boolean
  onChange?: (arg0: boolean) => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOn, setOn] = useState(false)

  const onClick = () => {
    setOn((o) => {
      inputRef.current!.checked = !o
      onChange?.(!o)
      return !o
    })
  }

  useEffect(() => {
    setOn(value ?? false)
  }, [value])

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      className="flex justify-between items-center"
    >
      <div
        className={cn(
          "flex bg-gray-200 w-10 p-1 rounded-full transition-colors",
          {
            "justify-end bg-brand_blue": isOn,
          },
        )}
      >
        <motion.div
          transition={{ type: "spring" }}
          layout
          className={cn("bg-white h-4 w-4 rounded-full shadow")}
        ></motion.div>
      </div>
      <input
        name={name}
        ref={inputRef}
        className="hidden"
        disabled={isDisabled}
        type="checkbox"
      />
    </button>
  )
}
