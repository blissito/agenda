// dash.lealtad.tsx
import { useState } from "react"
import {
  useFetcher,
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { PrimaryButton } from "~/components/common/primaryButton"
import { CuponesTab } from "~/components/loyalty/loyaltycupones"
import {
  CreateLevelWizard,
  EmptyStateLoyalty,
  NivelesTab,
  TabButton,
} from "~/components/loyalty/loyaltyStep"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import {
  getAllRewards,
  getLevels,
  getOrgLoyaltyStats,
} from "~/lib/loyalty.server"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.lealtad"

// ==================== TYPES ====================

export type Level = {
  id: string
  name: string
  image: string | null
  minPoints: number
  discountPercent: number
  serviceIds: string[]
}

export type Reward = {
  id: string
  name: string
  description: string | null
  type: string
  value: number
  pointsCost: number
  maxRedemptions: number | null
  currentRedemptions: number
  isActive: boolean
}

export type ServiceOption = { id: string; name: string }

// ==================== LOADER / ACTION ====================

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const orgData = await db.org.findUnique({
    where: { id: org.id },
    select: { loyaltyEnabled: true },
  })

  const services = await db.service.findMany({
    where: { orgId: org.id, archived: false },
    select: { id: true, name: true },
  })

  if (!orgData?.loyaltyEnabled) {
    return {
      enabled: false as const,
      services,
    }
  }

  const [stats, levels, rewards] = await Promise.all([
    getOrgLoyaltyStats(org.id),
    getLevels(org.id),
    getAllRewards(org.id),
  ])

  return {
    enabled: true as const,
    stats,
    levels,
    rewards,
    services,
  }
}

export const action = async ({ request }: Route.ActionArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request)
  if (!org) throw new Response("Org not found", { status: 404 })

  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "enable-loyalty") {
    await db.org.update({
      where: { id: org.id },
      data: { loyaltyEnabled: true },
    })
    return { success: true }
  }

  return { error: "Unknown intent" }
}

// ==================== COMPONENT ====================

export default function Lealtad() {
  const data = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()
  const enableFetcher = useFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false)
  const [isCreateCouponOpen, setIsCreateCouponOpen] = useState(false)

  if (!data.enabled) {
    const isEnabling = enableFetcher.state !== "idle"
    return (
      <main className="max-w-8xl mx-auto">
        <RouteTitle className="text-2xl md:text-3xl mb-4 md:mb-8">
          Lealtad
        </RouteTitle>

        <EmptyStateLoyalty
          isLoading={isEnabling}
          onStart={() =>
            enableFetcher.submit(
              { intent: "enable-loyalty" },
              { method: "post" },
            )
          }
        />
      </main>
    )
  }

  const { levels, rewards, services } = data

  const currentTabParam = searchParams.get("tab")
  const activeTab =
    currentTabParam === "cupones" || currentTabParam === "descuentos"
      ? "cupones"
      : "niveles"

  const changeTab = (tab: "niveles" | "cupones") => {
    const next = new URLSearchParams(searchParams)
    next.set("tab", tab)
    setSearchParams(next)
  }

  return (
    <main className="max-w-8xl mx-auto">
      <RouteTitle className="text-2xl md:text-3xl mb-4 md:mb-8">
        Lealtad
      </RouteTitle>

      <div className="mt-4 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <TabButton
            label="Niveles"
            active={activeTab === "niveles"}
            onClick={() => changeTab("niveles")}
          />
          <TabButton
            label="Cupones"
            active={activeTab === "cupones"}
            onClick={() => changeTab("cupones")}
          />
        </div>

        {activeTab === "niveles" && levels.length > 0 && (
          <div className="flex items-center gap-3">
            <PrimaryButton
              type="button"
              onClick={() => setIsCreateWizardOpen(true)}
              className="h-10 px-5 text-sm"
            >
              + Agregar nivel
            </PrimaryButton>
          </div>
        )}
        {activeTab === "cupones" && rewards.length > 0 && (
          <div className="flex items-center gap-3">
            <PrimaryButton
              type="button"
              onClick={() => setIsCreateCouponOpen(true)}
              className="h-10 px-5 text-sm"
            >
              + Agregar cupón
            </PrimaryButton>
          </div>
        )}
      </div>

      <div className="mt-4 md:mt-6">
        {activeTab === "niveles" ? (
          <NivelesTab
            levels={levels}
            services={services}
            onCreateClick={() => setIsCreateWizardOpen(true)}
            isCreateOpen={isCreateWizardOpen}
          />
        ) : (
          <CuponesTab
            rewards={rewards}
            services={services}
            isCreateOpen={isCreateCouponOpen}
            onOpenCreate={() => setIsCreateCouponOpen(true)}
            onCloseCreate={() => {
              setIsCreateCouponOpen(false)
              revalidator.revalidate()
            }}
          />
        )}
      </div>

      {isCreateWizardOpen && (
        <CreateLevelWizard
          services={services}
          isOrgEnabled
          onClose={() => {
            setIsCreateWizardOpen(false)
            revalidator.revalidate()
          }}
          onCreated={() => {}}
        />
      )}
    </main>
  )
}
