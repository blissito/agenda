import { Form, useFetcher } from "react-router";
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

export const SocialDataForm = ({ org }: { org?: Org }) => {
  const fetcher = useFetcher();

  const { handleSubmit, register } = useForm({
    defaultValues: org?.social || {},
  });

  const onSubmit = (values: unknown) => {
    fetcher.submit(
      {
        data: JSON.stringify({ social: values }),
        intent: "update_org_social",
      },
      { method: "POST" }
    );
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl max-w-3xl px-4 pb-20"
    >
      <h2
        className="font-satoMiddle mb-8 text-xl
          "
      >
        Actualiza tus redes sociales
      </h2>
      <BasicInput
        registerOptions={{ required: false }}
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
      <hr />
      <footer className="flex mt-16 justify-end gap-6 absolute bottom-28">
        <SecondaryButton
          isDisabled={fetcher.state !== "idle"}
          as="Link"
          to="/dash/website"
          className="w-[120px]"
          prefetch="render"
        >
          Cancelar
        </SecondaryButton>
        <PrimaryButton isDisabled={fetcher.state !== "idle"}>
          Guardar
        </PrimaryButton>
      </footer>
    </Form>
  );
};
