export const getMetaTags = ({
  title = "Deník | Tu agenda en un solo lugar",
  description = "Administra la agenda de tu negocio en un solo lugar",
  image = "https://i.imgur.com/zlnq8Jd.png",
  url = "https://denik.me",
  video,
  audio,
}: {
  title?: string
  description?: string
  image?: string
  video?: string
  audio?: string
  url?: string
}) => [
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
