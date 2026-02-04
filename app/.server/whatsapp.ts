/**
 * WhatsApp Business API Integration (Placeholder)
 *
 * This module provides placeholder functions for WhatsApp Business API integration.
 * Full implementation requires Meta WhatsApp Business API credentials.
 *
 * To enable:
 * 1. Create a Meta Business account
 * 2. Set up WhatsApp Business API
 * 3. Configure OAuth in app/routes/integrations/whatsapp.*.tsx
 * 4. Store credentials in OrgIntegrations.whatsapp
 */

import type { Org } from "@prisma/client";

export class WhatsAppNotConfiguredError extends Error {
  constructor(message = "WhatsApp Business API is not configured for this organization") {
    super(message);
    this.name = "WhatsAppNotConfiguredError";
  }
}

type OrgWithIntegrations = Org & {
  integrations?: {
    whatsapp?: {
      phoneNumberId?: string | null;
      accessToken?: string | null;
      businessId?: string | null;
      connectedAt?: Date | null;
    } | null;
  } | null;
};

/**
 * Check if WhatsApp is configured for an organization
 */
export function isWhatsAppConfigured(org: OrgWithIntegrations): boolean {
  const whatsapp = org.integrations?.whatsapp;
  return !!(whatsapp?.phoneNumberId && whatsapp?.accessToken);
}

/**
 * Send a WhatsApp message
 * @throws WhatsAppNotConfiguredError if WhatsApp is not configured
 */
export async function sendWhatsAppMessage(
  org: OrgWithIntegrations,
  _to: string,
  _templateName: string,
  _templateParams: Record<string, string>
): Promise<void> {
  if (!isWhatsAppConfigured(org)) {
    throw new WhatsAppNotConfiguredError();
  }

  // TODO: Implement actual WhatsApp Business API call
  // const whatsapp = org.integrations!.whatsapp!;
  // const response = await fetch(
  //   `https://graph.facebook.com/v18.0/${whatsapp.phoneNumberId}/messages`,
  //   {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${whatsapp.accessToken}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       messaging_product: "whatsapp",
  //       to,
  //       type: "template",
  //       template: {
  //         name: templateName,
  //         language: { code: "es_MX" },
  //         components: [
  //           {
  //             type: "body",
  //             parameters: Object.entries(templateParams).map(([_, value]) => ({
  //               type: "text",
  //               text: value,
  //             })),
  //           },
  //         ],
  //       },
  //     }),
  //   }
  // );

  throw new WhatsAppNotConfiguredError(
    "WhatsApp Business API integration is coming soon. Please use email notifications for now."
  );
}

/**
 * Send appointment reminder via WhatsApp
 */
export async function sendWhatsAppReminder(
  org: OrgWithIntegrations,
  phoneNumber: string,
  customerName: string,
  serviceName: string,
  dateTime: string
): Promise<void> {
  return sendWhatsAppMessage(org, phoneNumber, "appointment_reminder", {
    customer_name: customerName,
    service_name: serviceName,
    date_time: dateTime,
  });
}

/**
 * Send appointment confirmation via WhatsApp
 */
export async function sendWhatsAppConfirmation(
  org: OrgWithIntegrations,
  phoneNumber: string,
  customerName: string,
  serviceName: string,
  dateTime: string
): Promise<void> {
  return sendWhatsAppMessage(org, phoneNumber, "appointment_confirmation", {
    customer_name: customerName,
    service_name: serviceName,
    date_time: dateTime,
  });
}
