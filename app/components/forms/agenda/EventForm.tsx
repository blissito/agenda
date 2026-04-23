import type { Customer, Event, Service, User } from "@prisma/client"
import { type ChangeEvent, useEffect, useState } from "react"
import { type FieldValues, useForm, useWatch } from "react-hook-form"
import { Form, useFetcher } from "react-router"
import { ConfirmModal } from "~/components/common/ConfirmModal"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Switch } from "~/components/common/Switch"
import { newEventSchema } from "~/utils/zod_schemas"
import { BasicInput } from "../BasicInput"
import { CustomersComboBox } from "../CustomersComboBox"
import { DateInput } from "../DateInput"
import { EmployeeSelect } from "../EmployeeSelect"
import { SelectInput } from "../SelectInput"
import { ServiceSelect } from "../ServiceSelect"
import {
  VideoProviderSelect,
  type VideoProviderValue,
} from "../VideoProviderSelect"

const formatDate = (d: Date | string): string =>
  new Date(d).toISOString().substring(0, 10)

const formatHour = (d: Date | string, reset?: boolean): string => {
  const time = new Date(d)
    .toLocaleDateString("es-MX", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    })
    .split(",")[1]
    .trim()
  if (reset) {
    return `${time.split(":")[0]}:00`
  } else {
    return time
  }
}

// Form values type - using Record for flexibility with react-hook-form
type EventFormValues = Record<string, unknown> & {
  id?: string
  customerId?: string | null
  employeeId?: string | null
  serviceId?: string | null
  startHour?: string
  endHour?: string
  start?: string
  end?: string
  notes?: string | null
  paid?: boolean
  payment_method?: string | null
}

type EventFormProps = {
  services: Service[]
  employees: User[]
  customers: Customer[]
  onNewClientClick: () => void
  onCancel?: () => void
  onValid?: (arg0: { isValid: boolean; values: Partial<Event> }) => void
  defaultValues: Partial<Event>
  ownerName?: string
  hasMeet?: boolean
  hasZoom?: boolean
}

