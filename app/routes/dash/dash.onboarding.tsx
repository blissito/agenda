import { AnimatePresence, motion } from "motion/react"
import { type ReactNode, useEffect, useState } from "react"
import type { LoaderFunctionArgs } from "react-router"
import { useLoaderData, useNavigate } from "react-router"
import { twMerge } from "tailwind-merge"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { Checklist } from "~/components/icons/menu/checklist"
import { Landing } from "~/components/icons/menu/landing"
import { Share } from "~/components/icons/menu/share"
import { StepDone } from "~/components/icons/menu/stepdone"
import { Stripe } from "~/components/icons/menu/stripe"
import { User } from "~/components/icons/menu/user"
import { db } from "~/utils/db.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const { user, org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Error("Org not found")
  const servicesCount = await db.service.count({
    where: {
      orgId: org.id,
    },
  })
  url.pathname = `/${org.slug}/agenda`

  const hasPaymentsConfigured = Boolean(user.mercadopago?.access_token)

  return { url: url.toString(), org, servicesCount, hasPaymentsConfigured }
}

export default function DashOnboarding() {
  const { servicesCount, url, hasPaymentsConfigured } =
    useLoaderData<typeof loader>()
  const [pop, setPop] = useState(false)
  const [shareLink, setShareLink] = useState("0")
  const [sitioWebDone, setSitioWeb] = useState("0")
  const navigate = useNavigate()

  // Calculate progress
  const getCompletedCount = () => {
    let count = 1 // Step 1 (account) is always done
    if (sitioWebDone === "1") count++
    if (hasPaymentsConfigured) count++
    if (servicesCount >= 1) count++
    if (shareLink === "1") count++
    return count
  }

  const handleSitioWeb = () => {
    localStorage.setItem("sitioWebDone", "1")
    navigate(new URL(url).pathname)
  }

  const handleCopyURL = () => {
    navigator.clipboard.writeText(url)
    setPop(true)
    setTimeout(() => setPop(false), 1000)
    localStorage.setItem("shareLink", "1")
    setShareLink("1")
  }

  useEffect(() => {
    const sitioW = localStorage.getItem("sitioWebDone")
    const shareL = localStorage.getItem("shareLink")
    if (sitioW === "1") {
      setSitioWeb(sitioW)
    }
    if (shareL) {
      setShareLink(shareL)
    }
  }, [])

  return (
    <main className="max-w-7xl mx-auto pt-6 md:pt-28 px-4 md:px-0">
      <div className="max-w-2xl mx-auto bg-white p-5 md:p-8 rounded-2xl border-[#EFEFEF]">
        <div>
          <h3 className="text-xl md:text-2xl font-satoBold">
            ¡Ya casi terminas de configurar tu agenda!
          </h3>
          <p className="text-brand_gray mt-1 text-sm md:text-base">
            Estás a unos pasos de empezar a recibir a tus clientes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <p className="text-sm text-brand_gray">
            {getCompletedCount()} de 5 pasos completados
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={twMerge(
                  "flex-1 sm:flex-none sm:w-8 h-2 rounded-full",
                  step <= getCompletedCount() ? "bg-brand_blue" : "bg-gray-200",
                )}
              />
            ))}
          </div>
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
            }
          />
          <Step
            icon={<Stripe />}
            title="Configura tus pagos (opcional)"
            description="Conecta Mercado Pago para cobrar"
            cta={
              <AnimatePresence>
                {!hasPaymentsConfigured ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <PrimaryButton as="Link" to="/dash/ventas" className="h-10">
                      Configurar
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
          />
          <Step
            icon={<Checklist />}
            title="Crea tu primer servicio"
            description="Agrega uno o todos tus servicios "
            cta={
              <AnimatePresence>
                {servicesCount < 1 ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <PrimaryButton
                      as="Link"
                      to="/dash/servicios"
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
                    "bg-brand_dark text-white text-xs min-w-fit p-2 rounded-lg absolute right-0",
                    pop ? "block" : "hidden",
                  )}
                >
                  Copiado ✅
                </p>
              </>
            }
          />
        </div>
      </div>
      <div className="max-w-2xl mx-auto items-center bg-white px-5 md:px-8 py-4 md:py-6 mt-6 rounded-2xl border-[#EFEFEF] flex justify-between overflow-hidden gap-4">
        <p className="text-sm md:text-base">
          ¿Tienes alguna duda? Escríbenos a{" "}
          <a href="mailto:hola@denik.me" className="text-brand_blue underline">
            hola@denik.me
          </a>{" "}
        </p>
        <img
          className="w-20 h-20 md:w-[140px] md:h-[140px] shrink-0"
          src="/images/chat.gif"
          alt="dancer"
        />
      </div>
    </main>
  )
}

const StepCheck = () => {
  return (
    <section className="w-auto sm:w-[120px] flex justify-center shrink-0">
      <StepDone />
    </section>
  )
}

const Step = ({
  icon,
  title,
  description,
  cta,
  isDone,
  onClick,
}: {
  isDone?: boolean
  onClick?: () => void
  icon?: ReactNode
  title: string
  description: string
  cta?: ReactNode
}) => {
  return (
    <section className="flex justify-between items-center gap-3">
      <div className="flex gap-3 md:gap-4 items-center min-w-0 flex-1">
        <div className="bg-[#F9F9FB] w-12 h-12 md:w-16 md:h-14 flex justify-center items-center rounded shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-satoMiddle text-sm md:text-base">{title}</p>
          <p className="text-brand_gray text-xs md:text-base">{description}</p>
        </div>
      </div>
      <div className="shrink-0 relative">{cta}</div>
    </section>
  )
}
