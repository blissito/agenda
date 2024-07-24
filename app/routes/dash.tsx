import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { SideBar } from "~/components/sideBar/sideBar";
import { getUserOrRedirect } from "~/db/userGetters";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return {
    user: await getUserOrRedirect(request, {
      redirectURL: "/signin",
    }),
  };
};

export default function Page() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <SideBar user={user}>
      <Outlet />
    </SideBar>
  );
}
