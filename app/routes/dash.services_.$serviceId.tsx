import { IoIosArrowForward } from "react-icons/io";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { InfoBox, InfoService } from "./dash.website";
import { Link } from "@remix-run/react";

export default function Page() {
  return (
    <section>
      <div className="flex items-center text-sm text-brand_gray gap-1">
        <Link to="/dash/services">
          <span>Servicios </span>
        </Link>

        <IoIosArrowForward />
        <span>Unid </span>
      </div>
      <div className="grid grid-cols-4 mt-8">
        <ServiceDetail />
      </div>
    </section>
  );
}

export const ServiceDetail = () => {
  return (
    <div className="bg-white rounded-2xl p-8 col-span-4 lg:col-span-3">
      <div className="grid grid-cols-3 gap-8 ">
        <img
          className="h-[180px]  rounded-2xl object-cover"
          src="/images/serviceDefault.png"
        />
        <img
          className="h-[180px]  rounded-2xl  object-cover"
          src="/images/serviceDefault.png"
        />
        <img
          className="h-[180px]  rounded-2xl  object-cover"
          src="/images/serviceDefault.png"
        />
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center">
          {" "}
          <h2 className="text-2xl font-bold">Clase de canto </h2>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>

        <InfoBox title="Categoría" value="Clases para niños" />
        <InfoBox title="Precio" value="$399.00" />
        <InfoBox title="Puntos" value="$10.00" />
        <InfoBox
          title="Puntos"
          value="Lorem ipsum dolor sit amet consectetur. Posuere sit id sed augue vestibulum nullam viverra ut turpis. Amet donec eget tellus id. Pellentesque tincidunt libero hac tellus habitasse in. Ut dictum pretium mauris."
        />

        <hr className="bg-brand_stroke my-6" />

        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Agendamiento</h3>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>
        <InfoBox title="Servicio" value="En sucursal" />
        <InfoBox title="Agendamiento en línea" value="Activo" />
        <InfoBox title="Agendamiento simultáneo" value="hasta 6 citas" />
        <hr className="bg-brand_stroke my-6" />
        <div className="flex justify-between items-center">
          {" "}
          <h3 className="text-lg font-bold">Horario</h3>
          <SecondaryButton className="h-10"> Editar</SecondaryButton>
        </div>
        <p className="font-satoshi text-brand_gray">
          Sesiones de{" "}
          <span className="font-bold font-satoMedium">45 minutos</span> con{" "}
          <span className="font-bold font-satoMedium">15 minutos</span> de
          descanso.
        </p>
        <InfoBox title="Lunes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Martes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Miércoles" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Jueves" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Viernes" value="de 9:00 am a 16:00 pm" />
        <InfoBox title="Sábado" value="Cerrado" />
        <InfoBox title="Domingo" value="Cerrado" />
      </div>
      <hr className="bg-brand_stroke my-6" />
      <div className="flex justify-between items-center">
        {" "}
        <h3 className="text-lg font-bold">Recordatorios y pago</h3>
        <SecondaryButton className="h-10"> Editar</SecondaryButton>
      </div>

      <InfoBox title="Pago" value="Al agendar" />
      <InfoBox
        title="Mail de confirmación"
        value="Lo enviaremos en cuanto se complete la reservación"
      />
      <InfoBox
        title="Mail de recordatorio"
        value="Lo enviaremos 24 hrs antes de la sesión"
      />
      <InfoBox
        title="Whats app de recordatorio"
        value="Lo enviaremos 4hrs antes de la sesión"
      />
      <InfoBox
        title="Mail de evaluación"
        value="Lo enviaremos 10 min después de terminar la sesión"
      />
    </div>
  );
};
