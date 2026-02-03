#!/usr/bin/env npx tsx
/**
 * Read data from the database
 *
 * Usage:
 *   npx tsx scripts/dev/db-read.ts --list-models
 *   npx tsx scripts/dev/db-read.ts User
 *   npx tsx scripts/dev/db-read.ts Org --limit 5
 *   npx tsx scripts/dev/db-read.ts Service --where "orgId=abc123"
 *   npx tsx scripts/dev/db-read.ts Event --count
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODELS = ["User", "Org", "Service", "Event", "Customer"] as const;
type ModelName = (typeof MODELS)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    model?: string;
    listModels: boolean;
    limit: number;
    where?: Record<string, string>;
    count: boolean;
    id?: string;
  } = {
    listModels: false,
    limit: 20,
    count: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--list-models") {
      options.listModels = true;
    } else if (arg === "--limit" && args[i + 1]) {
      options.limit = parseInt(args[++i], 10);
    } else if (arg === "--where" && args[i + 1]) {
      const whereStr = args[++i];
      options.where = {};
      whereStr.split(",").forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key && value) {
          options.where![key.trim()] = value.trim();
        }
      });
    } else if (arg === "--count") {
      options.count = true;
    } else if (arg === "--id" && args[i + 1]) {
      options.id = args[++i];
    } else if (!arg.startsWith("--") && !options.model) {
      options.model = arg;
    }
  }

  return options;
}

function getModelDelegate(model: ModelName) {
  const delegates: Record<ModelName, any> = {
    User: prisma.user,
    Org: prisma.org,
    Service: prisma.service,
    Event: prisma.event,
    Customer: prisma.customer,
  };
  return delegates[model];
}

// Convert BigInt to string for JSON serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
}

async function main() {
  const options = parseArgs();

  if (options.listModels) {
    console.log("\nAvailable models:");
    MODELS.forEach((m) => console.log(`  - ${m}`));
    console.log("\nUsage examples:");
    console.log("  npx tsx scripts/dev/db-read.ts User");
    console.log('  npx tsx scripts/dev/db-read.ts Org --where "ownerId=abc123"');
    console.log("  npx tsx scripts/dev/db-read.ts Service --limit 5");
    console.log("  npx tsx scripts/dev/db-read.ts Event --count");
    console.log('  npx tsx scripts/dev/db-read.ts Customer --id "abc123"');
    return;
  }

  if (!options.model) {
    console.error("Error: Model name required. Use --list-models to see available models.");
    process.exit(1);
  }

  const modelName = options.model as ModelName;
  if (!MODELS.includes(modelName)) {
    console.error(`Error: Unknown model "${options.model}". Use --list-models to see available models.`);
    process.exit(1);
  }

  const delegate = getModelDelegate(modelName);

  try {
    if (options.count) {
      const count = await delegate.count({ where: options.where });
      console.log(`\n${modelName} count: ${count}`);
      return;
    }

    if (options.id) {
      const record = await delegate.findUnique({ where: { id: options.id } });
      if (record) {
        console.log(`\n${modelName} with id "${options.id}":`);
        console.log(JSON.stringify(serializeBigInt(record), null, 2));
      } else {
        console.log(`\nNo ${modelName} found with id "${options.id}"`);
      }
      return;
    }

    const records = await delegate.findMany({
      where: options.where,
      take: options.limit,
      orderBy: { id: "desc" },
    });

    console.log(`\n${modelName} records (${records.length} of ${await delegate.count({ where: options.where })}):\n`);

    if (records.length === 0) {
      console.log("  No records found.");
    } else {
      records.forEach((record: any, i: number) => {
        const summary = getSummary(modelName, record);
        console.log(`  ${i + 1}. ${summary}`);
      });
    }

    console.log("\n(Use --id <id> to see full record details)");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

function getSummary(model: ModelName, record: any): string {
  switch (model) {
    case "User":
      return `[${record.id}] ${record.email} - ${record.displayName || "No name"}`;
    case "Org":
      return `[${record.id}] ${record.slug} - ${record.name}`;
    case "Service":
      return `[${record.id}] ${record.slug} - ${record.name} ($${record.price})`;
    case "Event":
      return `[${record.id}] ${record.title} - ${record.status} (${record.start?.toISOString().split("T")[0]})`;
    case "Customer":
      return `[${record.id}] ${record.email} - ${record.displayName}`;
    default:
      return `[${record.id}]`;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
