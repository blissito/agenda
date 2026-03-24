import type { Customer } from "@prisma/client"
import { type ChangeEvent, useEffect, useRef, useState } from "react"
import { CgRemove } from "react-icons/cg"
import { FaPlus } from "react-icons/fa6"
import { RiUserSearchLine } from "react-icons/ri"
import { useFetcher } from "react-router"
import { cn } from "~/utils/cn"
import { BasicInput } from "./BasicInput"

type CustomersComboBoxProps = {
  defaultValue?: string | null
  onSelect?: (customer: Customer | null) => void
  customers: Customer[]
  onNewClientClick?: () => void
}

export const CustomersComboBox = ({
  onNewClientClick,
  customers,
  onSelect,
  defaultValue,
}: CustomersComboBoxProps) => {
  const fetcher = useFetcher<{ customers?: Customer[] }>()
  const [showClientList, setShowClientList] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClick = () => {
    onNewClientClick?.()
  }
  const [searchableElements, setSearchableElements] = useState(customers)
  const [selected, setSelected] = useState<Customer | null>(null)

  // TODO: 4 bugs en flujo ClientForm→CustomersComboBox:
  // 1. CRASH: `fetcher` como dep causa loop infinito → cambiar a []
  // 2. ClientForm cierra drawer antes de que termine submit → usar useEffect con fetcher.data
  // 3. Lista no refresca tras crear cliente → agregar refreshTrigger prop
  // 4. API customers.ts:25 retorna Prisma object sin Response.json()
  // Ver plan completo en transcript 7da41aba

  // load customers
  useEffect(() => {
    fetcher.load("/api/customers?search")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renders = useRef(0)
  useEffect(() => {
    if (fetcher.data && "customers" in fetcher.data && fetcher.data.customers) {
      setSearchableElements(fetcher.data.customers)
      if (renders.current < 1) {
        // default value
        const found = fetcher.data.customers.find((c) => c.id === defaultValue)
        setSelected(found ?? null)
        renders.current = renders.current + 1
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data, defaultValue])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    timeout.current && clearTimeout(timeout.current)
    const { value } = event.currentTarget
    timeout.current = setTimeout(() => {
      fetcher.load(`/api/customers?search=${value}`)
    }, 500)
  }

  const loadAgain = () => {
    fetcher.load("/api/customers?search")
  }

  const handleCustomerSelection = (customer: Customer) => {
    loadAgain()
    setSelected(customer)
    onSelect?.(customer)
    setShowClientList(false)
  }

  const handleClearSelection = () => {
    setSelected(null)
    onSelect?.(null)
  }

  return (
    <section
      className="relative"
      onFocus={() => setShowClientList(true)}
      onBlur={() => {
        setTimeout(() => setShowClientList(false), 500)
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
        <div className="rounded-2xl bg-white w-full absolute z-20 top-full mt-2 grid border py-2 px-2 shadow-xl">
          <CustomerList
            onClick={handleCustomerSelection}
            customers={searchableElements}
          />
          <AddCustomerButton onClick={handleClick} />
        </div>
      )}
    </section>
  )
}

const SelectedCustomer = ({
  customer,
  onClear,
}: {
  onClear?: () => void
  customer: Customer
}) => {
  return (
    <section>
      <label className="text-brand_gray font-satoMedium">Cliente</label>
      <div className={cn("border rounded-2xl h-12 mt-1 flex items-center gap-4 px-3")}>
        <span className="text-gray-500">
          <RiUserSearchLine />
        </span>
        <div className="bg-gray-200 rounded-lg py-1 px-3 w-max flex items-center gap-3">
          <span>{customer.displayName}</span>
          <span className="text-gray-400 font-satoshi">{customer.email}</span>
          <button onClick={onClear} className="text-gray-400 hover:text-black">
            <CgRemove />
          </button>
        </div>
      </div>
      <p className="text-xs h-1 pl-1"></p>
    </section>
  )
}

const CustomerList = ({
  customers,
  onClick,
}: {
  onClick?: (arg0: Customer) => void
  customers: Customer[]
}) => {
  return (
    <div className="max-h-[260px] overflow-scroll">
      {customers.map((customer) => (
        <button
          onClick={() => onClick?.(customer)}
          type="button"
          key={customer.id}
          className={cn(
            "py-3 px-3",
            "hover:bg-brand_blue/5 w-full text-left rounded-2xl",
            "my-1",
            "flex items-center gap-3",
          )}
        >
          <span>{customer.displayName}</span>
          <span className="text-gray-400 font-satoshi">{customer.email}</span>
        </button>
      ))}
    </div>
  )
}

const AddCustomerButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-2xl py-2 px-3",
        "text-brand_blue hover:bg-brand_blue/5",
      )}
    >
      <span>
        <FaPlus />
      </span>
      <span>Agregar cliente</span>
    </button>
  )
}
