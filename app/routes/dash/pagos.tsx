import {
  createAccountLink,
  createConnectedAccount,
  getOrCreateStripeAccount,
} from "~/.server/stripe";
import type { Route } from "./+types/pagos";
import { getUserOrRedirect } from "~/.server/userGetters";
import { db } from "~/utils/db.server";
import { redirect, useFetcher } from "react-router";
import { cn } from "~/utils/cn";
import { Spinner } from "~/components/common/Spinner";

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await getUserOrRedirect(request);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "navigate_to_stripe_account_link") {
    const account = await getOrCreateStripeAccount(request);
    const url = new URL(request.url);
    const link = await createAccountLink(account.id, url.origin);
    throw redirect(link.url);
  }

  if (intent === "create_stripe_account") {
    const email = formData.get("email") as string;
    const account = await createConnectedAccount({ email });
    return await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        stripe: account,
      },
    });
  }
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const account = await getOrCreateStripeAccount(request);
  return { stripeAccountId: account?.id };
};

export default function Pagos({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();
  const { stripeAccountId } = loaderData;

  const navigateToStripeAccountLink = () => {
    fetcher.submit(
      {
        intent: "navigate_to_stripe_account_link",
      },
      { method: "post" }
    );
  };

  const isLoading = fetcher.state !== "idle";

  return (
    <article>
      <h1 className="text-2xl">Tus Pagos</h1>
      <hr />
      <section className="py-10">
        <h2>Conecta tu cuenta de Stripe para comenzar a recibir dinero 💵</h2>
        <button
          disabled={isLoading}
          onClick={stripeAccountId ? navigateToStripeAccountLink : undefined}
          className={cn(
            "px-8 py-4 rounded-3xl border-2 my-4 flex gap-3 ml-auto",
            "hover:scale-105 enabled:active:scale-100 transition-all"
          )}
        >
          <span>
            {stripeAccountId
              ? "Cuenta conectada: " + stripeAccountId
              : "Conecta tu cuenta de Stripe"}
          </span>
          {isLoading && <Spinner />}
        </button>
      </section>
    </article>
  );
}
