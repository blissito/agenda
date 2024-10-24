import { OneMoreFlipper } from "~/components/animated/OneMoreFlipper";

export default function Route() {
  return (
    <>
      <article className="grid place-items-center h-screen">
        <OneMoreFlipper>
          <div className="p-6 bg-red-500 w-full h-full">
            <img
              className="w-full h-full object-cover"
              src="https://i.imgur.com/qqTYVSy.png"
              alt="ovni"
            />
          </div>
          <div className="p-6 bg-indigo-500  w-full h-full">
            <img
              className="w-full h-full object-cover"
              src="https://i.imgur.com/TaDTihr.png"
              alt="sepa"
            />
          </div>
          <div className="p-6 bg-pink-500  w-full h-full">
            <img
              src="https://i.imgur.com/fptIuQ5.png"
              alt="luigi"
              className="w-full h-full object-cover"
            />
          </div>
        </OneMoreFlipper>
      </article>
    </>
  );
}
