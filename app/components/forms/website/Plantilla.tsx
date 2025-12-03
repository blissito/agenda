import type { Org } from "@prisma/client";
import { useState } from "react";
import { useFetcher } from "react-router";
import { twMerge } from "tailwind-merge";
import { ImageCube } from "~/components/animated/MosaicHero";
import { Palomita } from "~/components/common/Palomita";

export const Plantilla = ({ org }: { org: Org }) => {
  return (
    <section>
      <h3 className="text-brand_dark mb-4">Plantilla</h3>
      <PlantillaSelect org={org} />
    </section>
  );
};

export const PlantillaSelect = ({
  readOnly,
  org,
}: {
  readOnly?: boolean;
  org: Org;
}) => {
  const [selected, set] = useState<string>(org.websiteConfig?.template ?? "");
  const fetcher = useFetcher();

  const update = (data: string, intent: string = "org_update") => {
    fetcher.submit(
      {
        data,
        intent,
      },
      { method: "POST", action: "/api/org" }
    );
  };
  const handleTemplateSelection = (templateName: string) => () => {
    set(templateName);
    update(
      JSON.stringify({
        id: org.id,
        websiteConfig: { ...org.websiteConfig, template: templateName },
      })
    );
  };

  if (readOnly) {
    return org.websiteConfig?.template === "defaultTemplate" ? (
      <CubeImage src="/images/template1.svg" />
    ) : (
      <CubeImage src="/images/template2.svg" />
    );
  }

  return (
    <div className="flex gap-6">
      <button
        onClick={handleTemplateSelection("defaultTemplate")}
        type="button"
        className="text-center relative rounded-2xl "
      >
        {selected === "defaultTemplate" && <Palomita />}

        <div
          className={twMerge(
            "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]",
            selected === "defaultTemplate"
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
        onClick={handleTemplateSelection("blissmoTemplate")}
        className="text-center relative flex gap-6"
      >
        {selected === "blissmoTemplate" && <Palomita />}

        <div
          className={twMerge(
            "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]",
            selected === "blissmoTemplate"
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
  );
};

const CubeImage = ({ src }: { src: string }) => {
  return (
    <div
      className={twMerge(
        "border-[1px] border-brand_stroke rounded-2xl p-3 w-[240px]"
      )}
    >
      <img
        src={src}
        className="rounded-2xl w-full object-cover "
        alt="template"
      />
    </div>
  );
};
