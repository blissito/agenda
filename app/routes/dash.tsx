import { type User } from "@prisma/client";
import { Outlet, useLoaderData } from "@remix-run/react";
import { SideBar } from "~/components/sideBar/sideBar";

export const loader = () =>
  ({
    user: {
      email: "brenda@fixter.org",
      name: "Brendu",
      photoURL: "https://i.imgur.com/TaDTihr.png",
    },
  } as { user: User });

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <SideBar user={user}>
      <Outlet />
    </SideBar>
  );
}
