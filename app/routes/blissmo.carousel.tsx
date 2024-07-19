import { useLoaderData } from "@remix-run/react";
import { SimpleAnimatedGallery } from "~/components/animated/SimpleAnimatedGallery";
import { generatePics } from "~/utils/generatePics";

export const loader = () => {
  return { pics: generatePics() };
};

export default function Page() {
  const { pics } = useLoaderData<typeof loader>();

  return (
    <article className="bg-slate-100 grid place-content-center h-screen">
      <h1 className="text-2xl font-bold py-2 text-center">
        Qué opinan nuestros estudiantes
      </h1>
      <p className="text-center text-xs pb-6">
        Si las imagenes se repiten se buguea 🤬
      </p>
      <SimpleAnimatedGallery delay={2} pics={pics} />
    </article>
  );
}
