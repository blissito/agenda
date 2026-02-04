import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { redirect, useFetcher, useLoaderData } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { SecondaryButton } from "~/components/common/secondaryButton"
import { TimesForm } from "~/components/forms/TimesForm"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump"
import { db } from "~/utils/db.server"
import { spanishToEnglish } from "~/utils/weekDaysTransform"
import type { WeekSchema } from "~/utils/zod_schemas"
import { weekDaysOrgSchema } from "~/utils/zod_schemas"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { org, user } = await getUserAndOrgOrRedirect(request, {
    select: {
      weekDays: true,
    },
  })
  if (!org) throw new Error("Org not found")
  return { org, user }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Error("Org not found")

  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "update_org") {
    const rawData = JSON.parse(formData.get("data") as string)
    const result = weekDaysOrgSchema.safeParse(rawData)
    if (!result.success) {
      return Response.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 },
      )
    }

    const transformedWeekDays = spanishToEnglish(result.data.weekDays)

    await db.org.update({
      where: { id: org.id },
      data: { weekDays: { set: transformedWeekDays } },
    })

    return redirect("/dash/website")
  }

  return null
}

export default function Index() {
  const { org } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  const handleSubmit = (weekDays: WeekSchema) => {
    weekDaysOrgSchema.parse({ weekDays })
    fetcher.submit(
      {
        data: JSON.stringify({ weekDays }),
        intent: "update_org",
      },
      { method: "POST" },
    )
  }

  return (
    <section>
      <Breadcrumb className="text-brand_gray">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website">Mi sitio web</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dash/website/horario">
              Horario
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white rounded-2xl max-w-3xl p-8 mt-6">
        <h2
          className="font-satoMiddle mb-8 text-xl
        "
        >
          Horario: Actualiza los días y horarios en los que ofreces servicio
        </h2>
        <section>
          <TimesForm org={org} onSubmit={handleSubmit}>
            {/* Children acting as footer */}
            <div className="flex mt-16 justify-end gap-6">
              <SecondaryButton
                as="Link"
                to="/dash/website"
                className="w-[120px]"
                isDisabled={fetcher.state !== "idle"}
              >
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                isDisabled={fetcher.state !== "idle"}
                type="submit"
              >
                Guardar
              </PrimaryButton>
            </div>
          </TimesForm>
        </section>
      </div>
    </section>
  )
}
