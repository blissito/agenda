import { Stripe } from "stripe"
import { db } from "~/utils/db.server"
import { getUserOrRedirect } from "./userGetters"

type StripeData = { id: string } | null

export const getOrCreateStripeAccount = async (request: Request) => {
  let account
  let error
  const user = await getUserOrRedirect(request)
  const stripeData = user.stripe as StripeData
  try {
    if (stripeData?.id) {
      account = await retrieveAccountSafe(stripeData.id)
    } else {
      account = await createConnectedAccount(user.email)
      // Store partial stripe data (just id) until full account is retrieved
      await db.user.update({
        where: { id: user.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { stripe: { id: account.id } as any },
      })
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e)
      error = e
    }
  }
  return { account, error } as {
    account: { id: string } | null
    error: null | Error
  }
}

const retrieveAccountSafe = async (id: string) =>
  getClient().accounts.retrieve(id)

export const createAccountLink = (connectedAccountId: string, origin: string) =>
  getClient().accountLinks.create({
    account: connectedAccountId,
    return_url: `${origin}/stripe?intent=return&connectedAccountId=${connectedAccountId}`,
    refresh_url: `${origin}/stripe?intent=refresh&connectedAccountId=${connectedAccountId}`,
    type: "account_onboarding",
  })

let client: Stripe
const getClient = () => {
  client ??= new Stripe(process.env.STRIPE_SECRET_TEST as string)
  return client
}

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
  })
}
