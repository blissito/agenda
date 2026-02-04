import {
  createAccountLink,
  createConnectedAccount,
  getOrCreateStripeAccount,
} from "~/.server/stripe";
import { getMPAuthUrl } from "~/.server/mercadopago";
import { cn } from "~/utils/cn";
import { db } from "~/utils/db.server";
import type { Route } from "./+types/pagos";
import { redirect, useFetcher, useSearchParams } from "react-router";
import { Spinner } from "~/components/common/Spinner";
import { getUserOrRedirect } from "~/.server/userGetters";
import invariant from "tiny-invariant";

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await getUserOrRedirect(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "navigate_to_stripe_account_link") {
    const { account, error } = await getOrCreateStripeAccount(request);
    if (error) throw new Response(null, { status: 404 });
    invariant(account);

    const url = new URL(request.url);
    const link = await createAccountLink(account.id, url.origin);
    throw redirect(link.url);
  }

  if (intent === "create_stripe_account") {
    const email = formData.get("email") as string;
    const account = await createConnectedAccount(email);
    return await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        stripe: { id: account.id },
      },
    });
  }

  if (intent === "connect_mercadopago") {
    const url = new URL(request.url);
    // Force HTTPS in production (Fly.io proxy doesn't forward protocol correctly)
    const origin = process.env.NODE_ENV === "production"
      ? url.origin.replace("http://", "https://")
      : url.origin;
    const redirectUri = `${origin}/mercadopago/oauth`;
    throw redirect(getMPAuthUrl(redirectUri));
  }

  if (intent === "disconnect_mercadopago") {
    await db.user.update({
      where: { id: user.id },
      data: { mercadopago: { unset: true } },
    });
    return { success: true, disconnected: "mercadopago" };
  }
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUserOrRedirect(request);
  const { account, error } = await getOrCreateStripeAccount(request); // test/prod mix can occur
  return {
    stripeAccountId: account?.id,
    error,
    mpConnected: !!user.mercadopago?.access_token,
    mpUserId: user.mercadopago?.user_id,
  };
};

export default function Pagos({ loaderData }: Route.ComponentProps) {
  const { stripeAccountId, error, mpConnected, mpUserId } = loaderData;
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();

  const mpSuccess = searchParams.get("mp_success");
  const mpError = searchParams.get("mp_error");

  const navigateToStripeAccountLink = () => {
    fetcher.submit(
      { intent: "navigate_to_stripe_account_link" },
      { method: "post" }
    );
  };

  const connectMercadoPago = () => {
    fetcher.submit({ intent: "connect_mercadopago" }, { method: "post" });
  };

  const disconnectMercadoPago = () => {
    if (confirm("¿Estás seguro de que quieres desconectar tu cuenta de Mercado Pago?")) {
      fetcher.submit({ intent: "disconnect_mercadopago" }, { method: "post" });
    }
  };

  const isLoading = fetcher.state !== "idle";

  return (
    <article>
      <h1 className="text-2xl">Tus Pagos</h1>
      <hr />

      {/* Mercado Pago - Principal */}
      <section className="py-10">
        <h2 className="text-lg font-semibold mb-2">Mercado Pago (Recomendado)</h2>
        <p className="text-gray-600 mb-4">
          Recibe pagos con tarjeta, OXXO, SPEI y más métodos populares en México.
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
            <div
              className={cn(
                "px-8 py-4 rounded-3xl border-2 flex gap-3",
                "bg-green-50 border-green-500"
              )}
            >
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
            className={cn(
              "px-8 py-4 rounded-3xl border-2 my-4 flex gap-3",
              "hover:scale-105 enabled:active:scale-100 transition-all",
              "bg-blue-50 border-blue-500"
            )}
          >
            <span>Conectar Mercado Pago</span>
            {isLoading && <Spinner />}
          </button>
        )}
      </section>

      <hr />

      {/* Stripe - Legacy */}
      <section className="py-10 opacity-60">
        <h2 className="text-lg font-semibold mb-2">Stripe (Legacy)</h2>
        <p className="text-gray-600 mb-4">
          Opción alternativa para pagos internacionales.
        </p>
        <button
          disabled={isLoading}
          onClick={stripeAccountId ? navigateToStripeAccountLink : undefined}
          className={cn(
            "px-8 py-4 rounded-3xl border-2 my-4 flex gap-3",
            "hover:scale-105 enabled:active:scale-100 transition-all"
          )}
        >
          <span>
            {stripeAccountId
              ? "Stripe conectado: " + stripeAccountId
              : "Conecta tu cuenta de Stripe"}
          </span>
          {isLoading && <Spinner />}
        </button>
      </section>

      {error && (
        <section>
          <p className="text-red-500 my-8 text-2xl">{error.message}</p>
        </section>
      )}
    </article>
  );
}
