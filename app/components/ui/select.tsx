import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { useState } from "react"
import { FaCheck } from "react-icons/fa6"
import { IoIosArrowDown } from "react-icons/io"

import { twMerge } from "tailwind-merge"

export type Choice = {
  value: string
  label: string
}

export default function SelectStylized({
  choices = [],
  placeholder,
  value: controlledValue,
  onChange,
  name,
}: {
  choices: Choice[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  name?: string
}) {
  const [query, setQuery] = useState("")
  const [internalValue, setInternalValue] = useState<string | undefined>(
    undefined,
  )

  // Support both controlled and uncontrolled modes
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const selected = choices.find((c) => c.value === value) || null

  const filteredChoices =
    query === ""
      ? choices
      : choices.filter((choice) => {
          return choice.label.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <div className=" w-[180px]">
      <Combobox
        value={selected}
        onChange={(choice) => {
          const newValue = choice?.value || ""
          if (!isControlled) {
            setInternalValue(newValue)
          }
          onChange?.(newValue)
        }}
        onClose={() => setQuery("")}
      >
        {name && (
          <input type="hidden" name={name} value={selected?.value || ""} />
        )}
        <ComboboxButton as="div" className="relative cursor-pointer">
          <ComboboxInput
            readOnly
            placeholder={placeholder}
            className={twMerge(
              "w-full rounded-2xl bg-white border-[1px] border-brand_ash py-1.5 pr-8 pl-3 text-sm/6 text-brand_gray cursor-pointer",
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25",
            )}
            displayValue={(choice: Choice | null) => choice?.label || ""}
          />
          <IoIosArrowDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 fill-brand_gray" />
        </ComboboxButton>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={twMerge(
            "w-[var(--input-width)] mt-1 rounded-xl text-brand_gray bg-white border border-brand_stroke p-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
            "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0",
          )}
        >
          {filteredChoices.map((choice) => (
            <ComboboxOption
              key={choice.value}
              value={choice}
              className="group  flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-brand_blue/5"
            >
              <FaCheck className="invisible w-4 fill-brand_gray group-data-[selected]:visible" />
              <div className="text-sm/6 text-brand_gray">{choice.label}</div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}
