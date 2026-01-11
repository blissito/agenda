// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import { useEffect, type ChangeEvent } from "react";
import { SelectInput } from "./SelectInput";
import { Link, useFetcher } from "react-router";
import { FaPlus } from "react-icons/fa6";
import type { User } from "@prisma/client";

export const EmployeeSelect = ({
  onChange,
  defaultValue,
}: {
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const fetcher = useFetcher();
  useEffect(() => {
    fetcher.load("/api/employees");
  }, []);

  const employees: User[] = fetcher.data?.employees || [];

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        defaultValue={defaultValue}
        onChange={onChange}
        className="flex-grow"
        options={employees.map((s) => ({ title: s.displayName, value: s.id }))}
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
  );
};
