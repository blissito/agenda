import type { Org } from "@prisma/client";
import { useRef, type ChangeEvent, type SyntheticEvent } from "react";
import { useFetcher } from "react-router";
import { ColorCube } from "~/components/common/ColorCube";

export const ColorInput = ({ org }: { org: Org }) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetcher = useFetcher();

  const colorInputRef = useRef<HTMLInputElement>(null);

  const update = (data: string, intent: string = "org_update") => {
    fetcher.submit(
      {
        data,
        intent,
      },
      { method: "POST", action: "/api/org" }
    );
  };

  const handleColorChange = (colorString: string) => {
    if (colorInputRef.current) colorInputRef.current.value = colorString;
    update(
      JSON.stringify({
        id: org.id,
        websiteConfig: { color: colorString },
      })
    );
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
          ref={colorInputRef}
          onClick={(e: SyntheticEvent<HTMLInputElement>) =>
            e.currentTarget.select()
          }
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
              handleColorChange(e.target.value);
            }, 500);
          }}
          placeholder="#000000"
          className="placeholder:text-brand_ash focus:border-brand-blue bg-transparent  focus:ring-brand-blue focus:outline-none ring-transparent  active:ring-transparent pl-8 w-28 py-2 pr-2  border-brand_ash rounded-lg"
          id="color"
          type="text"
          defaultValue={org.websiteConfig?.color}
        />
        <ColorCube
          style={{
            backgroundColor: org.websiteConfig?.color || "#705fe0",
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
