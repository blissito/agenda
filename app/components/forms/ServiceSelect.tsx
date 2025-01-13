import { useEffect, type ChangeEvent } from "react";
import { SelectInput } from "./SelectInput";
import { Link, useFetcher } from "react-router";
import { FaPlus } from "react-icons/fa6";

export const ServiceSelect = ({
  onChange,
}: {
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const fetcher = useFetcher();
  const handleChange = () => {};

  useEffect(() => {
    fetcher.load("/api/services");
  }, []);

  const services = fetcher.data?.services || [];

  return (
    <div className="flex items-center gap-2">
      <SelectInput
        className="flex-grow"
        options={services}
        onChange={handleChange}
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
