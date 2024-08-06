import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { BasicInput } from "~/components/forms/BasicInput";
import { Facebook } from "~/components/icons/facebook";
import { Twitter } from "~/components/icons/twitter";
import { Instagram } from "~/components/icons/insta";
import { Tiktok } from "~/components/icons/tiktok";
import { Linkedin } from "~/components/icons/linkedin";
import { Anchor } from "~/components/icons/link";

export default function Index() {
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
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <h2
          className="font-satoMiddle mb-8 text-xl
          "
        >
          Actualiza tus redes sociales
        </h2>
        <BasicInput
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
          name="twitter"
          placeholder="x.com"
          label={
            <span className="flex items-center">
              <Twitter className="w-5 h-5" />
              Twitter o X
            </span>
          }
        />
        <BasicInput
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
          name="facebook"
          placeholder="linkedin.com"
          label={
            <span className="flex items-center">
              <Linkedin className="w-5 h-5" />
              Linkedin
            </span>
          }
        />
        <BasicInput
          name="facebook"
          placeholder="tupagina.com"
          label={
            <span className="flex items-center">
              <Anchor className="w-5 h-5" />
              Website
            </span>
          }
        />
        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton as="Link" to="/dash/website" className="w-[120px]">
            Cancelar
          </SecondaryButton>
          <PrimaryButton>Guardar</PrimaryButton>
        </div>
      </div>
    </section>
  );
}
