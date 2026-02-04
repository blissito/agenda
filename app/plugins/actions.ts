import type { Customer, Event, Service } from "@prisma/client";
import { register } from "./index";
import { db } from "~/utils/db.server";

type WebhookConfig = {
  url: string;
  includeCustomer?: boolean;
  includeEvent?: boolean;
  includeService?: boolean;
};

type BookingCreatedData = {
  event: Event;
  service: Service;
  customer: Customer;
};

const handleBookingCreated = async (
  data: unknown,
  orgId: string
): Promise<void> => {
  const { event, service, customer } = data as BookingCreatedData;

  const actions = await db.serviceAction.findMany({
    where: { serviceId: service.id, enabled: true },
  });

  for (const action of actions) {
    if (action.type === "webhook") {
      const config = action.config as WebhookConfig;

      if (!config.url) continue;

      const payload: Record<string, unknown> = {
        eventType: "booking.created",
        timestamp: new Date().toISOString(),
      };

      if (config.includeCustomer !== false) {
        payload.customer = {
          id: customer.id,
          displayName: customer.displayName,
          email: customer.email,
          tel: customer.tel,
        };
      }

      if (config.includeEvent !== false) {
        payload.event = {
          id: event.id,
          start: event.start,
          end: event.end,
          duration: Number(event.duration),
          status: event.status,
        };
      }

      if (config.includeService !== false) {
        payload.service = {
          id: service.id,
          name: service.name,
          price: Number(service.price),
          duration: Number(service.duration),
        };
      }

      try {
        await fetch(config.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error(`[Actions Plugin] Webhook failed:`, error);
      }
    }
  }
};

register({
  id: "actions",
  name: "Acciones",
  description: "Automatiza tareas después de cada agendamiento",
  icon: "zap",
  onEvent: {
    "booking.created": handleBookingCreated,
  },
});
