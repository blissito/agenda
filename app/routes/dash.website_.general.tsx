import { BasicInput } from "~/components/forms/BasicInput";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrump";
import { PrimaryButton } from "~/components/common/primaryButton";
import { SecondaryButton } from "~/components/common/secondaryButton";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getUserAndOrgOrRedirect, updateOrg } from "~/db/userGetters";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useForm } from "react-hook-form";
import { db } from "~/utils/db.server";
import { z } from "zod";

const generalFormSchema = z.object({
  name: z.string().min(1),
  id: z.string().min(1),
  shopKeeper: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { user } = await getUserAndOrgOrRedirect(request);
  const org = await db.org.findUnique({
    where: { id: user.orgId },
    select: {
      name: true,
      id: true,
      shopKeeper: true,
      description: true,
      address: true,
    },
  });
  return { user, org };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "general_info") {
    const data = JSON.parse(formData.get("data") as string);
    // zod validation
    const validatedData = generalFormSchema.parse(data); // esto truena
    await updateOrg(validatedData); // esto se llama con data correcta
    return redirect("/dash/website");
  }
};

export default function Index() {
  const { org, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const {
    register,
    formState: { isValid },
    handleSubmit,
  } = useForm({ defaultValues: org });

  const onSubmit = (values) => {
    // zod validation
    const validatedData = generalFormSchema.parse(values);
    fetcher.submit(
      { data: JSON.stringify(validatedData), intent: "general_info" },
      {
        method: "POST",
      }
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
            <BreadcrumbLink href="/dash/website/general">
              General
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl max-w-3xl p-8 mt-6"
      >
        <h2
          className="font-satoMiddle mb-8 text-xl
        "
        >
          Información General
        </h2>
        <div className="flex gap-6"></div>

        <BasicInput
          placeholder="Estudio Westeros"
          label="Nombre de tu negocio"
          name="name"
          register={register}
        />
        <BasicInput
          placeholder="Estudio Westeros"
          label="Tu nombre o del profesional que atiende tu negocio"
          name="shopKeeper"
          register={register}
        />
        <BasicInput
          name="address"
          placeholder="Av. Camps Elisés"
          label="Dirección de tu negocio (opcional)"
          register={register}
        />
        <BasicInput
          as="textarea"
          name="description"
          placeholder="Cuéntale a tus clientes sobre tu negocio"
          label="Descripción"
          register={register}
        />
        <div className="flex mt-16 justify-end gap-6">
          <SecondaryButton as="Link" to="/dash/website" className="w-[120px]">
            Cancelar
          </SecondaryButton>
          <PrimaryButton isDisabled={!isValid}>Guardar</PrimaryButton>
        </div>
      </Form>
    </section>
  );
}
