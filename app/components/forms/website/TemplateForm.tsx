import {
  type ChangeEvent,
  type ReactNode,
  type SyntheticEvent,
  useRef,
} from "react";
import { twMerge } from "tailwind-merge";
import type { Org } from "@prisma/client";
import { Form, useFetcher } from "react-router";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { ColorCube } from "~/components/common/ColorCube";
import { Palomita } from "~/components/common/Palomita";

export const TemplateForm = ({
  defaultValues = {},
  onClose,
}: {
  onClose?: () => void;
  defaultValues: Partial<Org>;
}) => {
  const fetcher = useFetcher();
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const update = (data: string, intent: string = "org_update") => {
    fetcher.submit(
      {
        data,
        intent,
      },
      { method: "POST", action: "/api/org" }
    );
    onClose?.(); // @todo we can pass the data
  };

  const handleSlugChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeout.current ?? undefined);
    timeout.current = setTimeout(() => {
      fetcher.submit(
        {
          data: JSON.stringify({ slug: value.trim(), id: defaultValues.id }),
          intent: "org_check_slug",
        },
        { method: "POST", action: "/api/org" }
      );
    }, 500);
  };

  const handleSlugUpdate = () => {
    if (inputRef.current?.value.trim() === defaultValues.slug) return;
    update(
      JSON.stringify({
        slug: inputRef.current?.value.trim(),
        id: defaultValues.id,
      })
    );
  };

  const handleTemplateSelection = (templateName: string) => {
    update(
      JSON.stringify({
        id: defaultValues.id,
        websiteConfig: { template: templateName },
      })
    );
  };

  const handleColorChange = (colorString: string) => {
    if (colorInputRef.current) colorInputRef.current.value = colorString;
    update(
      JSON.stringify({
        id: defaultValues.id,
        websiteConfig: { color: colorString },
      })
    );
  };

  return (
    <Form className="grid">
      <h2 as="h3" className=" font-satoMiddle text-brand_dark text-2xl mb-8 ">
        Sitio web
      </h2>
      <div className="border-brand_ash h-12 w-full px-2 border-[1px] rounded-full flex items-center pl-3 gap-3">
        <span>denik.me/</span>
        <input
          ref={inputRef}
          onChange={handleSlugChange}
          className={twMerge(
            "placeholder-brand_iron text-brand_gray font-satoshi rounded-full border-none ",
            "focus:border-brand_blue",
            "h-8 w-full ",
            "disabled:bg-brand_stroke disabled:cursor-not-allowed"
          )}
          defaultValue={defaultValues.slug}
        />
        <PrimaryButton
          isDisabled={fetcher.data?.errors?.slug || fetcher.state !== "idle"}
          className="bg-brand_dark h-[36px]"
          onClick={handleSlugUpdate}
        >
          Actualizar
        </PrimaryButton>
      </div>
      <p className="text-red-500 px-4">{fetcher.data?.errors.slug}</p>
      <hr className="bg-brand_stroke h-[1px] border-none my-6" />
      <h3 className="text-brand_dark mb-4">Plantilla</h3>
      <div className="flex gap-6">
        <button
          onClick={() => handleTemplateSelection("defaultTemplate")}
          type="button"
          className="text-center relative rounded-2xl "
        >
          {defaultValues.websiteConfig?.template === "defaultTemplate" && (
            <Palomita />
          )}

          <div
            className={twMerge(
              "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]",
              defaultValues.websiteConfig?.template === "defaultTemplate"
                ? " ring-brand_blue rounded-2xl ring"
                : null
            )}
          >
            <img
              className="rounded-2xl w-full object-cover "
              src="/images/template1.svg"
              alt="template1"
            />
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleTemplateSelection("blissmoTemplate")}
          className="text-center relative flex gap-6"
        >
          {defaultValues.websiteConfig?.template === "blissmoTemplate" && (
            <Palomita />
          )}

          <div
            className={twMerge(
              "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]",
              defaultValues.websiteConfig?.template === "blissmoTemplate"
                ? " ring-brand_blue rounded-md ring"
                : null
            )}
          >
            <img
              className="rounded-2xl w-full object-cover "
              src="/images/template2.svg"
              alt="template1"
            />
          </div>
        </button>
      </div>
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
          defaultValue={defaultValues.websiteConfig?.color}
        />
        <ColorCube
          style={{
            backgroundColor: defaultValues.websiteConfig?.color || "#705fe0",
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
      <div className="flex mt-16 justify-end gap-6">
        <SecondaryButton
          as="Link"
          to="/dash/website"
          className="w-[120px]"
          onClick={onClose}
        >
          Terminar
        </SecondaryButton>
        {/* <PrimaryButton>Guardar</PrimaryButton> */}
      </div>
    </Form>
  );
};
