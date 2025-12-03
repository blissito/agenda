import { redirect } from "react-router";
import type { Route } from "./+types/api";

export const loader = ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");

  if (intent === "return") {
    return redirect("/dash/pagos?success=1");
  }
  return null;
};
