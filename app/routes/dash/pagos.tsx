import { redirect, useFetcher, useSearchParams } from "react-router"
import invariant from "tiny-invariant"
import { getMPAuthUrl } from "~/.server/mercadopago"
import { createAccountLink, getOrCreateStripeAccount } from "~/.server/stripe"
import { getUserOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Spinner } from "~/components/common/Spinner"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { ArrowRight } from "~/components/icons/arrowRight"
import { db } from "~/utils/db.server"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import type { Route } from "./+types/pagos"

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await getUserOrRedirect(request)
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "connect_mercadopago") {
    const url = new URL(request.url)
    const origin =
      process.env.APP_URL ||
      (process.env.NODE_ENV === "production"
        ? url.origin.replace("http://", "https://")
        : url.origin)
    const redirectUri = `${origin}/mercadopago/oauth`
    throw redirect(getMPAuthUrl(redirectUri))
  }

  if (intent === "disconnect_mercadopago") {
    await db.user.update({
      where: { id: user.id },
      data: { mercadopago: { unset: true } },
    })
    return { success: true, disconnected: "mercadopago" }
  }

  if (intent === "navigate_to_stripe_account_link") {
    if (!process.env.STRIPE_SECRET_TEST || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Response("Stripe no configurado", { status: 400 })
    }

    const { account, error } = await getOrCreateStripeAccount(request)
    if (error) throw new Response(null, { status: 404 })

    invariant(account)

    const url = new URL(request.url)
    const link = await createAccountLink(account.id, url.origin)
    throw redirect(link.url)
  }
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrRedirect(request)
  const stripeData = user.stripe as { id: string } | null
  const stripeEnabled =
    !!process.env.STRIPE_SECRET_TEST && !!process.env.STRIPE_WEBHOOK_SECRET

  return {
    mpConnected: !!user.mercadopago?.access_token,
    mpUserId: user.mercadopago?.user_id,
    stripeAccountId: stripeData?.id || null,
    stripeEnabled,
  }
}

export default function Pagos({ loaderData }: Route.ComponentProps) {
  const { mpConnected, mpUserId, stripeAccountId, stripeEnabled } = loaderData
  const [searchParams, setSearchParams] = useSearchParams()
  const fetcher = useFetcher()

  const mpSuccess = searchParams.get("mp_success")
  const mpError = searchParams.get("mp_error")
  const activeTab =
    searchParams.get("tab") === "deposits" ? "deposits" : "sales"

  const connectMercadoPago = () => {
    fetcher.submit({ intent: "connect_mercadopago" }, { method: "post" })
  }

  const disconnectMercadoPago = () => {
    if (
      confirm(
        "¿Estás seguro de que quieres desconectar tu cuenta de Mercado Pago?",
      )
    ) {
      fetcher.submit({ intent: "disconnect_mercadopago" }, { method: "post" })
    }
  }

  const navigateToStripeAccountLink = () => {
    fetcher.submit(
      { intent: "navigate_to_stripe_account_link" },
      { method: "post" },
    )
  }

  const changeTab = (tab: "sales" | "deposits") => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("tab", tab)
    setSearchParams(nextParams)
  }

  const isLoading = fetcher.state !== "idle"
  const showEmptyState = !mpConnected && !stripeAccountId

  return (
    <article className="w-full max-w-8xl mx-auto">
      <RouteTitle>Ventas</RouteTitle>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => changeTab("sales")}
            className={`relative pb-2 text-sm font-medium leading-5 ${
              activeTab === "sales" ? "text-[#20242D]" : "text-[#8A90A2]"
            }`}
          >
            Ventas
            {activeTab === "sales" && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#615FFF]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => changeTab("deposits")}
            className={`relative pb-2 text-sm font-medium leading-5 ${
              activeTab === "deposits" ? "text-[#20242D]" : "text-[#8A90A2]"
            }`}
          >
            Depósitos
            {activeTab === "deposits" && (
              <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#615FFF]" />
            )}
          </button>
        </div>

      {showEmptyState ? (
        <section className="flex min-h-[560px] flex-col items-center justify-center px-4 py-10 text-center md:min-h-[640px]">
          <img
            src="/images/emptyState/payments.webp"
            alt=""
            className="mb-8 w-full max-w-[240px] md:max-w-[240px]"
          />

          <div className="max-w-[620px]">
            <h2 className="text-[24px] font-satoBold">
              Conecta tu cuenta MELI para empezar a recibir pagos
            </h2>

            <p className="mt-3 text-[18px] font-satoMedium text-brand_gray">
              Denik colabora con Mercado Libre para ofrecerte pagos seguros
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <SecondaryButton type="button" className="min-w-[160px]">
              Configurar después
            </SecondaryButton>

            <PrimaryButton
              type="button"
              onClick={connectMercadoPago}
              disabled={isLoading}
              className="min-w-[160px]"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Empezar</span>
                <ArrowRight />
                {isLoading ? <Spinner /> : null}
              </span>
            </PrimaryButton>
          </div>
        </section>
      ) : null}

      {/*
        / CONFIGURACIÓN DE PAGOS
        <>
          <section className="py-10">
            <h2 className="text-lg font-semibold mb-2">
              Mercado Pago (Recomendado)
            </h2>
            <p className="text-gray-600 mb-4">
              Recibe pagos con tarjeta, OXXO, SPEI y más métodos populares en
              México.
            </p>

            {mpSuccess && mpConnected && (
              <p className="text-green-600 mb-4">
                ¡Cuenta de Mercado Pago conectada exitosamente!
              </p>
            )}
            {mpError && (
              <p className="text-red-500 mb-4">
                Error al conectar Mercado Pago. Intenta de nuevo.
              </p>
            )}

            {mpConnected ? (
              <div className="flex items-center gap-4 my-4">
                <div className="px-8 py-4 rounded-3xl border-2 flex gap-3 bg-green-50 border-green-500">
                  <span>MP conectado (ID: {mpUserId})</span>
                </div>
                <button
                  disabled={isLoading}
                  onClick={disconnectMercadoPago}
                  className="text-red-500 text-sm hover:underline disabled:opacity-50"
                >
                  {isLoading ? <Spinner /> : "Desconectar"}
                </button>
              </div>
            ) : (
              <button
                disabled={isLoading}
                onClick={connectMercadoPago}
                className="px-8 py-4 rounded-3xl border-2 my-4 flex gap-3 hover:scale-105 enabled:active:scale-100 transition-all bg-blue-50 border-blue-500"
              >
                <span>Conectar Mercado Pago</span>
                {isLoading && <Spinner />}
              </button>
            )}
          </section>

          <hr />

          {stripeEnabled && (
            <section className="py-10 opacity-60">
              <h2 className="text-lg font-semibold mb-2">Stripe</h2>
              <p className="text-gray-600 mb-4">
                Opción alternativa para pagos internacionales.
              </p>
              <button
                disabled={isLoading}
                onClick={navigateToStripeAccountLink}
                className="px-8 py-4 rounded-3xl border-2 my-4 flex gap-3 hover:scale-105 enabled:active:scale-100 transition-all"
              >
                <span>
                  {stripeAccountId
                    ? `Stripe conectado: ${stripeAccountId}`
                    : "Conectar Stripe"}
                </span>
                {isLoading && <Spinner />}
              </button>
            </section>
          )}
        </>
      */}
    </article>
  )
}
