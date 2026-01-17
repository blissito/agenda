import type { Org } from "@prisma/client";
import { useRef, type ChangeEvent } from "react";
import { useFetcher } from "react-router";
import { twMerge } from "tailwind-merge";
import { PrimaryButton } from "~/components/common/primaryButton";

export const UsernameInput = ({ org }: { org: Org }) => {
  const fetcher = useFetcher();
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const update = (data: string, intent: string = "org_update") => {
    fetcher.submit(
      {
        data,
        intent,
      },
      { method: "POST", action: "/api/org" }
    );
  };

  const handleSlugChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeout.current ?? undefined);
    timeout.current = setTimeout(() => {
      fetcher.submit(
        {
          data: JSON.stringify({ slug: value.trim(), id: org.id }),
          intent: "org_check_slug",
        },
        { method: "POST", action: "/api/org" }
      );
    }, 1000);
  };

  const handleSlugUpdate = () => {
    if (inputRef.current?.value.trim() === org.slug) return;

    update(
      JSON.stringify({
        slug: inputRef.current?.value.trim(),
        id: org.id,
      })
    );
  };
  return (
    <section>
      <div className="border-brand_ash h-12 w-full px-2 border-[1px] rounded-full flex items-center pl-3 gap-3">
        <input
          ref={inputRef}
          onChange={handleSlugChange}
          className={twMerge(
            "placeholder-brand_iron text-brand_gray font-satoshi rounded-full border-none ",
            "focus:border-brand_blue",
            "h-8 w-full ",
            "disabled:bg-brand_stroke disabled:cursor-not-allowed"
          )}
          defaultValue={org.slug}
        />
        <span>.denik.me</span>
        <PrimaryButton
          type="button"
          isDisabled={fetcher.data?.errors?.slug || fetcher.state !== "idle"}
          className="bg-brand_dark h-[36px]"
          onClick={handleSlugUpdate}
        >
          Actualizar
        </PrimaryButton>
      </div>
      {fetcher.data?.errors?.slug ? (
        <p className="text-red-500 px-4 text-xs">{fetcher.data.errors.slug}</p>
      ) : (
        <p className="text-amber-600 px-4 text-xs mt-1">
          Cambiar tu subdominio hará que los links anteriores dejen de funcionar.
        </p>
      )}
    </section>
  );
};
