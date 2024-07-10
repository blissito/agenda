import { Star } from "../icons/star";

export const Benefits = ({ ...props }: { props?: unknown }) => (
  <section className="overflow-hidden relative">
    <img
      className="absolute -left-20 hover:animate-pulse transition-all w-[148px] lg:w-[298px "
      src="/images/line.svg"
    />
    <img
      className="absolute -right-20 bottom-0 rotate-180 hover:animate-pulse transition-all w-[148px] lg:w-[298px]"
      src="/images/line.svg"
    />
    <div className="md:max-w-7xl max-w-[90%] w-full mx-auto my-[160px] text-center">
      <h2 className="group text-4xl lg:text-6xl	font-bold text-brand_dark leading-tight flex flex-wrap items-center text-center justify-center ">
        <span className="mr-4"> Todo lo que tu negocio</span>
        <Star className="group-hover:animate-vibration-effect cursor-pointer w-12 h-12 lg:w-16 lg:h-16" />{" "}
        <span className="ml-4">necesita </span>
      </h2>
      <div className="mt-20 flex justify-center xl:justify-between flex-wrap gap-y-12">
        <ItemCard
          image="/images/illustrations/agenda.svg"
          title="Agenda en línea"
          description="Digitaliza tu agenda y organiza tu día a día. Facilita a tus clientes la agenda en línea"
        />
        <ItemCard
          image="/images/illustrations/TV.svg"
          title="Sitio web para citas"
          description="Personaliza tu sitio web, permite que tus clientes te conozcan y agenden por internet"
        />
        <ItemCard
          image="/images/illustrations/announcement.svg"
          title="Recordatorios automáticos"
          description="Automatiza el envío de recordatorios a tus clientes después de cada cita"
        />
        <ItemCard
          image="/images/illustrations/banking-app.svg"
          title="Pagos en línea"
          description="Permite que tus clientes paguen en línea, de contado o a meses sin intereses"
        />
        <ItemCard
          image="/images/illustrations/chill.svg"
          title="Fidelización de clientes"
          description="Utiliza nuestro programa de lealtad y ofrece descuentos o recompensas a tus clientes"
        />
        <ItemCard
          image="/images/illustrations/messages.svg"
          title="Encuestas de satisfacción"
          description="No dejes de mejorar tus servicios, y programa encuestas después de cada cita"
        />
        <ItemCard
          image="/images/illustrations/ticket.svg"
          title="Tarjetas de regalo"
          description="Ofrece recompensas a tus clientes más fieles, escoge entre más de 20 tarjetas de regalo"
        />
        <ItemCard
          image="/images/illustrations/atm-machine.svg"
          title="Sistema de caja"
          description="Lleva un registro diario, semanal o mensual de tus pagos "
        />
        <ItemCard
          image="/images/illustrations/medical-folder.svg"
          title="Expediente para tus clientes"
          description="Administra la información de tus clientes/pacientes de forma digital, segura y accesible"
        />
      </div>
    </div>
  </section>
);

export const ItemCard = ({
  image,
  title,
  description,
}: {
  image?: string;
  title: string;
  description: string;
}) => (
  <section className="w-[320px] lg:w-[400px] text-center group  transition-all cursor-pointer">
    <img
      className="w-[100px] mx-auto group-hover:scale-90 transition-all"
      src={image}
    />
    <h3 className="text-brand_dark text-2xl font-bold mt-6">{title}</h3>
    <p className="text-brand_gray text-xl font-body mt-4">{description}</p>
  </section>
);
