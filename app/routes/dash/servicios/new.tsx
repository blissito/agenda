import type { Route } from "./+types/new";
import {
  generalFormSchema,
  ServiceGeneralForm,
} from "~/components/forms/services_model/ServiceGeneralForm";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "~/utils/cn";
import { PrimaryButton } from "~/components/common/primaryButton";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import type { ZodError, ZodIssue } from "zod";
import { useFetcher } from "react-router";
import {
  ServicePhotoForm,
  servicePhotoFormSchema,
} from "~/components/forms/services_model/ServicePhotoForm";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  return { id };
};

const formatErrors = (zodError: ZodError) => {
  return zodError.issues.reduce((acc, err) => {
    acc[err.path[0]] = err;
    return acc;
  }, {}) as Record<string, ZodIssue>;
};

export default function Page({ loaderData }: Route.ComponentProps) {
  const { id } = loaderData;
  const [errors, setErrors] = useState<Record<string, ZodIssue>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [index, setIndex] = useState(id ? 1 : 0);
  const fetcher = useFetcher();
  const intent = useMemo(() => {
    switch (index) {
      case 1:
        return "photo_form";
      default:
        return "general_form";
    }
  }, [index]);

  const parse = (form: any) => {
    if (intent === "photo_form") {
      return servicePhotoFormSchema.safeParse(form);
    } else {
      return generalFormSchema.safeParse(form);
    }
  };

  const detonateSubmit = () => {
    let err = {};
    const fd = new FormData(formRef.current!);
    const form = Object.fromEntries(fd);
    const { success, error, data } = parse(form);
    if (success) {
      fetcher.submit(
        { data: JSON.stringify({ ...data, id }), intent },
        { method: "post", action: "/api/services" }
      );
      setErrors(err);
      return;
    }
    err = formatErrors(error);
    setErrors(err);
  };

  const serviceId = fetcher.data?.id || id;

  useEffect(() => {
    const i = fetcher.data?.nextIndex;
    if (i) {
      setIndex(i);
      fetcher.data = null;
    }
  }, [fetcher]);

  return (
    <article className="h-screen bg-white fixed inset-0 pt-10 overflow-y-auto">
      <button className="top-10 right-10 absolute bg-gray-100 p-1 rounded-full hover:bg-gray-200">
        <IoClose />
      </button>
      <section className="max-w-xl mx-auto h-full flex flex-col">
        <h1 className="text-center text-2xl">
          ¡Empecemos! Describe tu servicio
        </h1>
        <Steper currentIndex={index} />
        {index === 0 && (
          <ServiceGeneralForm errors={errors} formRef={formRef} />
        )}
        {index === 1 && <ServicePhotoForm errors={errors} formRef={formRef} />}
        <ServiceFormFooter onClick={detonateSubmit} />
      </section>
    </article>
  );
}

const Steper = ({ currentIndex }: { currentIndex: number }) => {
  return (
    <nav className="flex items-center py-10 justify-center">
      <Number isActive={currentIndex === 0}>1</Number>
      <Dots />
      <Number isActive={currentIndex === 1}>2</Number>
      <Dots />
      <Number isActive={currentIndex === 2}>3</Number>
      <Dots />
      <Number isActive={currentIndex === 3}>4</Number>
    </nav>
  );
};

const Dots = () => {
  return (
    <hr className="w-20 border-b-0 border-[10px] border-gray-300 border-dotted" />
  );
};

const Number = ({
  isActive,
  children,
}: {
  isActive: boolean;
  children: ReactNode;
}) => {
  return (
    <p
      className={cn(
        "w-7 h-7 grid place-items-center bg-gray-300 text-gray-400 rounded-full mx-2",
        {
          "bg-brand_blue text-white": isActive,
        }
      )}
    >
      {children}
    </p>
  );
};

export const ServiceFormFooter = ({
  isDisabled,
  onClick,
  isLoading,
  backButtonLink = "/dash/servicios",
}: {
  onClick?: () => void;
  backButtonLink?: string;
  isLoading?: boolean;
  isDisabled?: boolean;
}) => (
  <footer className="items-center pb-4 px-4 w-full max-w-xl justify-between flex mt-auto">
    <PrimaryButton
      type="button"
      className="bg-transparent text-brand_dark font-satoMiddle flex gap-2 items-center group transition-all"
      as="Link"
      to={backButtonLink}
    >
      <FaArrowLeftLong />
      <span className="group-hover:ml-1 transition-all">Volver</span>
    </PrimaryButton>
    <PrimaryButton
      onClick={onClick}
      isDisabled={isDisabled}
      isLoading={isLoading}
      type="submit"
    >
      Continuar
    </PrimaryButton>
  </footer>
);
