/**
 * Facebook Messenger Integration (Placeholder)
 *
 * This module provides placeholder functions for Facebook Messenger integration.
 * Full implementation requires Meta Messenger Platform credentials.
 *
 * To enable:
 * 1. Create a Meta Business account
 * 2. Set up Messenger Platform
 * 3. Configure OAuth in app/routes/integrations/messenger.*.tsx
 * 4. Store credentials in OrgIntegrations.messenger
 */

import type { Org } from "@prisma/client";

export class MessengerNotConfiguredError extends Error {
  constructor(message = "Messenger is not configured for this organization") {
    super(message);
    this.name = "MessengerNotConfiguredError";
  }
}

type OrgWithIntegrations = Org & {
  integrations?: {
    messenger?: {
      pageId?: string | null;
      pageAccessToken?: string | null;
      connectedAt?: Date | null;
    } | null;
  } | null;
};

/**
 * Check if Messenger is configured for an organization
 */
export function isMessengerConfigured(org: OrgWithIntegrations): boolean {
  const messenger = org.integrations?.messenger;
  return !!(messenger?.pageId && messenger?.pageAccessToken);
}

/**
 * Send a Messenger message
 * @throws MessengerNotConfiguredError if Messenger is not configured
 */
export async function sendMessengerMessage(
  org: OrgWithIntegrations,
  _recipientId: string,
  _message: string
): Promise<void> {
  if (!isMessengerConfigured(org)) {
    throw new MessengerNotConfiguredError();
  }

  // TODO: Implement actual Messenger Platform API call
  // const messenger = org.integrations!.messenger!;
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${messenger.pageId}/messages`,
  //   {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${messenger.pageAccessToken}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       recipient: { id: recipientId },
  //       message: { text: message },
  //     }),
  //   }
  // );

  throw new MessengerNotConfiguredError(
    "Messenger integration is coming soon. Please use email notifications for now."
  );
}

/**
 * Send appointment reminder via Messenger
 */
export async function sendMessengerReminder(
  org: OrgWithIntegrations,
  recipientId: string,
  customerName: string,
  serviceName: string,
  dateTime: string
): Promise<void> {
  const message = `Hola ${customerName}, te recordamos que tu cita para ${serviceName} es ${dateTime}. ¡Te esperamos!`;
  return sendMessengerMessage(org, recipientId, message);
}

/**
 * Send appointment confirmation via Messenger
 */
export async function sendMessengerConfirmation(
  org: OrgWithIntegrations,
  recipientId: string,
  customerName: string,
  serviceName: string,
  dateTime: string
): Promise<void> {
  const message = `¡Hola ${customerName}! Tu cita para ${serviceName} ha sido confirmada para ${dateTime}. ¡Gracias por tu reserva!`;
  return sendMessengerMessage(org, recipientId, message);
}
