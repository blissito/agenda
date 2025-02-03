import {
  Form,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "react-router";
import { type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Spinner } from "~/components/common/Spinner";
import { TopBar } from "~/components/common/topBar";
import { BasicInput } from "~/components/forms/BasicInput";
import { ArrowRight } from "~/components/icons/arrowRight";
import {
  getOrCreateUser,
  handleMagicLinkLogin,
  redirectIfUser,
} from "~/.server/userGetters";
import { commitSession, destroySession, getSession } from "~/sessions";
import { cn } from "~/utils/cn";
import { sendMagicLink } from "~/utils/emails/sendMagicLink";
import {
  type FirebaseUserData,
  startGoogleLogin,
  startMicrosoftLogin,
} from "~/utils/lib/firebase";
import type { Route } from "./+types/signin";

export const MICROSOFT_BRAND_NAME = "microsoft";
export const GOOGLE_BRAND_NAME = "google";
const REDIRECT_AFTER_LOGIN = "/dash";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const session = await getSession(request.headers.get("Cookie"));
  console.log("SIGNIN_INTENT ::: ", intent);

  if (intent === MICROSOFT_BRAND_NAME) {
    const data = JSON.parse(formData.get("data") as string) as FirebaseUserData;
    const user = await getOrCreateUser(data);
    session.set("userId", user.id); // @TODO: move this to a reusable function
    return redirect(REDIRECT_AFTER_LOGIN, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
  if (intent === GOOGLE_BRAND_NAME) {
    const data = JSON.parse(formData.get("data") as string) as FirebaseUserData;
    const user = await getOrCreateUser(data);
    session.set("userId", user.id); // @TODO: move this to a reusable function
    throw redirect(REDIRECT_AFTER_LOGIN, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
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
    // send email
    await sendMagicLink(email as string, request.url);
    return { success: true };
  } // sending actionData

  console.log("SIGNIN_INTENT ::: ", "Not successful", null);
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
  const fetcher = useFetcher<typeof action>();
  const [provider, setProvider] = useState(GOOGLE_BRAND_NAME);

  const handleMicrosoft = async () => {
    setProvider(MICROSOFT_BRAND_NAME);
    const resutl = await startMicrosoftLogin();
    const userData = {
      ...resutl.user.providerData[0],
    };
    fetcher.submit(
      { data: JSON.stringify(userData), intent: MICROSOFT_BRAND_NAME },
      { method: "post" }
    );
    console.log("Client ok=>", userData);
  };

  const handleGoogle = async () => {
    setProvider(GOOGLE_BRAND_NAME);
    const {
      user: {
        accessToken,
        uid,
        email,
        displayName,
        phoneNumber,
        emailVerified,
        providerId,
        photoURL,
      },
    } = await startGoogleLogin();

    const userData = {
      accessToken,
      uid,
      email,
      displayName,
      phoneNumber,
      emailVerified,
      providerId,
      photoURL,
    };
    fetcher.submit(
      { data: JSON.stringify(userData), intent: GOOGLE_BRAND_NAME },
      { method: "post" }
    );
  };

  const isLoading = fetcher.state !== "idle";

  if (actionData?.success) {
    // success screen (magic link)
    return (
      <section className="  bg-white ">
        <div className="flex flex-col items-center justify-center h-screen max-w-4xl mx-auto">
          <img src="/images/signin/sending-email.svg" alt="illustration" />
          <h1 className="text-center text-2xl font-jakarta text-brand_dark mt-6">
            ¡Hemos enviado un mail a tu correo! 👋🏻
          </h1>
          <p className="text-center mb-4 text-xl mt-6 text-brand_gray">
            Por favor revisa tu bandeja de entrada y{" "}
            <strong className="font-satoMedium">da clic en el enlace </strong>
            del mail para iniciar sesión.
          </p>
          <p className="text-center text-brand_gray text-xl">
            ¡A veces el mail puede terminar en SPAM! Esperamos que ese no sea el
            caso, pero si no llega entre uno y tres minutos, ya sabes donde
            encontrarlo. 👀
          </p>
          <EmojiConfetti repeat={1} />
        </div>
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
      {fetcher.data && (
        <section>
          <img alt="avatar" src={fetcher.data.photoURL} />
        </section>
      )}
      <section className="flex justify-center items-center h-screen flex-col gap-6 w-[90%]  md:max-w-sm mx-auto z-50">
        <h1 className="text-2xl font-semibold mb-4">
          Inicia sesión o crea una cuenta
        </h1>

        <LoginButton
          onClick={handleGoogle}
          isLoading={provider === GOOGLE_BRAND_NAME && isLoading}
          spinner={<Spinner />}
        >
          <img alt="microsoft logo" src="/images/logos/google.svg" />
          <span className="font-medium text-xs">Continua con Gmail</span>
        </LoginButton>

        <LoginButton
          spinner={<Spinner />}
          isLoading={provider === MICROSOFT_BRAND_NAME && isLoading}
          onClick={handleMicrosoft}
          type="button"
          intent="microsoft"
        >
          <img alt="microsoft logo" src="/images/logos/microsoft.svg" />
          <span className="font-medium text-xs">Continua con Microsoft</span>
        </LoginButton>
        <hr className="bg-brand_stroke  mt-2 h-[1px] w-full border-none" />
        <Form className="w-full" method="post">
          <BasicInput
            placeholder="ejemplo@gmail.com"
            label="Email"
            name="email"
            className="mb-0 pb-0"
            error={actionData?.error}
          />

          <PrimaryButton
            isLoading={navigation.state !== "idle"}
            type="submit"
            className="w-full mt-8"
            name="intent"
            value="magic_link"
          >
            Continuar{" "}
            <ArrowRight
              fill={navigation.state !== "idle" ? "#606264" : undefined}
            />{" "}
          </PrimaryButton>
        </Form>
      </section>
    </section>
  );
}

const LoginButton = ({
  intent,
  spinner,
  isLoading,
  children,
  ...props
}: {
  spinner?: ReactNode;
  children?: ReactNode;
  isLoading?: boolean;
  intent?: typeof GOOGLE_BRAND_NAME | typeof MICROSOFT_BRAND_NAME;
  [x: string]: unknown;
}) => {
  return (
    <button
      disabled={isLoading}
      type="submit"
      name="intent"
      value={intent}
      className={twMerge(
        "transition-all flex gap-4 items-center justify-center w-full rounded-full border active:bg-transparent hover:shadow-sm active:translate-y-[1px] h-12",
        isLoading && "pointer-events-none bg-gray-50 border-gray-100"
      )}
      {...props}
    >
      {isLoading && spinner
        ? spinner
        : isLoading && (
            <div className="h-6 w-6 rounded-full border-4 animate-spin border-brand_blue border-l-brand_light_gray" />
          )}
      {!isLoading && children}
    </button>
  );
};
