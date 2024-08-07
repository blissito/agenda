import { PrismaClient } from "@prisma/client";
import { sendMagicLink } from "../utils/emails/sendMagicLink";
const db = new PrismaClient();

export const experimentCron = async (source: string) => {
  await db.user.update({
    where: {
      email: "fixtergeek@gmail.com",
    },
    data: {
      displayName: source + new Date().toLocaleString("es-MX").toString(),
    },
  });
  await sendMagicLink(
    "brenda@fixter.org",
    "https://denik.me",
    "Experimento programado"
  );
  await sendMagicLink(
    "fixtergeek@gmail.com",
    "https://denik.me",
    "Experimento programado"
  );
  console.info("Task executed successfully ✅");
};
