import type { Service } from "@prisma/client"
import { type ChangeEvent, useEffect } from "react"
import { useFetcher } from "react-router"
import { SelectInput } from "./SelectInput"

export const ServiceSelect = ({
  onChange,
  defaultValue,
}: {
  defaultValue?: string
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
}) => {
  const fetcher = useFetcher()
  useEffect(() => {
    fetcher.load("/api/services")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const services: Service[] = fetcher.data?.services || []

  return (
    <SelectInput
      defaultValue={defaultValue}
      options={services.map((s) => ({ title: s.name, value: s.id }))}
      onChange={onChange}
      placeholder="Selecciona un servicio"
      label="Servicio"
    />
  )
}
