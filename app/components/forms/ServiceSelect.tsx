import type { Service } from "@prisma/client"
import type { ChangeEvent } from "react"
import { SelectInput } from "./SelectInput"

export const ServiceSelect = ({
  onChange,
  defaultValue,
  services,
}: {
  defaultValue?: string
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
  services: Service[]
}) => {
  return (
    <SelectInput
      defaultValue={defaultValue}
      options={services.map((s) => {
        const price = Number(s.price)
        const label = price > 0 ? `${s.name} - $${price}` : `${s.name} - Gratis`
        return { title: label, value: s.id }
      })}
      onChange={onChange}
      placeholder="Selecciona un servicio"
      label="Servicio"
    />
  )
}
