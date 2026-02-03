import type { Route } from "./+types/mercadopago.webhook";
import { getPayment, validateWebhookSignature } from "~/.server/mercadopago";
import { db } from "~/utils/db.server";
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment";
import { sendPaymentFailedEmail } from "~/utils/emails/sendPaymentFailed";

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await request.json();

  // Validar firma si MP_WEBHOOK_SECRET está configurado
  if (process.env.MP_WEBHOOK_SECRET) {
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataId = body.data?.id?.toString() || "";

    if (!validateWebhookSignature(xSignature, xRequestId, dataId)) {
      console.error("MP Webhook: Invalid signature");
      return new Response("Unauthorized", { status: 401 });
    }
  }

  // IPN de Mercado Pago
  if (body.type === "payment" && body.data?.id) {
    const paymentId = body.data.id;

    try {
      const payment = await getPayment(paymentId);

      if (!payment.external_reference) {
        return new Response("OK", { status: 200 });
      }

      const { serviceId, customerId, start, end } = JSON.parse(
        payment.external_reference
      );

      // Buscar servicio y customer
      const [service, customer] = await Promise.all([
        db.service.findUnique({
          where: { id: serviceId },
          include: { org: true },
        }),
        db.customer.findUnique({ where: { id: customerId } }),
      ]);

      if (!service || !customer) {
        console.error("Service or customer not found:", serviceId, customerId);
        return new Response("OK", { status: 200 });
      }

      // Pago aprobado: crear evento
      if (payment.status === "approved") {
        const event = await db.event.create({
          data: {
            start: new Date(start),
            end: new Date(end),
            duration: service.duration,
            serviceId: service.id,
            title: service.name,
            status: "ACTIVE",
            orgId: service.orgId,
            customerId: customer.id,
            paid: true,
            mp_payment_id: String(paymentId),
            mp_preference_id: (payment as any).preference_id || null,
            payment_method: "mercadopago",
            allDay: false,
            archived: false,
            type: "appointment",
            userId: service.org.ownerId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            customer: true,
            service: { include: { org: true } },
          },
        });

        // Enviar emails
        try {
          await sendAppointmentToCustomer({
            email: customer.email,
            event: event as any,
          });
          if (service.org.email) {
            await sendAppointmentToOwner({
              email: service.org.email,
              event: event as any,
            });
          }
        } catch (e) {
          console.error("Email send failed:", e);
        }

        console.log("MP Payment approved, event created:", event.id);
      }

      // Pago rechazado o cancelado: enviar email
      if (payment.status === "rejected" || payment.status === "cancelled") {
        const url = new URL(request.url);
        const retryLink = `${url.origin}/${service.slug}`;

        await sendPaymentFailedEmail({
          email: customer.email,
          customerName: customer.displayName,
          serviceName: service.name,
          orgName: service.org.name,
          retryLink,
        });

        console.log("MP Payment failed, email sent:", payment.status);
      }
    } catch (e) {
      console.error("MP Webhook error:", e);
    }
  }

  return new Response("OK", { status: 200 });
};

// GET para verificación de MP
export const loader = () => new Response("OK", { status: 200 });
