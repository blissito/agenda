import { Link, Outlet } from "@remix-run/react";
import { Tag } from "~/components/common/Tag";
import { Plus } from "~/components/icons/plus";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Services() {
  return (
    <main className=" ">
      <RouteTitle>Servicios </RouteTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceCard
          title="Clase de violín"
          duration="1hr"
          price="499 mxn"
          status="Active"
        />
        <ServiceCard
          title="Clase de violín"
          duration="1hr"
          price="499 mxn"
          status="Active"
        />
        <ServiceCard
          title="Clase de violín"
          duration="1hr"
          price="499 mxn"
          status="Active"
        />
        <ServiceCard
          title="Clase de violín"
          duration="1hr"
          price="499 mxn"
          status="Active"
        />
        <ServiceCard
          title="Clase de violín"
          duration="1hr"
          price="499 mxn"
          status="Active"
        />
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
  status,
  link,
}: {
  title: string;
  image?: string;
  duration: string;
  price: string;
  status: string;
  link?: string;
}) => {
  return (
    <Link to={link ? link : "/dash/services/unid"}>
      <section className="bg-white rounded-2xl overflow-hidden hover:animate-movement-effect cursor-pointer">
        <img
          className="w-full h-[160px] object-cover"
          src={image ? image : "/images/serviceDefault.png"}
        />
        <div className="p-4 flex justify-between items-center">
          <article>
            <h3 className="font-[500] text-brand_dark text-lg">{title}</h3>
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
    <button className="group  bg-transparent  rounded-2xl border-[1px] border-brand_gray  border-dashed w-full flex justify-center items-center text-center ">
      <div>
        <Plus className="mx-auto group-hover:scale-125 transition-all" />
        <p className="font-satoshi text-brand_gray mt-4 group-hover:scale-110 transition-all">
          Agrega un nuevo servicio
        </p>
      </div>
    </button>
  );
};
