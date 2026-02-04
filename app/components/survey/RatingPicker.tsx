import { useState } from "react";

const RATINGS = [
  { value: 1, emoji: "😞", label: "Malo", bg: "bg-red-100", bgSelected: "bg-red-200" },
  { value: 2, emoji: "😕", label: "Regular", bg: "bg-amber-100", bgSelected: "bg-amber-200" },
  { value: 3, emoji: "😐", label: "Normal", bg: "bg-yellow-100", bgSelected: "bg-yellow-200" },
  { value: 4, emoji: "😊", label: "Bueno", bg: "bg-emerald-100", bgSelected: "bg-emerald-200" },
  { value: 5, emoji: "😍", label: "Excelente", bg: "bg-green-100", bgSelected: "bg-green-200" },
];

interface RatingPickerProps {
  value?: number;
  onChange?: (value: number) => void;
  name?: string;
}

export function RatingPicker({ value, onChange, name = "rating" }: RatingPickerProps) {
  const [selected, setSelected] = useState<number | undefined>(value);

  const handleSelect = (rating: number) => {
    setSelected(rating);
    onChange?.(rating);
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={selected || ""} />
      <div className="flex justify-center gap-2 sm:gap-3">
        {RATINGS.map((rating) => {
          const isSelected = selected === rating.value;
          return (
            <button
              key={rating.value}
              type="button"
              onClick={() => handleSelect(rating.value)}
              className={`
                flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all
                ${isSelected ? rating.bgSelected : rating.bg}
                ${isSelected ? "ring-2 ring-brand_blue ring-offset-2 scale-110" : "hover:scale-105"}
              `}
              aria-label={`${rating.label} - ${rating.value} de 5`}
              aria-pressed={isSelected}
            >
              <span className="text-3xl sm:text-4xl">{rating.emoji}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-between px-1 text-xs text-gray-500">
        <span>Malo</span>
        <span>Regular</span>
        <span>Excelente</span>
      </div>
    </div>
  );
}
