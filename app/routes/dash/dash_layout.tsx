import { Outlet } from "react-router";
import { getUserOrRedirect } from "~/.server/userGetters";
import { SideBar } from "~/components/sideBar/sideBar";
import { Route } from "./+types/dash_layout";

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    user: await getUserOrRedirect(request),
  };
};

export default function DashLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <>
      <SideBar user={user}>
        <Outlet />
      </SideBar>
    </>
  );
}
