import { Form } from "@remix-run/react";
import { twMerge } from "tailwind-merge";
import { RouteTitle } from "~/components/sideBar/routeTitle";

export default function Page() {
  return (
    <section className=" w-full h-full 	">
      <div className="  h-screen  flex flex-col  box-border ">
        <div className="grid grid-cols-6 gap-10">
          <div className="col-span-6 xl:col-span-2 flex items-center">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold leading-snug">
                Buenos días,
                <br /> Brenda
              </h2>
              <p className="mt-4 text-brand_gray">
                Lorem ipsum dolor sit amet consectetur. Faucibus leo leo leo
                lectus etiam consequat sit adipiscing justo. Sed orci ipsum
                facilisis euismod pellentesque interdum egest
              </p>
            </div>
          </div>
          <div className="col-span-6 xl:col-span-4 flex flex-wrap lg:flex-nowrap justify-end gap-6 md:gap-10 overflow-hidden">
            <DashCard
              className="bg-[#64D0C5] "
              title="Ventas del mes"
              value="$30,000"
              icon="/images/chart.svg"
            />
            <DashCard
              className="bg-[#EEC446]"
              title="Nuevos usuarios"
              value="23"
              icon="/images/profile.svg"
            />
            <DashCard
              className="bg-[#FFAB61]"
              title="Citas agendadas"
              value="30"
              icon="/images/agenda-dash.svg"
            />
            <DashCard
              className="bg-[#91B870]"
              title="Citas canceladas"
              value="2"
              icon="/images/cancel.svg"
            />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-6 mt-10 overflow-hidden h-full  ">
          <div className="col-span-6 xl:col-span-4 flex flex-col">
            <div className="bg-white rounded-2xl p-6">
              <h3>Servicios</h3>
              <div className="flex gap-6 mt-6 overflow-y-scroll">
                <SummaryCard
                  title="Clase de piano"
                  description="10 clases"
                  data="35.7%"
                />
                <SummaryCard
                  title="Clase de piano"
                  description="10 clases"
                  data="35.7%"
                />
                <SummaryCard
                  title="Clase de piano"
                  description="10 clases"
                  data="35.7%"
                />
                <SummaryCard
                  title="Clase de piano"
                  description="10 clases"
                  data="35.7%"
                />
                <SummaryCard
                  title="Clase de piano"
                  description="10 clases"
                  data="35.7%"
                />
              </div>
            </div>
            <div className=" bg-white rounded-2xl p-6 mt-6 grow ">
              <h3>Ventas</h3>
            </div>
          </div>
          <div className="bg-white rounded-2xl overflow-y-scroll  h-full col-span-6 xl:col-span-2 pb-6  ">
            <div className="bg-white/80 z-10 backdrop-blur	 py-4 sticky top-0 px-6">
              <h3>Servicios agendados recientemente</h3>
            </div>
            <div className="mt-0  overflow-y-scroll ">
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
              <Appointment
                service="Clase de piano"
                client="35.7%"
                date="hola"
                hour="35.7%"
                time="35.7%"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Appointment = ({
  img,
  service,
  client,
  date,
  hour,
  time,
}: {
  img?: string;
  service: string;
  client: string;
  date: string;
  hour: string;
  time: string;
}) => {
  return (
    <section className="flex px-6 items-center gap-2 py-4 border-b-[1px] border-brand_stroke justify-between hover:scale-95 transition-all">
      <div className="flex gap-2">
        <img
          className="h-12 w-12 rounded-full object-cover"
          src={img ? img : "/images/serviceDefault.png"}
        />
        <div>
          <h3 className="text-brand_dark">{service}</h3>
          <p className="text-sm text-brand_gray">
            {client} | {date} | {hour}
          </p>
        </div>
      </div>

      <span className="text-brand_iron">{time}</span>
    </section>
  );
};

const SummaryCard = ({
  img,
  title,
  description,
  data,
}: {
  img?: string;
  title: string;
  description: string;
  data: string;
}) => {
  return (
    <section className="border-[1px] min-w-[132px]  border-brand_stroke rounded-2xl flex flex-col items-center text-center p-3 hover:scale-95 transition-all">
      <img
        className="h-12 w-12 rounded-full object-cover"
        src={img ? img : "/images/serviceDefault.png"}
      />
      <h3 className="text-sm">{title}</h3>
      <p className="text-brand_gray text-sm">{description}</p>
      <span className="mt-4 font-satoMiddle">{data}</span>
    </section>
  );
};

const DashCard = ({
  icon,
  title,
  value,
  className,
}: {
  icon?: string;
  title: string;
  value: string;
  className?: string;
}) => {
  return (
    <section
      className={twMerge(
        "w-[140px] md:w-[20%] rounded-2xl h-[140px] md:h-[240px] relative flex flex-col justify-end p-4 group grow ",
        className
      )}
    >
      <img
        className="absolute w-[64px] md:w-auto right-0 top-0 group-hover:scale-95 transition-all"
        src={icon}
      />
      <div className="text-white">
        <p className="text-base">{title}</p>
        <h3 className="text-3xl font-satoMedium">{value}</h3>
      </div>
    </section>
  );
};
