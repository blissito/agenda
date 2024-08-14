import { Avatar } from "~/components/common/Avatar";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { Anchor } from "~/components/icons/link";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Clients() {
  return (
    <main className=" ">
      <RouteTitle>Clientes</RouteTitle>
      <Summary />
      {/* <EmptyStateClients /> */}
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

const EmptyStateClients = () => {
  return (
    <div className=" w-full h-[80vh] bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto mb-4" src="/images/clients-empty.svg" />
        <p className="font-satoMedium text-xl font-bold">
          ¡Nada por aquí! <span className="text-2xl ">👀</span>{" "}
        </p>
        <p className="mt-2 text-brand_gray">
          Comparte tu agenda y empieza a recibir a tus clientes
        </p>
        <SecondaryButton className="mx-auto mt-12 bg-transparent border-[1px] border-[#CFCFCF]">
          <Anchor /> Copiar link
        </SecondaryButton>
      </div>
    </div>
  );
};
