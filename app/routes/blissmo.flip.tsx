import { Flipper } from "~/components/animated/Flipper";

export default function Route() {
  return (
    <article>
      <section className="flex items-center px-6 py-20">
        <h1 className="text-6xl">
          Los componentes animados cambian la personalidad de tus proyectos
        </h1>
        <Flipper>
          <div className="bg-indigo-500">
            <img
              src="https://i.pinimg.com/originals/da/06/e1/da06e1be9c12e606745ef470748937da.png"
              alt="perro"
            />
          </div>
          <div className="bg-pink-500">
            <img
              src="https://png.pngtree.com/png-vector/20240606/ourmid/pngtree-black-logo-with-a-leaf-logo-vector-png-image_6991328.png"
              alt="perros"
            />
          </div>
          <div className="bg-slate-500">
            <img
              src="https://png.pngtree.com/png-vector/20240626/ourmid/pngtree-flying-eagle-black-logo-vector-png-image_12713602.png"
              alt="aguila"
            />
          </div>
        </Flipper>
      </section>
    </article>
  );
}
