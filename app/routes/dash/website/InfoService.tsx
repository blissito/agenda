import { Image } from "~/components/common/Image"
import { cn } from "~/utils/cn"

export const InfoService = ({
  image,
  title,
  link,
  isActive,
}: {
  isActive?: boolean
  image?: string
  title: string
  link?: string
}) => {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      href={link}
      className="flex gap-4 my-4 items-center font-satoshi"
    >
      <Image
        alt="service"
        className="w-16 h-12 rounded object-cover"
        src={image}
      />
      <p>{title}</p>
      <span
        className={cn(
          "text-xs py-1 px-2 rounded-full text-brand_gray",
          isActive ? "bg-green-100" : "bg-gray-100",
        )}
      >
        {" "}
        {isActive ? "público" : "oculto"}
      </span>
    </a>
  )
}
