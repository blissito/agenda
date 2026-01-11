// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import { TimesForm } from "~/components/forms/TimesForm";
import { getUserAndOrgOrRedirect } from "~/.server/userGetters";
import { useFetcher, useLoaderData } from "react-router";
import { handleOrgUpdate } from "~/.server/form_handlers/serviceTimesFormHandler";
import { weekDaysOrgSchema } from "~/utils/zod_schemas";

export const loader = async ({ request }) => {
  return await getUserAndOrgOrRedirect(request, {
    select: {
      weekDays: true,
    },
  });
};

export const action = async ({ request }) => {
  await handleOrgUpdate(request, () => Response.redirect("/dash/website"));
  return null;
};

export default function Index() {
  const { org } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleSubmit = (weekDays) => {
    weekDaysOrgSchema.parse({ weekDays });
    fetcher.submit(
      {
        data: JSON.stringify({ weekDays }),
        intent: "update_org",
      },
      { method: "POST" }
    );
  };

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
  );
}
