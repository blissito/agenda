import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { z } from "zod";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { PrimaryButton } from "~/components/common/primaryButton";
import { TopBar } from "~/components/common/topBar";
import { BasicInput } from "~/components/forms/BasicInput";
import { ArrowRight } from "~/components/icons/arrowRight";
import {
  handleMagicLinkLogin,
  redirectIfUser,
} from "~/.server/userGetters";
import { destroySession, getSession } from "~/sessions";
import { cn } from "~/utils/cn";
import { sendMagicLink } from "~/utils/emails/sendMagicLink";
import type { Route } from "./+types/signin";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "magic_link") {
    const email = formData.get("email");
    const emailSchema = z.string().email();
    const sp = emailSchema.safeParse(email);
    if (!sp.success) {
      return {
        ...sp,
        error: sp.success ? null : { message: "Ingresa un correo válido" },
      };
    }

    try {
      // send email
      await sendMagicLink(email as string, request.url);
      return { success: true };
    } catch (error) {
      console.error("Failed to send magic link:", error);
      return {
        success: false,
        error: { message: "Error al enviar el correo. Por favor intenta de nuevo." },
      };
    }
  }

  return null;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { searchParams } = new URL(request.url);
  const intent = searchParams.get("intent");

  if (searchParams.has("token")) {
    // is magic link
    return await handleMagicLinkLogin(
      searchParams.get("token") as string,
      request
    );
  }

  if (intent === "logout") {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  }

  return await redirectIfUser(request);
};

export default function Page() {
  const navigation = useNavigation();
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  if (actionData?.success) {
    // success screen (magic link)
    return (
      <section className="flex flex-col items-center justify-center h-screen max-w-4xl mx-auto bg-white ">
        <img src="/images/signin/sending-email.svg" alt="illustration" />
        <h1 className="text-center text-2xl font-jakarta text-brand_dark mt-6">
          ¡Hemos enviado un mail a tu correo! 👋🏻
        </h1>
        <p className="text-center mb-4 text-xl mt-6 text-brand_gray">
          Por favor revisa tu bandeja de entrada y{" "}
          <strong className="font-satoMedium">da clic en el enlace </strong>del
          email para iniciar sesión.
        </p>
        <p className="text-center text-brand_gray text-xl">
          ¡A veces el mail puede terminar en SPAM! Esperamos que ese no sea el
          caso, pero si no llega entre uno y tres minutos, ya sabes donde
          encontrarlo.
        </p>
        <EmojiConfetti repeat={1} />
      </section>
    );
  }

  return (
    <section className="relative bg-white">
      {loaderData?.alert && (
        <div>
          <p
            className={cn(
              " text-white flex justify-center py-2 fixed top-0 right-0 left-0",
              {
                "bg-red-500": loaderData.alert.type === "error",
                "bg-brand_blue": loaderData.alert.type === "info",
                "bg-orange-500": loaderData.alert.type === "warning",
              }
            )}
          >
            {loaderData.alert.message}
          </p>
        </div>
      )}
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 w-[45%] lg:w-auto"
        src="/images/denik-markwater.png"
      />
      <TopBar />
      <section className="flex justify-center items-center h-screen flex-col gap-6 w-[90%]  md:max-w-sm mx-auto z-50">
        <h1 className="text-xl font-semibold mb-4">
          Inicia sesión o crea una cuenta
        </h1>

        <Form className="w-full" method="post">
          {actionData && !actionData.success && actionData.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{actionData.error.message}</p>
            </div>
          )}

          <BasicInput
            placeholder="ejemplo@gmail.com"
            label="Email"
            name="email"
            className="mb-0 pb-0"
            error={actionData?.error || undefined}
          />

          <PrimaryButton
            isLoading={navigation.state !== "idle"}
            type="submit"
            className="w-full"
            name="intent"
            value="magic_link"
          >
            Continuar <ArrowRight />{" "}
          </PrimaryButton>
        </Form>
      </section>
    </section>
  );
}
