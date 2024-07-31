import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Tag } from "~/components/common/Tag";
import { Plus } from "~/components/icons/plus";
import { RouteTitle } from "~/components/sideBar/routeTitle";
import { getServices } from "~/db/userGetters";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const services = await getServices(request);

  return { services };
};

export default function Services() {
  const { services } = useLoaderData<typeof loader>();
  const origin = useRef<string>("");

  useEffect(() => {
    origin.current = location.origin;
  }, []);

  const getLink = (serviceId: string) => `/dash/servicios/${serviceId}`;

  console.log("LINK: ", getLink(services[0].id));

  return (
    <main className=" ">
      <RouteTitle>Servicios </RouteTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service) => (
          <ServiceCard
            image={service.photoURL ?? undefined}
            key={service.id}
            title={service.name}
            duration={service.duration} // @TODO: format function this is minutes for now
            price={`${service.price} mxn`}
            status={service.isActive ? "Activo" : "Desactivado"}
            link={getLink(service.id)}
          />
        ))}
        <AddService />
      </div>
      <Outlet />
    </main>
  );
}

const ServiceCard = ({
  title,
  image,
  duration,
  price,
  link,
}: {
  title: string;
  image?: string;
  duration: number;
  price: string;
  status: string;
  link?: string;
}) => {
  return (
    <Link to={link ? link : "/dash/servicios"}>
      <section className="bg-white rounded-2xl overflow-hidden hover:animate-movement-effect cursor-pointer">
        <img
          alt="cover"
          className="w-full h-[160px] object-cover"
          src={image ? image : "/images/serviceDefault.png"}
        />
        <div className="p-4 flex justify-between items-center">
          <article>
            <h3 className=" text-brand_dark text-lg font-satoMiddle">
              {title}
            </h3>
            <p className="text-brand_gray font-satoshi mt-1">
              {duration}
              <span className="mx-1">·</span>${price}
            </p>
          </article>
          <Tag />
        </div>
      </section>
    </Link>
  );
};

const AddService = () => {
  return (
    <Link to="/dash/servicios/nuevo">
      <button className="group h-full  bg-transparent  rounded-2xl border-[1px] border-brand_gray  border-dashed w-full flex justify-center items-center text-center ">
        <div>
          <Plus className="mx-auto group-hover:scale-125 transition-all" />
          <p className="font-satoshi text-brand_gray mt-4 group-hover:scale-110 transition-all">
            Agrega un nuevo servicio
          </p>
        </div>
      </button>
    </Link>
  );
};
