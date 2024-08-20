import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";

import { twMerge } from "tailwind-merge";

export type Choice = {
  id: number;
  name?: string;
};

export default function SelectStylized({
  choices = [],
  placeholder,
}: {
  choices: Choice[];
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(choices[0]);

  const filteredChoices =
    query === ""
      ? choices
      : choices.filter((choice) => {
          return choice.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <div className=" w-[180px]">
      <Combobox
        value={selected}
        onChange={(value) => setSelected(value)}
        onClose={() => setQuery("")}
      >
        <div className="relative">
          <ComboboxInput
            className={twMerge(
              "w-full rounded-lg  bg-white border-[1px] border-brand_ash py-1.5 pr-8 pl-3 text-sm/6 text-brand_gray",
              "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
            )}
            displayValue={(choice) => choice?.name}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <IoIosArrowDown className="size-4 fill-brand_gray group-data-[hover]:fill-brand_blue" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={twMerge(
            "w-[var(--input-width)] mt-1 rounded-xl text-brand_gray bg-white border border-brand_stroke p-1 [--anchor-gap:var(--spacing-1)] empty:invisible",
            "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
          )}
        >
          {filteredChoices.map((choice) => (
            <ComboboxOption
              key={choice.id}
              value={choice}
              className="group  flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-brand_pale/40"
            >
              <FaCheck className="invisible w-4 fill-brand_gray group-data-[selected]:visible" />
              <div className="text-sm/6 text-brand_gray">{choice.name}</div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
