import { Stripe } from "stripe";
import type { ActionFunctionArgs } from "react-router";
import { db } from "~/utils/db.server";
import {
  sendAppointmentToCustomer,
  sendAppointmentToOwner,
} from "~/utils/emails/sendAppointment";
import { sendPaymentFailedEmail } from "~/utils/emails/sendPaymentFailed";

const stripe = new Stripe(process.env.STRIPE_SECRET_TEST as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    console.error("Missing stripe signature or webhook secret");
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      console.log(`Account ${account.id} was updated`);
      // Update account status in DB if needed
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`Checkout session ${session.id} completed`);

      try {
        // Extract metadata from checkout session
        const metadata = session.metadata;
        if (!metadata?.serviceId || !metadata?.customerId) {
          console.log("Checkout session without booking metadata, skipping");
          break;
        }

        const { serviceId, customerId, start, end } = metadata;

        // Buscar servicio y customer
        const [service, customer] = await Promise.all([
          db.service.findUnique({
            where: { id: serviceId },
            include: { org: true },
          }),
          db.customer.findUnique({ where: { id: customerId } }),
        ]);

        if (!service || !customer) {
          console.error(
            "Stripe webhook: Service or customer not found:",
            serviceId,
            customerId
          );
          break;
        }

        // Crear evento con pago confirmado
        const dbEvent = await db.event.create({
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
            stripe_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || null,
            payment_method: "stripe",
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

        // Enviar emails de confirmación
        try {
          await sendAppointmentToCustomer({
            email: customer.email,
            event: dbEvent as any,
          });
          if (service.org.email) {
            await sendAppointmentToOwner({
              email: service.org.email,
              event: dbEvent as any,
            });
          }
        } catch (e) {
          console.error("Stripe webhook: Email send failed:", e);
        }

        console.log("Stripe payment approved, event created:", dbEvent.id);
      } catch (e) {
        console.error("Stripe checkout.session.completed error:", e);
      }
      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
      // Payment intent success is handled via checkout.session.completed
      // This is just for logging/monitoring
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent ${paymentIntent.id} failed`);

      try {
        const metadata = paymentIntent.metadata;
        if (!metadata?.serviceId || !metadata?.customerId) {
          console.log("PaymentIntent without booking metadata, skipping");
          break;
        }

        const { serviceId, customerId } = metadata;

        const [service, customer] = await Promise.all([
          db.service.findUnique({
            where: { id: serviceId },
            include: { org: true },
          }),
          db.customer.findUnique({ where: { id: customerId } }),
        ]);

        if (!service || !customer) {
          console.error(
            "Stripe webhook: Service or customer not found for failed payment"
          );
          break;
        }

        // Construir link para reintentar
        const retryLink = `https://${service.org.slug}.denik.me/${service.slug}`;

        await sendPaymentFailedEmail({
          email: customer.email,
          customerName: customer.displayName,
          serviceName: service.name,
          orgName: service.org.name,
          retryLink,
        });

        console.log(
          "Stripe payment failed, notification sent:",
          paymentIntent.last_payment_error?.message || "Unknown error"
        );
      } catch (e) {
        console.error("Stripe payment_intent.payment_failed error:", e);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
