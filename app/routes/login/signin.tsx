// @ts-nocheck - TODO: Arreglar tipos cuando se edite este archivo
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
import { handleMagicLinkLogin, redirectIfUser } from "~/.server/userGetters";
import {
  checkRateLimit,
  getClientIP,
  rateLimitPresets,
  rateLimitResponse,
} from "~/.server/rateLimit";
import { destroySession, getSession } from "~/sessions";
import { cn } from "~/utils/cn";
import { sendMagicLink } from "~/utils/emails/sendMagicLink";
import type { Route } from "./+types/signin";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "magic_link") {
    // Rate limit magic link requests
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(
      `magic_link:${clientIP}`,
      rateLimitPresets.magicLink
    );

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit.resetAt);
    }

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
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent");

  // Magic link
  if (url.searchParams.has("token")) {
    const result = await handleMagicLinkLogin(
      url.searchParams.get("token") as string,
      request
    );
    // Si es redirect (éxito), lanzarlo para que React Router lo procese
    if (result instanceof Response) {
      throw result;
    }
    // Si es error, mantener next vacío para tipos
    return { ...result, next: "" };
  }

  // Logout
  if (intent === "logout") {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  }

  const next = url.searchParams.get("next") || "";
  await redirectIfUser(request);
  return { next, alert: undefined };
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
  
      {/* marca de agua derecha */}
      <img
        alt="denik markwater"
        className="absolute right-0 bottom-0 z-0 w-[45%] lg:w-auto pointer-events-none select-none opacity-60"
        src="/images/denik-markwater.png"
      />
  
      <TopBar />
  
      {/* Layout 2 columnas */}
      <section className="relative z-10 flex min-h-screen w-full">
        {/* LADO IZQUIERDO  */}
        <aside className="hidden lg:block lg:w-[35%] relative">

          <img
            src="/images/signin/signin-cover.png"
            alt="signin cover"
            className="absolute inset-0 h-full w-full object-cover"
          />
  
          {/* degradado para mejorar legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
  
          <p className="absolute left-10 bottom-10 max-w-md text-white text-lg font-medium leading-snug">
            “Simplifica todas las herramientas
            <br />
            que tu negocio necesita”
          </p>
        </aside>
  
        {/* LADO DERECHO (formulario) */}
        <main className="flex-1 flex items-center justify-center px-6">
          <section className="w-full max-w-md flex flex-col items-center text-center gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-brand_dark">
              Bienvenid@ a Deník
            </h1>
  
            <p className="text-sm md:text-base text-brand_gray max-w-sm">
              La forma fácil de agendar, cobrar y crecer. Deja que Deník lleve tu
              agenda, tú lleva tu negocio.
            </p>
  
            {/* Botones OAuth */}
            <div className="w-full flex flex-col gap-3 mt-4">
              <a
                href={`/auth/google${loaderData?.next ? `?next=${encodeURIComponent(loaderData.next)}` : ""}`}
                className="w-full h-11 rounded-full border border-black/10 bg-white flex items-center justify-center gap-3 text-sm font-medium text-brand_dark hover:bg-black/[0.02] transition"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303C33.676 32.657 29.246 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.272 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.272 4 24 4c-7.682 0-14.35 4.329-17.694 10.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 44c5.164 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.196 35.091 26.715 36 24 36c-5.224 0-9.64-3.318-11.271-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303a11.99 11.99 0 0 1-4.084 5.565l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                  />
                </svg>
                Continua con Google
              </a>

              <a
                href={`/auth/outlook${loaderData?.next ? `?next=${encodeURIComponent(loaderData.next)}` : ""}`}
                className="w-full h-11 rounded-full border border-black/10 bg-white flex items-center justify-center gap-3 text-sm font-medium text-brand_dark hover:bg-black/[0.02] transition"
              >
                <span
                  className="grid grid-cols-2 gap-[2px] w-[16px] h-[16px]"
                  aria-hidden="true"
                >
                  <span className="bg-[#F25022] rounded-[2px]" />
                  <span className="bg-[#7FBA00] rounded-[2px]" />
                  <span className="bg-[#00A4EF] rounded-[2px]" />
                  <span className="bg-[#FFB900] rounded-[2px]" />
                </span>
                Continua con Microsoft
              </a>
  

              <div className="flex items-center justify-center gap-3 my-2">
                <span className="h-px w-full bg-black/10" />
                <span className="text-xs text-brand_gray">o</span>
                <span className="h-px w-full bg-black/10" />
              </div>

              {/* Formulario de magic link */}
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
                  className="w-full mt-4"
                  name="intent"
                  value="magic_link"
                >
                  Continuar <ArrowRight />
                </PrimaryButton>
              </Form>
            </div>
          </section>
        </main>
      </section>
    </section>
  );
}
