import { Avatar } from "~/components/common/Avatar";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Clients() {
  return (
    <main className=" ">
      <RouteTitle>Clientes</RouteTitle>
      <Summary />
    </main>
  );
}

export const Summary = () => {
  return (
    <section className="bg-white rounded-2xl p-6 flex justify-between items-center">
      <div>
        <p>
          <span className="text-brand_blue text-2xl font-satoMedium mr-1">
            28 clientes nuevos
          </span>{" "}
          este mes
        </p>
        <p className="text-brand_gray font-satoshi mt-2">
          15% más que el mes anterior
        </p>
      </div>
      <div className="flex ">
        <Avatar />
        <Avatar />
        <Avatar />
        <Avatar />
        <div className="bg-brand_blue/20 text-brand_blue w-12 h-12 rounded-full grid content-center text-center -ml-3  border-[2px] border-white">
          <span>+ 10</span>
        </div>
      </div>
    </section>
  );
};
