import { Flipper } from "~/components/animated/Flipper";

export default function Route() {
  return (
    <>
      <article className="grid place-items-center h-screen">
        <Flipper twColor="black">
          <div className="p-6 bg-red-500 w-full h-full">
            <img
              className="w-full h-full object-cover"
              src="https://i.imgur.com/qqTYVSy.png"
              alt="ovni"
            />
          </div>
          <div className="p-6 bg-indigo-500 flex justify-center items-center w-full h-full">
            <img
              className="w-40 h-40 object-cover rounded-full bg-white"
              src="https://i.imgur.com/TaDTihr.png"
              alt="me?"
            />
          </div>
          <div className="p-6 bg-pink-500  w-full h-full">
            <img
              src="https://i.imgur.com/fptIuQ5.png"
              alt="luigi"
              className="w-full h-full object-cover"
            />
          </div>
        </Flipper>
      </article>
    </>
  );
}
