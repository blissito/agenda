import { useFetcher } from "react-router";
import { BasicInput } from "../BasicInput";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Facebook } from "~/components/icons/facebook";
import { Twitter } from "~/components/icons/twitter";
import { Instagram } from "~/components/icons/insta";
import { Tiktok } from "~/components/icons/tiktok";
import { Linkedin } from "~/components/icons/linkedin";
import { Anchor } from "~/components/icons/link";
import { useForm } from "react-hook-form";
import type { Org } from "@prisma/client";
import { Youtube } from "~/components/icons/youtube";

export const SocialDataForm = ({
  defaultValues,
  onClose,
}: {
  onClose?: () => void;
  defaultValues?: Org;
}) => {
  const fetcher = useFetcher();

  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = useForm({
    defaultValues: defaultValues?.social || {},
  });

  const onSubmit = (values: unknown) => {
    console.log("SUBMITING", values);
    fetcher.submit(
      {
        data: JSON.stringify({ social: values, id: defaultValues?.id }),
        intent: "org_update",
      },
      { method: "POST", action: "/api/org" }
    );
    onClose?.();
  };

  const isDisabled = !isDirty || !isValid;
  const isLoading = fetcher.state !== "idle";

  return (
    <fetcher.Form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl w-[320px]"
    >
      <h2
        className="font-satoMiddle mb-8 text-xl
          "
      >
        Actualiza tus redes sociales
      </h2>
      <BasicInput
        registerOptions={{ required: true }}
        register={register}
        name="youtube"
        placeholder="youtube.com"
        label={
          <span className="flex items-center">
            <Youtube className="w-5 h-5" />
            Youtube
          </span>
        }
      />
      <BasicInput
        registerOptions={{ required: false }}
        register={register}
        name="facebook"
        placeholder="facebook.com"
        label={
          <span className="flex items-center">
            <Facebook className="w-5 h-5" />
            Facebook
          </span>
        }
      />
      <BasicInput
        registerOptions={{ required: false }}
        register={register}
        name="instagram"
        placeholder="instagram.com"
        label={
          <span className="flex items-center">
            <Instagram className="w-5 h-5" />
            Instagram
          </span>
        }
      />
      <BasicInput
        registerOptions={{ required: false }}
        register={register}
        name="x"
        placeholder="x.com"
        label={
          <span className="flex items-center">
            <Twitter className="w-5 h-5" />
            Twitter o X
          </span>
        }
      />
      <BasicInput
        registerOptions={{ required: false }}
        register={register}
        name="tiktok"
        placeholder="tiktok.com"
        label={
          <span className="flex items-center">
            <Tiktok className="w-5 h-5" />
            Tiktok
          </span>
        }
      />
      <BasicInput
        registerOptions={{ required: false }}
        register={register}
        name="linkedin"
        placeholder="linkedin.com"
        label={
          <span className="flex items-center">
            <Linkedin className="w-5 h-5" />
            Linkedin
          </span>
        }
      />
      <BasicInput
        registerOptions={{ required: false }}
        register={register}
        name="website"
        placeholder="tupagina.com"
        label={
          <span className="flex items-center">
            <Anchor className="w-5 h-5" />
            Website
          </span>
        }
      />
      <footer className="flex justify-center gap-4 sticky bottom-0 py-4 bg-white">
        <SecondaryButton
          onClick={onClose}
          className="w-[120px]"
          prefetch="render"
        >
          Cancelar
        </SecondaryButton>
        <PrimaryButton
          isLoading={isLoading}
          type="submit"
          isDisabled={isDisabled}
        >
          Guardar
        </PrimaryButton>
      </footer>
    </fetcher.Form>
  );
};
