import type { SyntheticEvent } from "react";
import { ColorCube } from "~/components/common/ColorCube";

export const ColorInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const handleColorChange = (colorString: string) => {
    onChange(colorString);
  };

  return (
    <section>
      <h3 className="text-brand_dark mb-4 mt-10">
        Color principal de tu sitio
      </h3>

      <label
        htmlFor="color"
        className=" text-xs text-brand_gray flex items-center justify-between relative"
      >
        <input
          onClick={(e: SyntheticEvent<HTMLInputElement>) =>
            e.currentTarget.select()
          }
          onChange={(e) => handleColorChange(e.target.value)}
          placeholder="#000000"
          className="placeholder:text-brand_ash focus:border-brand-blue bg-transparent  focus:ring-brand-blue focus:outline-none ring-transparent  active:ring-transparent pl-8 w-28 py-2 pr-2  border-brand_ash rounded-lg"
          id="color"
          type="text"
          value={value}
        />
        <ColorCube
          style={{
            backgroundColor: value || "#705fe0",
          }}
          className="absolute top-3 left-2"
        />
      </label>
      <div className="flex flex-wrap gap-1 mt-2 ">
        <ColorCube
          hexColor="#bb333c"
          onClick={() => handleColorChange("#bb333c")}
        />
        <ColorCube
          hexColor="#f79c08"
          onClick={() => handleColorChange("#f79c08")}
        />
        <ColorCube
          hexColor="#705fe0"
          onClick={() => handleColorChange("#705fe0")}
        />
        <ColorCube
          hexColor="#F6C056"
          onClick={() => handleColorChange("#F6C056")}
        />
        <ColorCube
          onClick={() => handleColorChange("#69A753")}
          hexColor="#69A753"
        />
        <ColorCube
          onClick={() => handleColorChange("#ae7098")}
          hexColor="#ae7098"
        />
        <ColorCube
          onClick={() => handleColorChange("#1C7AE9")}
          hexColor="#1C7AE9"
        />
      </div>
    </section>
  );
};
