import { MosaicHero } from "~/components/animated/MosaicHero";

export default function Route() {
  return (
    <article>
      <h2 className="py-6 bg-gray-950 text-white px-20">
        Blissmo Podcast Platform
      </h2>
      <MosaicHero images={[]}>
        <h1 className="md:text-6xl text-3xl font-bold font-sans mb-8 max-w-2xl">
          Monta tu propio sitio web para tu podcast
        </h1>
        <p className="md:text-lg text-md font-sans font-bold text-gray-200 mb-12 max-w-2xl">
          Publica tu show sin configuraciones técnicas, al subir tus episodios
          estos serán publicados en todas partes, incluido Apple podcast y
          Spotify. ✅
        </p>
        <button className="py-2 px-4 bg-indigo-500 text-white font-bold cursor-pointer rounded-3xl text-xl">
          Empezar
        </button>
      </MosaicHero>
    </article>
  );
}

{
  /* <img src="/images/yutu/movies.png" alt="" /> */
}
