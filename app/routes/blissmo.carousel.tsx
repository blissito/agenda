import { useLoaderData } from "@remix-run/react";
import { SimpleAnimatedGallery } from "~/components/animated/SimpleAnimatedGallery";
import { generatePics } from "~/utils/generators";

export const loader = () => {
  return { pics: generatePics() };
};

export default function Page() {
  const { pics } = useLoaderData<typeof loader>();

  return (
    <article className="bg-slate-100 grid place-content-center h-screen">
      <h1 className="text-4xl font-bold py-2 text-center">
        Qué opinan nuestros estudiantes
      </h1>
      <p className="text-center text-xl pb-6 font-thin">
        Si las imagenes se repiten se buguea 🤬
      </p>
      <SimpleAnimatedGallery delay={2} pics={pics} />
    </article>
  );
}
