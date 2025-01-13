import { useEffect, type ChangeEvent } from "react";
import { SelectInput } from "./SelectInput";
import { Link, useFetcher } from "react-router";
import { FaPlus } from "react-icons/fa6";
import type { Service } from "@prisma/client";

export const ServiceSelect = ({
  onChange,
  defaultValue,
}: {
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const fetcher = useFetcher();
  useEffect(() => {
    fetcher.load("/api/services");
  }, []);

  const services: Service[] = fetcher.data?.services || [];

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        defaultValue={defaultValue}
        className="flex-grow"
        options={services.map((s) => ({ title: s.name, value: s.id }))}
        onChange={onChange}
        placeholder="Selecciona un servicio"
        label="Servicio"
      />
      <Link
        to="/dash/servicios"
        className="bg-brand_blue/10 rounded-xl w-12 h-12 flex justify-center items-center"
      >
        <span className="text-brand_blue">
          <FaPlus />
        </span>
      </Link>
    </div>
  );
};
