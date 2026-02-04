import type { Customer, Event, Service, User } from "@prisma/client"
import { type ChangeEvent, useEffect, useState } from "react"
import { type FieldValues, useForm, useWatch } from "react-hook-form"
import { Form, useFetcher } from "react-router"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Switch } from "~/components/common/Switch"
import { newEventSchema } from "~/utils/zod_schemas"
import { BasicInput } from "../BasicInput"
import { CustomersComboBox } from "../CustomersComboBox"
import { DateInput } from "../DateInput"
import { EmployeeSelect } from "../EmployeeSelect"
import { SelectInput } from "../SelectInput"
import { ServiceSelect } from "../ServiceSelect"

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
}

export const EventForm = ({
  defaultValues,
  onCancel,
  onNewClientClick,
  customers,
  services,
  employees,
}: EventFormProps) => {
  const fetcher = useFetcher()
  const startDateValue = defaultValues.start
    ? new Date(defaultValues.start)
    : new Date()
  const oneMoreHour = new Date(startDateValue)
  oneMoreHour.setHours(oneMoreHour.getHours() + 1)

  // Pre-populate start and end hours from the clicked date/time
  const startDate = new Date(startDateValue)
  const endDate = new Date(startDate)
  endDate.setHours(startDate.getHours() + 1) // Default to 1 hour duration

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

  useEffect(() => {
    handleHoursChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleHoursChange])

  const registerVirtualFields = () => {
    // virtual fields
    register("customerId", { required: true, value: "" })
    register("serviceId", { required: true, value: services[0]?.id })
    register("employeeId", { required: true, value: employees[0]?.id })
  }

  useEffect(() => {
    registerVirtualFields()
  }, [registerVirtualFields])

  const handleServiceSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setValue("serviceId", event.currentTarget.value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const hanldeEmployeeSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setValue("employeeId", event.currentTarget.value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const handleDelete = async () => {
    if (!confirm("Esta acción no es reversible")) return

    await fetcher.submit(null, {
      method: "delete",
      action: `/api/events?intent=delete&eventId=${defaultValues.id}`,
    })
    onCancel?.()
  }

  return (
    <Form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      {/* @TODO: create a combobox */}
      <CustomersComboBox
        onSelect={handleCustomerSelection}
        customers={customers}
        onNewClientClick={onNewClientClick}
        defaultValue={defaultValues.customerId}
      />
      <ServiceSelect
        defaultValue={services[0]?.id}
        onChange={handleServiceSelect}
      />
      <EmployeeSelect
        defaultValue={employees[0]?.id}
        onChange={hanldeEmployeeSelect}
      />

      <p className="font-bold">Fecha y hora</p>
      <div className="flex items-center">
        <DateInput name="start" register={register} />
        <span className="px-4">De</span>
        <DateInput
          type="time"
          name="startHour"
          register={register}
          onChange={handleHoursChange}
          error={errors.startHour}
        />
        <span className="py-5 px-4">a</span>
        <DateInput
          name="endHour"
          register={register}
          type="time"
          onChange={handleHoursChange}
          error={errors.startHour}
        />
      </div>
      {errors.startHour ? (
        <p className="text-red-500">{errors.startHour.message}</p>
      ) : (
        <p className="mb-6">
          Duración:{" "}
          <strong className="font-sans font-bold"> {duration}m</strong>
        </p>
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
      <hr className="w-[90%] self-center border-brand_pale mt-2 mb-6" />
      <Switch
        label="Pagado"
        name="paid"
        register={register}
        registerOptions={{ required: false }}
      />
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
      <hr className="mt-4 border-none" />
      <nav className="absolute bottom-0 flex justify-end px-20 py-4 w-full gap-4 bg-white">
        <PrimaryButton
          type="button"
          isDisabled={isLoading}
          onClick={onCancel}
          mode="cancel"
        >
          Cancelar
        </PrimaryButton>
        {defaultValues.id && (
          <PrimaryButton
            type="button"
            isLoading={isLoading}
            className="bg-red-500 text-white"
            onClick={handleDelete}
          >
            Eliminar
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
  )
}
