import { useLoaderData, useNavigate } from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { PrimaryButton } from "~/components/common/primaryButton";
import { Checklist } from "~/components/icons/menu/checklist";
import { Landing } from "~/components/icons/menu/landing";
import { Share } from "~/components/icons/menu/share";
import { StepDone } from "~/components/icons/menu/stepdone";
import { Stripe } from "~/components/icons/menu/stripe";
import { User } from "~/components/icons/menu/user";
import { getUserAndOrgOrRedirect } from "~/db/userGetters";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const { org } = await getUserAndOrgOrRedirect(request);
  const servicesCount = await db.service.count({
    where: {
      orgId: org.id,
    },
  });
  url.pathname = `/${org.slug}/agenda`;

  return { url: url.toString(), org, servicesCount };
};

export default function DashOnboarding() {
  const { servicesCount, url } = useLoaderData<typeof loader>();
  const [pop, setPop] = useState(false);
  const [shareLink, setShareLink] = useState("0");
  const [sitioWebDone, setSitioWeb] = useState("0");
  const navigate = useNavigate();

  const handleSitioWeb = () => {
    localStorage.setItem("sitioWebDone", "1");
    navigate(new URL(url).pathname);
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(url);
    setPop(true);
    setTimeout(() => setPop(false), 1000);
    localStorage.setItem("shareLink", "1");
    setShareLink("1");
  };

  useEffect(() => {
    const sitioW = localStorage.getItem("sitioWebDone");
    const shareL = localStorage.getItem("shareLink");
    if (sitioW === "1") {
      setSitioWeb(sitioW);
    }
    if (shareL) {
      setShareLink(shareL);
    }
  }, []);

  return (
    <main className="max-w-7xl  mx-auto pt-28  max-h-screen  ">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border-[#EFEFEF]">
        <div>
          <h3 className="text-2xl font-satoMiddle">
            ¡Ya casi terminas de configurar tu agenda!
          </h3>
          <p className="text-brand_gray mt-1">
            Estás a unos pasos de empezar a recibir a tus clientes
          </p>
        </div>
        <hr className="h-[1px] border-none bg-brand_stroke my-6" />
        <div className="flex flex-col gap-8">
          <Step
            icon={<User />}
            title="Crea tu cuenta y configura tu horario"
            description="El primer paso ya está hecho "
            cta={<StepCheck />}
          />
          <Step
            icon={<Landing />}
            title="Conoce tu sitio web y agenda una cita de prueba"
            description="Échale un ojo a tu sitio web y pruébalo"
            cta={
              // @TODO convert into component because is reapeting
              <>
                <AnimatePresence>
                  {sitioWebDone !== "1" ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <PrimaryButton onClick={handleSitioWeb} className="h-10">
                        Visitar
                      </PrimaryButton>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <StepCheck />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            }
          />
          <Step
            icon={<Stripe />}
            title="Da de alta tu cuenta de pagos (opcional)"
            description="Crea tu cuenta de Stripe y vincúlala a Deník  "
            cta={
              <PrimaryButton className="h-10" isDisabled>
                Ir
              </PrimaryButton>
            }
          />
          <Step
            icon={<Checklist />}
            title="Crea tu primer servicio"
            description="Agrega uno o todos tus servicios "
            cta={
              <>
                {
                  <AnimatePresence>
                    {servicesCount < 2 ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <PrimaryButton
                          as="Link"
                          to="/dash/servicios"
                          onClick={handleCopyURL}
                          className="h-10"
                        >
                          Agregar
                        </PrimaryButton>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <StepCheck />
                      </motion.div>
                    )}
                  </AnimatePresence>
                }
              </>
            }
          />
          <Step
            icon={<Share />}
            title="Comparte el link con tus clientes"
            description="Prueba el agendamiento desde tu dashboard"
            cta={
              <>
                <AnimatePresence>
                  {shareLink !== "1" ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <PrimaryButton onClick={handleCopyURL} className="h-10">
                        Copiar
                      </PrimaryButton>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <StepCheck />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p
                  id="pop"
                  className={twMerge(
                    "bg-gray-600/80 text-white text-xs min-w-fit p-2 rounded-lg absolute right-0",
                    pop ? "block" : "hidden"
                  )}
                >
                  copiado ✅
                </p>
              </>
            }
          />
        </div>
      </div>
      <div className="max-w-2xl h-[72px] mx-auto items-center bg-white px-8 py-6 mt-6 rounded-2xl border-[#EFEFEF] flex justify-between overflow-hidden">
        <p>
          ¿Tienes alguna duda? Escríbenos a{" "}
          <a href="mailto:hola@denik.me" className="text-brand_blue underline">
            hola@denik.me
          </a>{" "}
        </p>
        <img
          className="w-[140px] h-[140px]"
          src="/images/chat.gif"
          alt="dancer"
        />
      </div>
    </main>
  );
}

const StepCheck = () => {
  return (
    <section className="w-[120px] flex justify-center">
      <StepDone />
    </section>
  );
};

const Step = ({
  icon,
  title,
  description,
  cta,
  isDone,
  onClick,
}: {
  isDone?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: ReactNode;
}) => {
  return (
    <section className="flex justify-between items-center">
      <div className="flex  gap-4">
        <div className="bg-[#F9F9FB] w-16 h-14 flex justify-center items-center rounded">
          {icon}
        </div>
        <div>
          <p className="font-satoMiddle">{title}</p>
          <p className="text-brand_gray">{description}</p>
        </div>
      </div>
      {cta}
    </section>
  );
};
