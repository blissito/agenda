import { Stripe } from "stripe";
import { getUserOrRedirect } from "./userGetters";
import { db } from "~/utils/db.server";

export const getOrCreateStripeAccount = async (request: Request) => {
  let account;
  let error;
  const user = await getUserOrRedirect(request);
  try {
    if (user.stripe?.id) {
      account = await retrieveAccountSafe(user.stripe.id);
    } else {
      account = await createConnectedAccount(user.email);
      await db.user.update({
        where: { id: user.id },
        data: { stripe: account },
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      error = e;
    }
  }
  return { account, error } as {
    account: { id: string } | null;
    error: null | Error;
  };
};

const retrieveAccountSafe = async (id: string) =>
  getClient().accounts.retrieve(id);

export const createAccountLink = (connectedAccountId: string, origin: string) =>
  getClient().accountLinks.create({
    account: connectedAccountId,
    return_url: `${origin}/stripe?intent=return&connectedAccountId=${connectedAccountId}`,
    refresh_url: `${origin}/stripe?intent=refresh&connectedAccountId=${connectedAccountId}`,
    type: "account_onboarding",
  });

let client;
const getClient = () => {
  client ??= new Stripe(process.env.STRIPE_SECRET_TEST as string, {
    apiVersion: "2023-08-16",
  });
  return client;
};

export const createConnectedAccount = (email: string) => {
  return getClient().accounts.create({
    country: "MX", // @todo
    email,
    controller: {
      fees: {
        payer: "account",
      },
      losses: {
        payments: "stripe",
      },
      stripe_dashboard: {
        type: "full",
      },
    },
  });
};
