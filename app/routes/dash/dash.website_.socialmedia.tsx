import { useForm } from "react-hook-form"
import type { LoaderFunctionArgs } from "react-router"
import { Form, useFetcher, useLoaderData } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { BasicInput } from "~/components/forms/BasicInput"
import { Facebook } from "~/components/icons/facebook"
import { Instagram } from "~/components/icons/insta"
import { Anchor } from "~/components/icons/link"
import { Linkedin } from "~/components/icons/linkedin"
import { Tiktok } from "~/components/icons/tiktok"
import { Twitter } from "~/components/icons/twitter"
import { Youtube } from "~/components/icons/youtube"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request, {
    redirectURL: "/dash/website/",
  })
  if (!org) {
    throw new Response("Org not found", { status: 404 })
  }
  return { org: { social: org.social, id: org.id } }
}

export default function Index() {
  const { org } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const { handleSubmit, register } = useForm({
    defaultValues: org.social || {},
  })

  const onSubmit = (values: unknown) => {
    fetcher.submit(
      {
        data: JSON.stringify({ id: org.id, social: values }),
        intent: "org_update",
      },
      { method: "POST", action: "/api/org" },
    )
  }

  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website">Mi sitio web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website/socialmedia">
              Redes sociales
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl max-w-3xl p-8 mt-6"
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
        <div className="flex mt-16 justify-end gap-6">
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
        </div>
      </Form>
    </section>
  )
}
