import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getImageURL } from "~/utils/lib/tigris.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const fileKey = url.searchParams.get("key");
  if (!fileKey) return json(null, { status: 404 });
  const link = await getImageURL(fileKey);
  return redirect(link);
};
