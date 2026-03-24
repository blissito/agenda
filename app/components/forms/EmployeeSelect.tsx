import type { User } from "@prisma/client"
import { type ChangeEvent, useEffect } from "react"
import { useFetcher } from "react-router"
import { SelectInput } from "./SelectInput"

type EmployeeSelectProps = {
  defaultValue?: string
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
}

export const EmployeeSelect = ({
  onChange,
  defaultValue,
}: EmployeeSelectProps) => {
  const fetcher = useFetcher<{ employees?: User[] }>()
  useEffect(() => {
    fetcher.load("/api/employees")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const employees: User[] = fetcher.data?.employees || []

  return (
    <SelectInput
      defaultValue={defaultValue}
      onChange={onChange}
      options={employees.map((s) => ({
        title: s.displayName ?? undefined,
        value: s.id,
      }))}
      placeholder="Selecciona un profesional"
      label="Profesional"
    />
  )
}
