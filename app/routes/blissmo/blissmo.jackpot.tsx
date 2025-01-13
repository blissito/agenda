import { JackPotSection } from "~/components/animated/JackPotSection";

export default function Route() {
  return (
    <article>
      <div className="h-[50vh] bg-gray-800 rounded-xl" />
      <JackPotSection
        images={[
          "/blissmo/coder.png",
          "/blissmo/css.png",
          "/blissmo/git.png",
          "/blissmo/html.png",
          "/blissmo/javascript.png",
          "/blissmo/tailwind-css.png",
          "/blissmo/typescript.png",
          "/blissmo/youtube.png",
        ]}
        mode="fast"
      />
      <div className="h-[50vh] bg-gray-800 rounded-xl" />
    </article>
  );
}
