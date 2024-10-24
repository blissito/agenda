import { SimpleFlipper } from "~/components/animated/SimpleFlipper";

export default function Route() {
  return (
    <article className="flex justify-center items-center h-screen">
      <SimpleFlipper>
        <img className="" src="https://i.imgur.com/nITUzj1.png" alt="demo" />
        <img src="https://i.imgur.com/ruOqfsG.png" alt="demo" />
        <img src="https://i.imgur.com/ArpsLvc.png" alt="demo" />
        <img src="https://i.imgur.com/Y6yuZph.png" alt="demo" />
        <img src="https://i.imgur.com/UF2tnsg.png" alt="demo" />
      </SimpleFlipper>
    </article>
  );
}
