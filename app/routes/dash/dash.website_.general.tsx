import type { LoaderFunctionArgs } from "react-router"
import { data as json, useLoaderData } from "react-router"
import { z } from "zod"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { db } from "~/utils/db.server"
import { getPutFileUrl, removeFileUrl } from "~/utils/lib/tigris.server"

const generalFormSchema = z.object({
  name: z.string().min(1),
  id: z.string().min(1),
  shopKeeper: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
})

export type GeneralFormSchemaType = z.infer<typeof generalFormSchema>

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserAndOrgOrRedirect(request)
  if (!user.orgId) throw json(null, { status: 404 })
  const org = await db.org.findUnique({
    where: { id: user.orgId },
    select: {
      name: true,
      id: true,
      shopKeeper: true,
      description: true,
      address: true,
      // logo: true,
    },
  })
  if (!org) throw json(null, { status: 404 })
  const putUrl = await getPutFileUrl(`logos/${org.id}`)
  const removeUrl = await removeFileUrl(`logos/${org.id}`)

  return {
    user,
    org,
    action: {
      removeUrl,
      putUrl,
      readUrl: `/api/images?key=logos/${org.id}`,
    },
  }
}

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const formData = await request.formData();
//   const intent = formData.get("intent");
//   if (intent === "general_info") {
//     const data = JSON.parse(formData.get("data") as string);
//     // zod validation
//     const validatedData = generalFormSchema.parse(data); // esto truena
//     await updateOrg(validatedData); // esto se llama con data correcta
//     return redirect("/dash/website");
//   }
// };

export default function Index() {
  const { org, action } = useLoaderData<typeof loader>()

  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website">Mi sitio web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website/general">
              General
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </section>
  )
}
