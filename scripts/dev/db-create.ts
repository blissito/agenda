#!/usr/bin/env npx tsx
/**
 * Create test data in the database
 *
 * Usage:
 *   npx tsx scripts/dev/db-create.ts User
 *   npx tsx scripts/dev/db-create.ts Org --full          # Creates user + org + 2 services + 3 customers
 *   npx tsx scripts/dev/db-create.ts Customer --count 5 --orgId "ID"
 *   npx tsx scripts/dev/db-create.ts Event --serviceId "ID" --customerId "ID"
 */
import { PrismaClient } from "@prisma/client";
import {
  generateUser,
  generateOrg,
  generateService,
  generateCustomer,
  generateEvent,
} from "./factories";

const prisma = new PrismaClient();

const MODELS = ["User", "Org", "Service", "Customer", "Event"] as const;
type ModelName = (typeof MODELS)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    model?: string;
    full: boolean;
    count: number;
    orgId?: string;
    serviceId?: string;
    customerId?: string;
    userId?: string;
  } = {
    full: false,
    count: 1,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--full") {
      options.full = true;
    } else if (arg === "--count" && args[i + 1]) {
      options.count = parseInt(args[++i], 10);
    } else if (arg === "--orgId" && args[i + 1]) {
      options.orgId = args[++i];
    } else if (arg === "--serviceId" && args[i + 1]) {
      options.serviceId = args[++i];
    } else if (arg === "--customerId" && args[i + 1]) {
      options.customerId = args[++i];
    } else if (arg === "--userId" && args[i + 1]) {
      options.userId = args[++i];
    } else if (!arg.startsWith("--") && !options.model) {
      options.model = arg;
    }
  }

  return options;
}

async function createUser() {
  const data = generateUser();
  const user = await prisma.user.create({ data });
  console.log(`Created User: [${user.id}] ${user.email}`);
  return user;
}

async function createOrg(ownerId: string) {
  const data = generateOrg(ownerId);
  const org = await prisma.org.create({ data });

  // Update user's orgId and orgIds
  await prisma.user.update({
    where: { id: ownerId },
    data: {
      orgId: org.id,
      orgIds: { push: org.id },
    },
  });

  console.log(`Created Org: [${org.id}] ${org.slug} - ${org.name}`);
  return org;
}

async function createService(orgId: string) {
  const data = generateService(orgId);
  const service = await prisma.service.create({ data });
  console.log(`Created Service: [${service.id}] ${service.slug} - ${service.name}`);
  return service;
}

async function createCustomer(orgId: string) {
  const data = generateCustomer(orgId);
  const customer = await prisma.customer.create({ data });
  console.log(`Created Customer: [${customer.id}] ${customer.email} - ${customer.displayName}`);
  return customer;
}

async function createEvent(data: {
  orgId: string;
  userId: string;
  serviceId?: string;
  customerId?: string;
}) {
  const eventData = generateEvent(data);
  const event = await prisma.event.create({ data: eventData });
  console.log(`Created Event: [${event.id}] ${event.title} - ${event.status}`);
  return event;
}

async function createFullOrg() {
  console.log("\n=== Creating Full Org Setup ===\n");

  // 1. Create User
  const user = await createUser();

  // 2. Create Org
  const org = await createOrg(user.id);

  // 3. Create 2 Services
  console.log("\nCreating services...");
  const services = [];
  for (let i = 0; i < 2; i++) {
    services.push(await createService(org.id));
  }

  // 4. Create 3 Customers
  console.log("\nCreating customers...");
  const customers = [];
  for (let i = 0; i < 3; i++) {
    customers.push(await createCustomer(org.id));
  }

  // 5. Create 2 Events
  console.log("\nCreating events...");
  await createEvent({
    orgId: org.id,
    userId: user.id,
    serviceId: services[0].id,
    customerId: customers[0].id,
  });
  await createEvent({
    orgId: org.id,
    userId: user.id,
    serviceId: services[1].id,
    customerId: customers[1].id,
  });

  console.log("\n=== Summary ===");
  console.log(`User:      ${user.email}`);
  console.log(`Org:       ${org.slug} (${org.name})`);
  console.log(`Services:  ${services.map((s) => s.slug).join(", ")}`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Events:    2`);
  console.log(`\nOrg ID for reference: ${org.id}`);

  return { user, org, services, customers };
}

async function main() {
  const options = parseArgs();

  if (!options.model) {
    console.log("\nUsage:");
    console.log("  npx tsx scripts/dev/db-create.ts User");
    console.log("  npx tsx scripts/dev/db-create.ts Org --full");
    console.log('  npx tsx scripts/dev/db-create.ts Customer --count 5 --orgId "ID"');
    console.log('  npx tsx scripts/dev/db-create.ts Event --serviceId "ID" --customerId "ID"');
    console.log("\nAvailable models: " + MODELS.join(", "));
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
        for (let i = 0; i < options.count; i++) {
          await createUser();
        }
        break;

      case "Org":
        if (options.full) {
          await createFullOrg();
        } else {
          // Need a user to create an org
          let userId = options.userId;
          if (!userId) {
            console.log("No --userId provided, creating a new user...");
            const user = await createUser();
            userId = user.id;
          }
          for (let i = 0; i < options.count; i++) {
            await createOrg(userId);
          }
        }
        break;

      case "Service":
        if (!options.orgId) {
          console.error("Error: --orgId required for creating Service");
          process.exit(1);
        }
        for (let i = 0; i < options.count; i++) {
          await createService(options.orgId);
        }
        break;

      case "Customer":
        if (!options.orgId) {
          console.error("Error: --orgId required for creating Customer");
          process.exit(1);
        }
        for (let i = 0; i < options.count; i++) {
          await createCustomer(options.orgId);
        }
        break;

      case "Event":
        if (!options.orgId) {
          console.error("Error: --orgId required for creating Event");
          process.exit(1);
        }
        // Get org to find userId
        const org = await prisma.org.findUnique({ where: { id: options.orgId } });
        if (!org) {
          console.error(`Error: Org with id "${options.orgId}" not found`);
          process.exit(1);
        }
        for (let i = 0; i < options.count; i++) {
          await createEvent({
            orgId: options.orgId,
            userId: org.ownerId,
            serviceId: options.serviceId,
            customerId: options.customerId,
          });
        }
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
