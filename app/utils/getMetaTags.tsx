export const getMetaTags = ({
  title = "Fixtergeek.com",
  description = "Cursos y recursos de programación y diseño web",
  image = "/cover.png",
  url = "https://fixtergeek.com",
  video,
  audio,
}: {
  title?: string;
  description?: string;
  image?: string;
  video?: string;
  audio?: string;
  url?: string;
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
    content: title,
  },
  {
    property: "og:url",
    content: url,
  },

  {
    property: "og:type",
    content: "video.courses",
  },
  {
    property: "og:image",
    content: image,
  },
  {
    property: "og:image:alt",
    content: "fixtergeek.com logo",
  },
  {
    property: "og:locale",
    content: "es_MX",
  },
  {
    property: "og:video",
    content: video,
  },
  {
    property: "og:audio",
    content: audio,
  },
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
];
