import { StickyScroll } from "~/components/animated/StickyScrollReveal";

const images = [
  "/blissmo/anim_chat.gif",
  "/blissmo/anim_phone.gif",
  "/blissmo/anim.gif",
  "/blissmo/chat.png",
  "/blissmo/geek.png",
];

export default function Route() {
  return (
    <article className="h-screen bg-slate-950">
      <div className="h-[60%] bg-gray-900" />
      <StickyScroll
        items={[
          {
            twColor: "bg-indigo-500",
            img: (
              <img
                className="object-cover h-full w-full"
                src={images[0]}
                alt="perro"
              />
            ),
            text: (
              <p className="font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis corporis numquam illum ratione neque? Doloremque at,
                pariatur aperiam ipsam repellat placeat itaque numquam veritatis
                eius cumque sed architecto dolorum iure.
              </p>
            ),
            title: "Un gran título",
          },
          {
            twColor: "bg-indigo-600",
            img: (
              <img
                className="w-full h-full object-cover"
                src={images[1]}
                alt="perro"
              />
            ),
            text: (
              <p className="font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis corporis numquam illum ratione neque? Doloremque at,
                pariatur aperiam ipsam repellat placeat itaque numquam veritatis
                eius cumque sed architecto dolorum iure.
              </p>
            ),
            title: "Un gran título dos",
          },
          {
            twColor: "bg-indigo-700",

            img: (
              <img
                className="aspect-square object-cover"
                src={images[2]}
                alt="perro"
              />
            ),
            text: (
              <p className="font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis corporis numquam illum ratione neque? Doloremque at,
                pariatur aperiam ipsam repellat placeat itaque numquam veritatis
                eius cumque sed architecto dolorum iure.
              </p>
            ),
            title: "Un feo título",
          },
          {
            twColor: "bg-indigo-800",

            img: (
              <img
                className="aspect-square object-cover"
                src={images[3]}
                alt="perro"
              />
            ),
            text: (
              <p className="font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis corporis numquam illum ratione neque? Doloremque at,
                pariatur aperiam ipsam repellat placeat itaque numquam veritatis
                eius cumque sed architecto dolorum iure.
              </p>
            ),
            title: "Un raro título",
          },
          {
            twColor: "bg-indigo-900",

            img: (
              <img
                className="aspect-square object-cover"
                src={images[4]}
                alt="perro"
              />
            ),
            text: (
              <p className="font-sans">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Blanditiis corporis numquam illum ratione neque? Doloremque at,
                pariatur aperiam ipsam repellat placeat itaque numquam veritatis
                eius cumque sed architecto dolorum iure.
              </p>
            ),
            title: "Un chido título",
          },
        ]}
      />
      <div className="h-[60%] bg-gray-900" />
    </article>
  );
}
