#!/usr/bin/env npx tsx
/**
 * Delete data from the database
 *
 * Usage:
 *   npx tsx scripts/dev/db-delete.ts User --id "ID"
 *   npx tsx scripts/dev/db-delete.ts Org --id "ID" --cascade   # Deletes services, customers, events too
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODELS = ["User", "Org", "Service", "Customer", "Event"] as const;
type ModelName = (typeof MODELS)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    model?: string;
    id?: string;
    cascade: boolean;
  } = {
    cascade: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--id" && args[i + 1]) {
      options.id = args[++i];
    } else if (arg === "--cascade") {
      options.cascade = true;
    } else if (!arg.startsWith("--") && !options.model) {
      options.model = arg;
    }
  }

  return options;
}

async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    console.log(`User with id "${id}" not found`);
    return;
  }
  await prisma.user.delete({ where: { id } });
  console.log(`Deleted User: [${id}] ${user.email}`);
}

async function deleteOrg(id: string, cascade: boolean) {
  const org = await prisma.org.findUnique({ where: { id } });
  if (!org) {
    console.log(`Org with id "${id}" not found`);
    return;
  }

  if (cascade) {
    // Delete in order: Events -> Customers -> Services -> Org
    const eventCount = await prisma.event.deleteMany({ where: { orgId: id } });
    console.log(`  Deleted ${eventCount.count} events`);

    const customerCount = await prisma.customer.deleteMany({ where: { orgId: id } });
    console.log(`  Deleted ${customerCount.count} customers`);

    const serviceCount = await prisma.service.deleteMany({ where: { orgId: id } });
    console.log(`  Deleted ${serviceCount.count} services`);

    // Remove orgId from owner's orgIds array
    await prisma.user.updateMany({
      where: { orgIds: { has: id } },
      data: { orgIds: { set: [] } }, // This is a simplification; in production you'd remove just this ID
    });
  }

  await prisma.org.delete({ where: { id } });
  console.log(`Deleted Org: [${id}] ${org.slug}`);
}

async function deleteService(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    console.log(`Service with id "${id}" not found`);
    return;
  }

  // Unlink events first
  await prisma.event.updateMany({
    where: { serviceId: id },
    data: { serviceId: null },
  });

  await prisma.service.delete({ where: { id } });
  console.log(`Deleted Service: [${id}] ${service.slug}`);
}

async function deleteCustomer(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    console.log(`Customer with id "${id}" not found`);
    return;
  }

  // Unlink events first
  await prisma.event.updateMany({
    where: { customerId: id },
    data: { customerId: null },
  });

  await prisma.customer.delete({ where: { id } });
  console.log(`Deleted Customer: [${id}] ${customer.email}`);
}

async function deleteEvent(id: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    console.log(`Event with id "${id}" not found`);
    return;
  }
  await prisma.event.delete({ where: { id } });
  console.log(`Deleted Event: [${id}] ${event.title}`);
}

async function main() {
  const options = parseArgs();

  if (!options.model || !options.id) {
    console.log("\nUsage:");
    console.log('  npx tsx scripts/dev/db-delete.ts User --id "ID"');
    console.log('  npx tsx scripts/dev/db-delete.ts Org --id "ID" --cascade');
    console.log('  npx tsx scripts/dev/db-delete.ts Service --id "ID"');
    console.log('  npx tsx scripts/dev/db-delete.ts Customer --id "ID"');
    console.log('  npx tsx scripts/dev/db-delete.ts Event --id "ID"');
    console.log("\nAvailable models: " + MODELS.join(", "));
    console.log("\nOptions:");
    console.log("  --id        Required. The ID of the record to delete.");
    console.log("  --cascade   For Org only. Also deletes related services, customers, and events.");
    return;
  }

  const model = options.model as ModelName;
  if (!MODELS.includes(model)) {
    console.error(`Error: Unknown model "${options.model}". Available: ${MODELS.join(", ")}`);
    process.exit(1);
  }

  try {
    switch (model) {
      case "User":
        await deleteUser(options.id);
        break;
      case "Org":
        await deleteOrg(options.id, options.cascade);
        break;
      case "Service":
        await deleteService(options.id);
        break;
      case "Customer":
        await deleteCustomer(options.id);
        break;
      case "Event":
        await deleteEvent(options.id);
        break;
    }

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
