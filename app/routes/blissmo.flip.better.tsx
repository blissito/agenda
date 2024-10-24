import { BetterFlipper } from "~/components/animated/BetterFlipper";

export default function Route() {
  return (
    <>
      <BetterFlipper>
        <div className="p-6 bg-red-500">
          <img src="https://i.imgur.com/qqTYVSy.png" alt="ovni" />
        </div>
        <div className="p-6 bg-indigo-500">
          <img src="https://i.imgur.com/TaDTihr.png" alt="ovni" />
        </div>
        <div className="p-6 bg-pink-500">
          <img src="https://i.imgur.com/fptIuQ5.png" alt="luigi" />
        </div>
      </BetterFlipper>
    </>
  );
}
