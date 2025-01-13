import type { Route } from "./+types/customers";

export const action = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");
  if (intent === "new") {
    const data = await request.json();
    // @todo validate
  }
  return null;
};
