export const Benefits = ({ ...props }: { props?: unknown }) => (
  <section className="overflow-hidden relative">
    <img
      className="absolute -left-20 hover:animate-pulse transition-all"
      src="/public/images/line.svg"
    />
    <img
      className="absolute -right-20 bottom-0 rotate-180 hover:animate-pulse transition-all"
      src="/public/images/line.svg"
    />
    <div className="max-w-7xl w-full mx-auto my-[160px] text-center">
      <h2 className="text-6xl font-bold text-center">
        Todo lo que tu negocio necesita
      </h2>
      <div className="mt-20 flex justify-between flex-wrap gap-y-12">
        <ItemCard
          image="/public/images/ilustration/agenda.svg"
          title="Agenda en línea"
          description="Digitaliza tu agenda y organiza tu día a día. Facilita a tus clientes la agenda en línea"
        />
        <ItemCard
          image="/public/images/ilustration/tv.svg"
          title="Sitio web para citas"
          description="Personaliza tu sitio web, permite que tus clientes te conozcan y agenden por internet"
        />
        <ItemCard
          image="/public/images/ilustration/announcement.svg"
          title="Recordatorios automáticos"
          description="Automatiza el envío de recordatorios a tus clientes después de cada cita"
        />
        <ItemCard
          image="/public/images/ilustration/banking-app.svg"
          title="Pagos en línea"
          description="Permite que tus clientes paguen en línea, de contado o a meses sin intereses"
        />
        <ItemCard
          image="/public/images/ilustration/chill.svg"
          title="Fidelización de clientes"
          description="Utiliza nuestro programa de lealtad y ofrece descuentos o recompensas a tus clientes"
        />
        <ItemCard
          image="/public/images/ilustration/messages.svg"
          title="Encuestas de satisfacción"
          description="No dejes de mejorar tus servicios, y programa encuestas después de cada cita"
        />
        <ItemCard
          image="/public/images/ilustration/ticket.svg"
          title="Tarjetas de regalo"
          description="Ofrece recompensas a tus clientes más fieles, escoge entre más de 20 tarjetas de regalo"
        />
        <ItemCard
          image="/public/images/ilustration/atm-machine.svg"
          title="Sistema de caja"
          description="Lleva un registro diario, semanal o mensual de tus pagos "
        />
        <ItemCard
          image="/public/images/ilustration/medical-folder.svg"
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
  <section className="w-[400px] text-center group  transition-all cursor-pointer">
    <img
      className="w-[100px] mx-auto group-hover:animate-bounce transition-all"
      src={image}
    />
    <h3 className="text-brand_dark text-2xl font-bold mt-6">{title}</h3>
    <p className="text-brand_gray text-xl font-body mt-4">{description}</p>
  </section>
);
