import { RiUserSearchLine } from "react-icons/ri";
import { BasicInput } from "./BasicInput";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FaPlus } from "react-icons/fa6";
import { cn } from "~/utils/cn";
import type { Customer } from "@prisma/client";
import { useFetcher } from "react-router";
import { CgRemove } from "react-icons/cg";

type CustomersComboBoxProps = {
  defaultValue?: string | null;
  onSelect?: (customer: Customer | null) => void;
  customers: Customer[];
  onNewClientClick?: () => void;
};

export const CustomersComboBox = ({
  onNewClientClick,
  customers,
  onSelect,
  defaultValue,
}: CustomersComboBoxProps) => {
  const fetcher = useFetcher<{ customers?: Customer[] }>();
  const [showClientList, setShowClientList] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    onNewClientClick?.();
  };
  const [searchableElements, setSearchableElements] = useState(customers);
  const [selected, setSelected] = useState<Customer | null>(null);

  // load customers
  useEffect(() => {
    fetcher.load("/api/customers?search");
  }, []);

  const renders = useRef(0);
  useEffect(() => {
    if (fetcher.data && "customers" in fetcher.data && fetcher.data.customers) {
      setSearchableElements(fetcher.data.customers);
      if (renders.current < 1) {
        // default value
        const found = fetcher.data.customers.find(
          (c) => c.id === defaultValue
        );
        setSelected(found ?? null);
        renders.current = renders.current + 1;
      }
    }
  }, [fetcher, defaultValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    timeout.current && clearTimeout(timeout.current);
    const { value } = event.currentTarget;
    timeout.current = setTimeout(() => {
      fetcher.load("/api/customers?search=" + value);
    }, 500);
  };

  const loadAgain = () => {
    fetcher.load("/api/customers?search");
  };

  const handleCustomerSelection = (customer: Customer) => {
    loadAgain();
    setSelected(customer);
    onSelect?.(customer);
    setShowClientList(false);
  };

  const handleClearSelection = () => {
    setSelected(null);
    onSelect?.(null);
  };

  return (
    <section
      className="relative"
      onFocus={() => setShowClientList(true)}
      onBlur={() => {
        setTimeout(() => setShowClientList(false), 500);
      }}
    >
      {selected ? (
        <SelectedCustomer customer={selected} onClear={handleClearSelection} />
      ) : (
        <BasicInput
          label="Cliente"
          icon={<RiUserSearchLine />}
          name="customer"
          placeholder="Buscar por correo"
          onChange={handleChange}
        />
      )}
      {showClientList && (
        <div className="rounded-2xl bg-white w-full absolute z-20 top-[90%] grid border py-2 px-2 shadow-xl">
          <CustomerList
            onClick={handleCustomerSelection}
            customers={searchableElements}
          />
          <AddCustomerButton onClick={handleClick} />
        </div>
      )}
    </section>
  );
};

const SelectedCustomer = ({
  customer,
  onClear,
}: {
  onClear?: () => void;
  customer: Customer;
}) => {
  return (
    <section className="mb-6">
      <h3 className="mb-2">Cliente</h3>
      <div className={cn("border rounded-xl p-2 flex items-center gap-4 px-3")}>
        <span>
          <RiUserSearchLine />
        </span>
        <div className="bg-gray-200 rounded-lg py-1 px-3 w-max flex items-center gap-3">
          <span>{customer.displayName}</span>
          <span className="text-gray-400">{customer.email}</span>
          <button onClick={onClear} className="text-gray-400 hover:text-black">
            <CgRemove />
          </button>
        </div>
      </div>
    </section>
  );
};

const CustomerList = ({
  customers,
  onClick,
}: {
  onClick?: (arg0: Customer) => void;
  customers: Customer[];
}) => {
  return (
    <div className="max-h-[200px] overflow-scroll">
      {customers.map((customer) => (
        <button
          onClick={() => onClick?.(customer)}
          type="button"
          key={customer.id}
          className={cn(
            "py-3 px-3",
            "hover:bg-gray-100 w-full text-left rounded-lg",
            "my-1",
            "flex items-center gap-3"
          )}
        >
          <span>{customer.displayName}</span>
          <span className="text-gray-400">{customer.email}</span>
        </button>
      ))}
    </div>
  );
};

const AddCustomerButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 bg-brand_blue/10 rounded-full py-2 px-2",
        "text-brand_blue/80 hover:text-brand_blue"
      )}
    >
      <span>
        <FaPlus />
      </span>
      <span>Agregar cliente</span>
    </button>
  );
};
