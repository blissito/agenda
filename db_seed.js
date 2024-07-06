import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
await prisma.user.createMany({
  data: [
    {
      email: "blissmo@gmail.com",
      name: "blissmo",
    },
    {
      email: "blissma@gmail.com",
      name: "blissma",
    },
    {
      email: "blissme@gmail.com",
      name: "blissme",
    },
    {
      email: "blissmi@gmail.com",
      name: "blissmi",
    },
    {
      role: "ADMIN",
      email: "bliss@gmail.com",
      name: "bliss",
    },
  ],
});
console.log("DB successfuly seeded 👽");
console.log(await prisma.user.count());
