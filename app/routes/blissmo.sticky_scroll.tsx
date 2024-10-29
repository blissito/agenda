import { StickyScrollReveal } from "~/components/animated/StickyScrollReveal";

export default function Route() {
  return (
    <article className="h-screen bg-slate-950">
      <div className="h-[60%] bg-gray-900" />
      <StickyScrollReveal
        items={[
          {
            twColor: "bg-indigo-500",
            img: (
              <img
                className="object-cover h-full w-full"
                src="https://i.imgur.com/WpmbbPu.png"
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
                src="https://i.imgur.com/FOFW9Oc.png"
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
            twColor: "bg-indigo-700",

            img: (
              <img
                className="aspect-square object-cover"
                src="https://i.imgur.com/GIFCLAr.png"
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
            twColor: "bg-indigo-800",

            img: (
              <img
                className="aspect-square object-cover"
                src="https://i.imgur.com/kt6SiY9.png"
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
            twColor: "bg-indigo-900",

            img: (
              <img
                className="aspect-square object-cover"
                src="https://i.imgur.com/HITwAZk.png"
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
        ]}
      />
      <div className="h-[60%] bg-gray-900" />
    </article>
  );
}
