import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useFetcher } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Spinner } from "~/components/common/Spinner";
import { getOrCreateUser, redirectIfUser } from "~/db/userGetters";
import { commitSession, destroySession, getSession } from "~/sessions";
import {
  FirebaseUserData,
  startGoogleLogin,
  startMicrosoftLogin,
} from "~/utils/lib/firebase";

export const MICROSOFT_BRAND_NAME = "microsoft";
export const GOOGLE_BRAND_NAME = "google";
const REDIRECT_AFTER_LOGIN = "/signup/sobre-tu-negocio";

export const action = async ({ request }: ActionFunctionArgs) => {
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
    return redirect(REDIRECT_AFTER_LOGIN, {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
  console.log("SIGNIN_INTENT ::: ", "Not successful", null);
  return null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { searchParams } = new URL(request.url);
  const intent = searchParams.get("intent");
  if (intent === "logout") {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/signin", {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  }
  return (await redirectIfUser(request)) ?? null;
};

export default function Pape() {
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
    console.log("sent from client=>", userData);
  };

  const isLoading = fetcher.state !== "idle";

  return (
    <>
      {fetcher.data && (
        <section>
          <img alt="avatar" src={fetcher.data.photoURL} />
        </section>
      )}
      <section className="flex justify-center items-center h-screen overflow-hidden flex-col gap-5 max-w-sm mx-auto">
        <h1 className="text-xl font-semibold mb-4">
          Inicia sesión o crea una cuenta
        </h1>

        <LoginButton
          onClick={handleGoogle}
          // isLoading={provider === GOOGLE_BRAND_NAME && isLoading}
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
      </section>
    </>
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
        "transition-all flex gap-4 items-center justify-center w-full rounded-full border active:bg-transparent hover:shadow-sm active:translate-y-[1px] h-10",
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
