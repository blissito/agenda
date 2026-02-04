import type { User } from "@prisma/client"
import { type ChangeEvent, useEffect } from "react"
import { FaPlus } from "react-icons/fa6"
import { Link, useFetcher } from "react-router"
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
  }, [fetcher])

  const employees: User[] = fetcher.data?.employees || []

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        defaultValue={defaultValue}
        onChange={onChange}
        className="flex-grow"
        options={employees.map((s) => ({
          title: s.displayName ?? undefined,
          value: s.id,
        }))}
        placeholder="Selecciona un profesional"
        label="Profesional"
      />
      <Link
        to="/dash/employees"
        className="bg-brand_blue/10 rounded-xl w-12 h-12 flex justify-center items-center"
      >
        <span className="text-brand_blue">
          <FaPlus />
        </span>
      </Link>
    </div>
  )
}
