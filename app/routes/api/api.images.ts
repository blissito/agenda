import { type LoaderFunctionArgs, redirect, data } from "react-router";
import { getImageURL } from "~/utils/lib/tigris.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const fileKey = url.searchParams.get("key");
  if (!fileKey) return data(null, { status: 404 });
  const link = await getImageURL(fileKey);
  // @TODO: improve: links are generater even if key doesn't exist
  return redirect(link);
};
