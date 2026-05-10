import { DEFAULT_OG_IMAGE } from "./urls"

const inferImageMime = (url: string): string => {
  const lower = url.toLowerCase().split("?")[0]
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  return "image/png"
}

// HTML attribute values can't contain raw line breaks or unescaped quotes.
// Some parsers (Facebook's scraper) treat \n inside content="..." as the end
// of the attribute, which breaks all subsequent meta tag parsing.
const sanitizeMeta = (value: string, max = 300): string => {
  return value
    .replace(/\s+/g, " ")
    .replace(/"/g, "'")
    .trim()
    .slice(0, max)
}

export const getMetaTags = ({
  title = "Deník | Tu agenda en líneaen un solo lugar",
  description = "Administra la agenda de tu negocio en un solo lugar con IA",
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
  const safeTitle = sanitizeMeta(title, 200)
  const safeDescription = sanitizeMeta(description, 300)
  return [
  { title: safeTitle },
  {
    property: "og:title",
    content: safeTitle,
  },
  {
    name: "description",
    content: safeDescription,
  },
  {
    property: "og:description",
    content: safeDescription,
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
    content: safeTitle,
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
    content: safeTitle,
  },
  {
    property: "twitter:description",
    content: safeDescription,
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
