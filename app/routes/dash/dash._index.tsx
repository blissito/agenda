import type { User } from "@prisma/client"
import { twMerge } from "tailwind-merge"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { CustomerDashboard } from "~/components/dash/CustomerDashboard"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash._index"

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request)

  // Customer without org - load their events
  if (user.role === "customer" && !org) {
    const myEvents = await db.event.findMany({
      where: {
        customer: { userId: user.id },
        start: { gte: new Date() },
        status: { not: "CANCELLED" },
      },
      include: {
        service: { include: { org: true } },
      },
      orderBy: { start: "asc" },
    })

    return {
      user,
      isCustomerView: true,
      myEvents: myEvents.map((e) => ({
        id: e.id,
        start: e.start.toISOString(),
        status: e.status,
        serviceName: e.service?.name,
        orgName: e.service?.org.name,
      })),
    }
  }

  return {
    user,
    isCustomerView: false,
    myEvents: [],
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { user, isCustomerView, myEvents } = loaderData

  if (isCustomerView) {
    return <CustomerDashboard events={myEvents} user={user} />
  }

  return (
    <section className=" w-full h-full 	">
      <div className="h-auto lg:h-screen  flex flex-col  box-border ">
        <Summary user={user} />
        <EmptyStateDash />
      </div>
    </section>
  )
}

const EmptyStateDash = () => {
  return (
    <div className="bg-dashEmpty w-full h-screen bg-cover  mt-10 flex justify-center items-center">
      <div className="text-center">
        <img className="mx-auto" src="/images/no-files.svg" />
        <p className="font-satoMedium text-xl font-bold">
          Un poco de paciencia 🧘🏻
        </p>
        <p className="mt-2 text-brand_gray">
          Aún no tenemos suficientes datos que mostrar
        </p>
      </div>
    </div>
  )
}

const _Data = () => {
  return (
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
  )
}

const DAILY_QUOTES = [
  "\u201CEl que no tiene tiempo para su salud, tendr\u00e1 que tener tiempo para su enfermedad.\u201D \u2013 Jos\u00e9 Mart\u00ed",
  "\u201CLa vida no es la que uno vivi\u00f3, sino la que uno recuerda y c\u00f3mo la recuerda para contarla.\u201D \u2013 Gabriel Garc\u00eda M\u00e1rquez",
  "\u201CEl tiempo es la cosa m\u00e1s valiosa que un hombre puede gastar.\u201D \u2013 Sor Juana In\u00e9s de la Cruz",
  "\u201CHay un tiempo para todo, y todo lo que es hermoso tiene su instante.\u201D \u2013 Octavio Paz",
  "\u201CEl futuro pertenece a quienes creen en la belleza de sus sue\u00f1os.\u201D \u2013 Gabriela Mistral",
  "\u201CNo dejes que termine el d\u00eda sin haber crecido un poco.\u201D \u2013 Walt Whitman",
  "\u201CLa disciplina es el puente entre las metas y los logros.\u201D \u2013 Paulo Coelho",
  "\u201CUno no es lo que es por lo que escribe, sino por lo que ha le\u00eddo.\u201D \u2013 Jorge Luis Borges",
  "\u201CEl verdadero viaje de descubrimiento no consiste en buscar nuevos paisajes, sino en tener nuevos ojos.\u201D \u2013 Marcel Proust",
  "\u201CSiempre es temprano para rendirse.\u201D \u2013 Mario Benedetti",
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

const Summary = ({ user }: { user: User }) => {
  return (
    <div className="grid grid-cols-6 gap-10">
      <div className="col-span-6 xl:col-span-2 flex items-center">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold leading-normal">
            {getGreeting()},
          </h2>
          <h2 className="text-2xl md:text-4xl font-bold leading-normal mt-2">
            {" "}
            {user.displayName}
          </h2>
          <p className="mt-4 text-brand_gray">
            {DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length]}
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
  )
}

const Appointment = ({
  img,
  service,
  client,
  date,
  hour,
  time,
}: {
  img?: string
  service: string
  client: string
  date: string
  hour: string
  time: string
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
  )
}

const SummaryCard = ({
  img,
  title,
  description,
  data,
}: {
  img?: string
  title: string
  description: string
  data: string
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
  )
}

const DashCard = ({
  icon,
  title,
  value,
  className,
}: {
  icon?: string
  title: string
  value: string
  className?: string
}) => {
  return (
    <section
      className={twMerge(
        "w-[140px] md:w-[20%] rounded-2xl h-[140px] md:h-[240px] relative flex flex-col justify-end p-4 group grow ",
        className,
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
  )
}
