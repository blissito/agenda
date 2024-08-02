import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useFetcher } from "@remix-run/react";
import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Spinner } from "~/components/common/Spinner";
import { TopBar } from "~/components/common/topBar";
import { BasicInput } from "~/components/forms/BasicInput";
import { ArrowRight } from "~/components/icons/arrowRight";
import { getOrCreateUser, redirectIfUser } from "~/db/userGetters";
import { commitSession, destroySession, getSession } from "~/sessions";
import {
  FirebaseUserData,
  startGoogleLogin,
  startMicrosoftLogin,
} from "~/utils/lib/firebase";

export const MICROSOFT_BRAND_NAME = "microsoft";
export const GOOGLE_BRAND_NAME = "google";
const REDIRECT_AFTER_LOGIN = "/dash";

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
    return redirect("/", {
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
    <section className="relative">
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
      <section className="flex justify-center items-center h-screen overflow-hidden flex-col gap-6 w-[90%]  md:max-w-sm mx-auto z-50">
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
        <hr className="bg-brand_stroke  mt-2 h-[1px] w-full border-none" />
        <BasicInput
          isDisabled
          placeholder="ejemplo@gmail.com"
          label="Email"
          name="email"
        />
        <PrimaryButton className="w-full" isDisabled>
          Continuar <ArrowRight />{" "}
        </PrimaryButton>
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
