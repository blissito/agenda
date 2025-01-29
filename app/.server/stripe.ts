import { Stripe } from "stripe";
import { getUserOrRedirect } from "./userGetters";
import { db } from "~/utils/db.server";

export const getOrCreateStripeAccount = async (request: Request) => {
  const user = await getUserOrRedirect(request);
  let account;
  if (user.stripe?.id) {
    account = await retrieveAccountSafe(user.stripe.id);
  } else {
    account = await createConnectedAccount(user.email);
    await db.user.update({ where: { id: user.id }, data: { stripe: account } });
  }
  return account;
};

const retrieveAccountSafe = async (id: string) => {
  let account;
  try {
    account = await getClient().accounts.retrieve(id);
  } catch (e) {
    if (e instanceof Error) {
      console.error("::NOT_EXISTING_STRIPE_ACCOUNT:: " + e.message);
    }
  }
  return account;
};

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
