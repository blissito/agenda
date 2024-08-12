export type GetBasicMetaTagsPros = {
  title: string;
  description?: string;
  image?: string;
  twitterCard?: "summary" | "summary_large_image";
};

export default function getBasicMetaTags({
  title,
  description = "Administra la agenda de tu negocio en un solo lugar", // description should be at least 100 chars
  image = "https://i.imgur.com/e0ZkOtT.png",
  twitterCard = "summary",
}: GetBasicMetaTagsPros) {
  if (!title) {
    return [
      {
        title: "Deník",
      },
      {
        name: "description",
        content: "Administra la agenda de tu negocio en un solo lugar",
      },
    ];
  }
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
      name: "og:description",
      content: description,
    },
    {
      property: "og:image",
      content: image,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:url",
      content: "denikso.me",
    },
    {
      name: "twitter:card", // <meta name="twitter" content="twittercard" />
      content: twitterCard,
    },
    {
      name: "twitter:image",
      content: image,
    },
    {
      name: "twitter:url",
      content: image,
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:description",
      content: description,
    },
  ];
}
