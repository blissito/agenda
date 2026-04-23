import { SecondaryButton } from "~/components/common/secondaryButton"
import { useCopyLink } from "~/components/hooks/useCopyLink"
import { Anchor } from "~/components/icons/link"

export const EmptyStateReviews = ({ link }: { link: string }) => {
  const { setLink, ref } = useCopyLink(link)
  return (
    <div className="w-full flex justify-center items-center min-h-[calc(100vh-12rem)] py-4 box-border">
      <div className="text-center">
        <img
          className="mx-auto mb-4 w-[200px] md:w-auto"
          src="/images/emptyState/clients-empty.webp"
          alt="illustration"
        />
        <p className="text-xl md:text-2xl font-satoBold">
          Las reseñas empiezan con una buena experiencia
        </p>
        <p className="mt-2 text-brand_gray text-base md:text-[18px] font-satoshi">
          Brinda un gran servicio y deja que tus clientes cuenten cómo les fue
        </p>
        <SecondaryButton
          ref={ref}
          onClick={setLink}
          className="mx-auto mt-12 bg-transparent border-[1px] border-[#CFCFCF]"
        >
          <span className="text-inherit">
            <Anchor />
          </span>
          <span>Copiar link</span>
        </SecondaryButton>
      </div>
    </div>
  )
}