export const EventForm = ({
  defaultValues,
  onCancel,
  onNewClientClick,
  customers,
  services,
  employees,
  hasMeet,
  hasZoom,
}: EventFormProps) => {
  const fetcher = useFetcher()
  const startDateValue = (() => {
    if (defaultValues.start) return new Date(defaultValues.start)
    // Next full hour
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    return now
  })()

  // Pre-populate start and end hours from the clicked date/time.
  // When editing an existing event, use its real `end`; for new events fall
  // back to start + 1h.
  const startDate = new Date(startDateValue)
  const endDate = defaultValues.end
    ? new Date(defaultValues.end as Date)
    : new Date(startDate.getTime() + 60 * 60 * 1000)

  const {
    register,
    formState: { errors, isDirty, isValid },
    getValues,
    setValue,
    setError,
    control,
    handleSubmit,
  } = useForm({
    defaultValues: {
      ...defaultValues,
      start: formatDate(startDateValue),
      end: defaultValues.end ? formatDate(defaultValues.end as Date) : "",
      startHour: formatHour(startDate),
      endHour: formatHour(endDate),
    } as EventFormValues,
  })

  // duration calculation 🧠
  const [duration, setDuration] = useState(60)
  const handleHoursChange = () => {
    const v = getValues()
    const startHourStr = v.startHour || "00:00"
    const endHourStr = v.endHour || "01:00"
    const sh = Number(startHourStr.split(":")[0]),
      sm = Number(startHourStr.split(":")[1]),
      eh = Number(endHourStr.split(":")[0]),
      em = Number(endHourStr.split(":")[1])
    const one = new Date(),
      dos = new Date()
    one.setHours(sh)
    one.setMinutes(sm)
    dos.setHours(eh)
    dos.setMinutes(em)
    const du = (dos.getTime() - one.getTime()) / 1000 / 60 // mins
    setDuration(du)
    setValue("startHour", v.startHour)
  }

  const parseData = (values: FieldValues) => {
    const startHour = values.startHour || "00:00"
    const endHour = values.endHour || "01:00"
    const startStr =
      typeof values.start === "string"
        ? values.start
        : formatDate(values.start || new Date())

    const start = new Date(`${startStr}T00:00:00`)
    start.setDate(start.getDate())
    start.setHours(Number(startHour.split(":")[0]))
    start.setMinutes(Number(startHour.split(":")[1]))

    const end = new Date(`${startStr}T00:00:00`)
    end.setHours(Number(endHour.split(":")[0]))
    end.setMinutes(Number(endHour.split(":")[1]))

    if (start > end) {
      setError("startHour", {
        message: "La fecha de inicio debe ser menor a la de finalización 🔁",
      })
      return
    }

    const payload = {
      ...values,
      duration,
      start,
      end,
    }
    const r = newEventSchema.safeParse(payload)
    if (!r.success) {
      console.error("PARSE_ERROR: ", r.error)
      r.error.issues.forEach((issue) => {
        setError(String(issue.path[0]), { message: issue.message })
      })
      return
    }
    return r.data
  }

  const onSubmit = async (v: FieldValues) => {
    const validData = parseData(v)

    if (!validData) return console.error("::ERROR_ON_VALIDATION::", validData)
    // return;
    fetcher.submit(
      { data: JSON.stringify(validData) },
      {
        method: "POST",
        action: validData.id
          ? `/api/events?intent=update&eventId=${validData.id}`
          : "/api/events?intent=new",
      },
    )
    onCancel?.()
  }

  const handleCustomerSelection = (selectedCustomer: Customer | null) => {
    if (!selectedCustomer) {
      setValue("customerId", "", { shouldValidate: true, shouldDirty: true })
    } else {
      setValue("customerId", selectedCustomer.id, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }

  const isLoading = fetcher.state !== "idle"

  const _startHour = useWatch({ control, name: "startHour" })
  const _endHour = useWatch({ control, name: "endHour" })
  const _paid = useWatch({ control, name: "paid" })

  useEffect(() => {
    handleHoursChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_startHour, _endHour])

  // Resuelve default de videoProvider según servicio e integraciones.
  const resolveDefaultProvider = (
    serviceVP?: string | null,
  ): VideoProviderValue => {
    const pref = (serviceVP || "auto") as string
    if (pref === "meet" && hasMeet) return "meet"
    if (pref === "zoom" && hasZoom) return "zoom"
    if (pref === "none") return "none"
    // auto o preferencia no disponible → primera integración disponible
    if (hasMeet) return "meet"
    if (hasZoom) return "zoom"
    return "none"
  }

  const initialService = services.find((s) => s.id === defaultValues?.serviceId)
  const initialProvider = resolveDefaultProvider(
    (initialService as any)?.videoProvider,
  )

  const registerVirtualFields = () => {
    // virtual fields
    register("customerId", { required: true, value: "" })
    register("serviceId", {
      required: true,
      value: defaultValues?.serviceId ?? "",
    })
    register("employeeId", { required: true, value: employees[0]?.id })
    register("videoProvider", { required: false, value: initialProvider })
  }

  useEffect(() => {
    registerVirtualFields()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleServiceSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.currentTarget.value
    setValue("serviceId", selectedId, {
      shouldValidate: true,
      shouldDirty: true,
    })
    const service = services.find((s) => s.id === selectedId)
    if (service) {
      const currentStart = getValues("startHour") || "09:00"
      const [h, m] = currentStart.split(":").map(Number)
      const startMins = h * 60 + m
      const endMins = startMins + Number(service.duration)
      const endH = String(Math.floor(endMins / 60) % 24).padStart(2, "0")
      const endM = String(endMins % 60).padStart(2, "0")
      setValue("endHour", `${endH}:${endM}`, {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue(
        "videoProvider",
        resolveDefaultProvider((service as any).videoProvider),
        { shouldDirty: true },
      )
    }
  }

  const videoProviderValue = useWatch({ control, name: "videoProvider" }) as
    | string
    | undefined
  const showVideoSelector = !defaultValues.id

  const hanldeEmployeeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setValue("employeeId", event.currentTarget.value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const handleDelete = async () => {
    await fetcher.submit(null, {
      method: "delete",
      action: `/api/events?intent=delete&eventId=${defaultValues.id}`,
    })
    setShowDeleteConfirm(false)
    onCancel?.()
  }

  return (
    <>
      <Form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        {/* @TODO: create a combobox */}
        <CustomersComboBox
          onSelect={handleCustomerSelection}
          customers={customers}
          onNewClientClick={onNewClientClick}
          defaultValue={defaultValues.customerId}
        />
        <ServiceSelect
          services={services}
          defaultValue={defaultValues?.serviceId ?? ""}
          onChange={handleServiceSelect}
        />
        <EmployeeSelect
          defaultValue={employees[0]?.id}
          onChange={hanldeEmployeeSelect}
        />

        {showVideoSelector && (
          <VideoProviderSelect
            value={(videoProviderValue as VideoProviderValue) ?? "auto"}
            onChange={(v) =>
              setValue("videoProvider", v, { shouldDirty: true })
            }
            hasMeet={hasMeet}
            hasZoom={hasZoom}
          />
        )}

        <div className="flex flex-col gap-4">
          <p className="font-bold">
            Fecha y hora{" "}
            <span className="text-brand_iron font-normal">({duration}m)</span>
          </p>
          <div className="flex items-center flex-wrap gap-y-2">
            <div className="flex-1 min-w-[140px]">
              <DateInput name="start" register={register} />
            </div>
            <span className="px-2">De</span>
            <DateInput
              type="time"
              name="startHour"
              register={register}
              onChange={handleHoursChange}
              error={errors.startHour}
            />
            <span className="px-2">a</span>
            <DateInput
              name="endHour"
              register={register}
              type="time"
              onChange={handleHoursChange}
              error={errors.startHour}
            />
          </div>
          {errors.startHour && (
            <p className="text-red-500">{errors.startHour.message}</p>
          )}
          <BasicInput
            label="Notas"
            as="textarea"
            name="notes"
            register={register}
            className="min-w-[170px]"
            placeholder="Agrega una nota o comentario"
            registerOptions={{ required: false }}
          />
        </div>
        <hr className="border-brand_pale" />
        {defaultValues.mp_payment_id ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-brand_dark font-satoMedium">
                Pagado con MercadoPago
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-satoMedium bg-[#d5faf1] text-[#2a645f]">
                💸 Pagada
              </span>
            </div>
            <SelectInput
              placeholder="Selecciona la forma de pago"
              name="payment_method"
              defaultValue="card"
              label="Forma de pago"
              isDisabled
              options={[
                { value: "card", title: "Tarjeta" },
                { value: "cash", title: "Efectivo" },
                { value: "transfer", title: "Transferencia bancaria" },
              ]}
            />
          </>
        ) : (
          <>
            <Switch
              label="Pagado"
              name="paid"
              defaultChecked={!!defaultValues.paid}
              register={register}
              registerOptions={{ required: false }}
            />
            {_paid && (
              <SelectInput
                placeholder="Selecciona la forma de pago"
                register={register}
                registerOptions={{ required: false }}
                name="payment_method"
                defaultValue="cash"
                label="Forma de pago"
                options={[
                  { value: "card", title: "Tarjeta" },
                  {
                    value: "cash",
                    title: "Efectivo",
                  },
                  {
                    value: "transfer",
                    title: "Transferencia bancaria",
                  },
                ]}
              />
            )}
          </>
        )}
        <hr className="mt-4 border-none" />
        <nav className="absolute bottom-0 left-0 right-0 flex justify-end px-6 md:px-8 py-4 gap-4 bg-white">
          {/* <PrimaryButton
          type="button"
          isDisabled={isLoading}
          onClick={onCancel}
          mode="cancel"
        >
          Volver
        </PrimaryButton> */}
          {defaultValues.id && (
            <PrimaryButton
              type="button"
              isLoading={isLoading}
              className="bg-[#CA5757] hover:bg-[#B84E4E] text-white"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Cancelar cita
            </PrimaryButton>
          )}
          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            isDisabled={!isDirty || !isValid}
          >
            Guardar
          </PrimaryButton>
        </nav>
      </Form>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="¿Seguro que quieres cancelar esta cita? 🫣"
        description={
          <>
            Al cancelar, la cita será eliminada de la agenda. Enviaremos una
            notificación a{" "}
            <span className="font-satoBold text-brand_dark">
              {customers.find((c) => c.id === getValues("customerId"))
                ?.displayName ?? "el cliente"}
            </span>
            .
          </>
        }
        confirmText="Sí, cancelar"
        cancelText="Volver"
        variant="danger"
      />
    </>
  )
}
