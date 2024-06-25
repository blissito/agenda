import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = async (props: LoaderFunctionArgs) => {
  // const u = await db.user.findFirst();
  // if (!u) {
  //   await db.user.create({
  //     data: { email: "fixtergeek@gmail.com", name: "blissito", role: "ADMIN" },
  //   });
  // }
  const user = await db.user.findFirst();
  return { user };
};

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
  return <h2>Blissmos {user.email}</h2>;
}
