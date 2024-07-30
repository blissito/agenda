import { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { SideBar } from "~/components/sideBar/sideBar";
import { getUserAndOrgOrRedirect } from "~/db/userGetters";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user, org } = await getUserAndOrgOrRedirect(request, {
    redirectURL: "/signup/sobre-tu-negocio/",
  });
  return {
    user,
    org,
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
