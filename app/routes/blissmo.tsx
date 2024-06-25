import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = (props: LoaderFunctionArgs) => {
  return db.user.findFirst() || {};
};

export default function Page() {
  const user = useLoaderData<typeof loader>();
  return <h2>Blissmos {user.email}</h2>;
}
