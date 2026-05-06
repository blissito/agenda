import { DEFAULT_OG_IMAGE } from "./urls"

const inferImageMime = (url: string): string => {
  const lower = url.toLowerCase().split("?")[0]
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  return "image/png"
}

export const getMetaTags = ({
  title = "Deník | Tu agenda en un solo lugar",
  description = "Administra la agenda de tu negocio en un solo lugar",
  image = DEFAULT_OG_IMAGE,
  imageWidth,
  imageHeight,
  url = "https://denik.me",
  video,
  audio,
}: {
  title?: string
  description?: string
  image?: string
  imageWidth?: number
  imageHeight?: number
  video?: string
  audio?: string
  url?: string
}) => {
  const isDefaultImage = image === DEFAULT_OG_IMAGE
  const w = imageWidth ?? (isDefaultImage ? 1200 : undefined)
  const h = imageHeight ?? (isDefaultImage ? 630 : undefined)
  return [
  { title },
  {
    property: "og:title",
    content: title,
  },
  {
    name: "description",
    content: description,
  },
  {
    property: "og:description",
    content: description,
  },
  {
    property: "og:site_name",
    content: "Deník",
  },
  {
    property: "og:url",
    content: url,
  },
  {
    property: "og:type",
    content: "website",
  },
  {
    property: "og:image",
    content: image,
  },
  {
    property: "og:image:secure_url",
    content: image,
  },
  {
    property: "og:image:type",
    content: inferImageMime(image),
  },
  ...(w
    ? [{ property: "og:image:width", content: String(w) }]
    : []),
  ...(h
    ? [{ property: "og:image:height", content: String(h) }]
    : []),
  {
    property: "og:image:alt",
    content: title,
  },
  {
    property: "og:locale",
    content: "es_MX",
  },
  ...(video ? [{ property: "og:video", content: video }] : []),
  ...(audio ? [{ property: "og:audio", content: audio }] : []),
  {
    property: "twitter:card",
    content: "summary_large_image",
  },
  {
    property: "twitter:url",
    content: url,
  },
  {
    property: "twitter:title",
    content: title,
  },
  {
    property: "twitter:description",
    content: description,
  },
  {
    property: "twitter:image",
    content: image,
  },
  {
    name: "facebook-domain-verification",
    content: "9cs2yjdol8os1yyxqmrghha3dhdr6l",
  },
  ]
}
