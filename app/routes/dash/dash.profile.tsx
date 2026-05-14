import type { ReactNode } from "react"
import { Form, Link, useNavigation } from "react-router"
import { getUserOrRedirect } from "~/.server/userGetters"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { Camera } from "~/components/icons/camera"
import { Check } from "~/components/icons/check"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import type { Route } from "./+types/dash.profile"

const PLAN_LABELS: Record<string, string> = {
  TRIAL: "Período de prueba",
  PRO: "Plan Profesional",
  ENTERPRISE: "Plan Enterprise",
  EXPIRED: "Prueba expirada",
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrRedirect(request)
  return { user }
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData
  const planLabel = PLAN_LABELS[user.plan ?? ""] ?? "Sin plan"
  const isPaidPlan = user.plan === "PRO" || user.plan === "ENTERPRISE"
  const nextPayment = user.currentPeriodEnd
    ? new Date(user.currentPeriodEnd).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <main className=" ">
      <RouteTitle className="text-xl md:text-3xl">Mi perfil </RouteTitle>
      <section className="flex gap-3 md:gap-8 items-center bg-white p-4 md:p-6 rounded-2xl max-w-3xl">
        <div className="w-20 h-20 md:w-[108px] md:h-[108px] rounded-full border-[1px] border-brand_stroke relative">
          {user.providerId ? null : (
            <Camera className="absolute right-0 bottom-0" />
          )}

          <img
            className="w-20 h-20 md:w-[108px] md:h-[108px] rounded-full object-cover "
            src={user.photoURL ? user.photoURL : "/images/avatar.svg"}
            alt="avatar"
          />
        </div>
        <div>
          <div className="flex gap-3 items-center">
            <h3 className="text-brand_dark font-bold text-xl md:text-2xl">
              {user.displayName}
            </h3>
          </div>
          <p className="text-brand_gray font-satoshi mt-1 text-sm md:text-base">
            {user.email}
          </p>
        </div>
      </section>
      <section>
        <PlanCard
          plan={planLabel}
          nextPayment={nextPayment}
          isPaidPlan={isPaidPlan}
          subscriptionStatus={user.subscriptionStatus}
        >
          <ul className="text-left flex gap-3 md:gap-4 flex-col text-base md:text-lg text-brand_gray font-satoshi ">
            <li className="flex gap-3">
              <Check /> Agenda en línea
            </li>
            <li className="flex gap-3">
              <Check /> Recordatorios automáticos
            </li>
            <li className="flex gap-3">
              <Check /> Sitio web para citas
            </li>
            <li className="flex gap-3">
              <Check /> Pagos en línea
            </li>
            <li className="flex gap-3">
              <Check /> Programa de lealtad, descuentos y tarjetas de regalo
            </li>
            <li className="flex gap-3">
              <Check /> Encuesta de satisfacción
            </li>
            <li className="flex gap-3">
              <Check /> Expediente de clientes
            </li>
          </ul>
        </PlanCard>
      </section>
    </main>
  )
}

const PlanCard = ({
  children,
  nextPayment,
  plan,
  isPaidPlan,
  subscriptionStatus,
}: {
  children: ReactNode
  nextPayment: string | null
  plan: string
  isPaidPlan: boolean
  subscriptionStatus: string | null | undefined
}) => {
  const navigation = useNavigation()
  const isManaging =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "manage_billing"
  const isCanceling = subscriptionStatus === "canceled"

  return (
    <section className="flex flex-col gap-4 bg-white p-4 md:p-6 rounded-2xl max-w-3xl my-4 md:my-8">
      <div className="flex justify-between items-center flex-wrap">
        <h3 className="mb-0 md:mb-6 text-lg md:text-2xl font-satoBold font-bold">
          {plan}
        </h3>
      </div>
      {children}
      <hr />
      <div className="flex justify-between items-center flex-wrap gap-4">
        {isPaidPlan && nextPayment ? (
          <p className="text-brand_gray font-satoshi">
            {isCanceling ? "Acceso hasta el" : "Próxima fecha de pago"}
            <span className="ml-2 font-bold font-satoMedium">{nextPayment}</span>
          </p>
        ) : (
          <p className="text-brand_gray font-satoshi">
            Activa un plan para acceder a todas las funcionalidades.
          </p>
        )}
        {isPaidPlan ? (
          <Form method="post" action="/api/stripe-checkout">
            <input type="hidden" name="intent" value="manage_billing" />
            <SecondaryButton
              type="submit"
              className="h-10 md:mt-0 mt-6"
              isDisabled={isManaging}
              isLoading={isManaging}
            >
              Administrar suscripción
            </SecondaryButton>
          </Form>
        ) : (
          <Link to="/planes">
            <SecondaryButton type="button" className="h-10 md:mt-0 mt-6">
              Ver planes
            </SecondaryButton>
          </Link>
        )}
      </div>
    </section>
  )
}
