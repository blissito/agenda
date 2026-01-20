import { useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AboutYourCompanyForm } from "~/components/forms/AboutYourCompanyForm";
import { BussinesTypeForm } from "~/components/forms/BussinesTypeForm";
import { TimesForm } from "~/components/forms/TimesForm";
import { PrimaryButton } from "~/components/common/primaryButton";
import { EmojiConfetti } from "~/components/common/EmojiConfetti";
import { getOrCreateOrgOrRedirect, updateOrg } from "~/.server/userGetters";
import { Denik } from "~/components/icons/denik";
import type { Route } from "./+types/signup.$stepSlug";
import { cn } from "~/utils/cn";

export const REQUIRED_MESSAGE = "Este campo es requerido";

export const action = async ({ request, params }: Route.ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "update_org") {
    return await updateOrg(formData, params.stepSlug);
  }
  return null;
};

export const loader = async ({
  request,
  params: { stepSlug },
}: Route.LoaderArgs) => {
  const org = await getOrCreateOrgOrRedirect(request); // redirect if isActive
  return {
    org,
    stepSlug,
  };
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { org, stepSlug } = loaderData;

  const FormComponent = useMemo(() => {
    switch (stepSlug) {
      case "4":
        return LoaderScreen;
      case "3":
        return TimesForm;
      case "2":
        return BussinesTypeForm;
      default:
        return AboutYourCompanyForm;
    }
  }, [stepSlug]);

  return (
    <article className={cn("h-screen", "grid grid-cols-6")}>
      <section
        className={twMerge("px-2 grid py-8", "bg-brand_blue", "col-span-2")}
      >
        <nav className="flex justify-center ">
          {+stepSlug > 1 ? <BackButton /> : <DenikWatermark />}
        </nav>
        <LeftHero title={org.name} />
      </section>
      <section className="col-span-4 overflow-scroll bg-white">
        <FormComponent title={org.name} org={org} />
      </section>
    </article>
  );
}

export const LoaderScreen = ({ title }: { title: string }) => {
  const [text, setText] = useState(title);
  const [show, set] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      set(true);
      setText("¡Todo esta listo! \n Es hora de agendar ");
    }, 2000);
  }, []);
  return (
    <section className="font-bold absolute z-10 inset-0 bg-brand_blue  text-white flex justify-center items-center flex-col">
      <h1 className="px-[5%] md:px-10 min-w-7xl  mx-auto flex flex-col items-center md:flex-row gap-6 md:gap-12 text-3xl text-center md:text-left md:text-5xl ">
        <img
          className="w-[120px] h-[120px]"
          src="/images/calendar.gif"
          alt="calendario"
        />
        <span className="leading-tight" style={{ whiteSpace: "pre-wrap" }}>
          {text}
        </span>
      </h1>
      {show && (
        <>
          <PrimaryButton
            to="/dash"
            as="Link"
            className="border mt-12 text-brand_dark bg-white font-satoMiddle "
            // isDisabled={isDisabled}
            type="submit"
          >
            ¡Ver mi agenda!
          </PrimaryButton>
          <EmojiConfetti
            mode="emojis"
            emojis={["📆", "💇🏻‍♀️", "👩🏻‍💻", "📍", "🎀", "🥳", "💅🏼"]}
          />
        </>
      )}
    </section>
  );
};

export const LeftHero = ({ title }: { title: ReactNode }) => {
  return (
    <div className="flex justify-center items-center  max-w-xl mx-auto grow ">
      <h2 className="text-white lg:text-5xl  text-3xl font-bold !leading-tight		">
        {title}
      </h2>
    </div>
  );
};

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={twMerge(
        "mb-12 h-4 w-full",
        "transition-all rounded-full top-0 left-0 text-white text-3xl justify-between items-center flex",
        "max-w-xl mx-auto",
        "active:opacity-50" // Improve please! 🥶
      )}
    >
      <HiOutlineArrowNarrowLeft />
      <Denik fill="#ffffff" className="block lg:hidden h-10" />
    </button>
  );
};

export const DenikWatermark = () => {
  // const navigate = useNavigate();
  return (
    <div
      className={twMerge(
        "transition-all top-0 left-0 text-white text-3xl justify-center items-center block",
        "max-w-xl mx-auto",
        "active:opacity-50" // Improve please! 🥶
      )}
    >
      <Denik fill="#ffffff" />
    </div>
  );
};
