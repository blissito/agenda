// dash.lealtad.tsx
import { useState } from "react"
import { useLoaderData, useRevalidator, useSearchParams } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import {
  getOrgLoyaltyStats,
  getAllRewards,
  getTransactions,
  getLevels,
} from "~/lib/loyalty.server"
import { db } from "~/utils/db.server"
import type { Route } from "./+types/dash.lealtad"
import {
  EmptyStateLoyalty,
  CreateLevelWizard,
  TabButton,
  NivelesTab,
  DescuentosTab,
  FilterAdjustIcon,
} from "~/components/loyalty/loyaltyStep"
import { PrimaryButton } from "~/components/common/primaryButton"

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

export type Transaction = {
  id: string
  type: string
  points: number
  balance: number
  reason: string
  customer: { displayName: string; email: string }
}

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

  const [stats, levels, rewards, transactions] = await Promise.all([
    getOrgLoyaltyStats(org.id),
    getLevels(org.id),
    getAllRewards(org.id),
    getTransactions({ orgId: org.id, limit: 20 }),
  ])

  return {
    enabled: true as const,
    stats,
    levels,
    rewards,
    transactions,
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false)

  if (!data.enabled) {
    return (
      <main>
        <RouteTitle>Lealtad</RouteTitle>

        <EmptyStateLoyalty onStart={() => setIsCreateWizardOpen(true)} />

        {isCreateWizardOpen && (
          <CreateLevelWizard
            services={data.services}
            isOrgEnabled={false}
            onClose={() => setIsCreateWizardOpen(false)}
            onCreated={() => {
              revalidator.revalidate()
            }}
          />
        )}
      </main>
    )
  }

  const { levels, rewards, transactions, services } = data
  const activeTab =
    searchParams.get("tab") === "descuentos" ? "descuentos" : "niveles"

  const changeTab = (tab: "niveles" | "descuentos") => {
    const next = new URLSearchParams(searchParams)
    next.set("tab", tab)
    setSearchParams(next)
  }

  return (
    <main className="px-6 py-4">
      <RouteTitle>Lealtad</RouteTitle>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <TabButton
            label="Niveles"
            active={activeTab === "niveles"}
            onClick={() => changeTab("niveles")}
          />
          <TabButton
            label="Descuentos"
            active={activeTab === "descuentos"}
            onClick={() => changeTab("descuentos")}
          />
        </div>

        {activeTab === "niveles" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Filtros"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6B7280] shadow-sm ring-1 ring-[#E5E7EB]"
            >
              <FilterAdjustIcon />
            </button>

            <PrimaryButton
              type="button"
              onClick={() => setIsCreateWizardOpen(true)}
              className="h-10 px-5 text-sm"
            >
              + Agregar nivel
            </PrimaryButton>
          </div>
        )}
      </div>

      <div className="mt-6">
        {activeTab === "niveles" ? (
          <NivelesTab
            levels={levels}
            services={services}
            onCreateClick={() => setIsCreateWizardOpen(true)}
          />
        ) : (
          <DescuentosTab rewards={rewards} transactions={transactions} />
        )}
      </div>

      {isCreateWizardOpen && (
        <CreateLevelWizard
          services={services}
          isOrgEnabled
          onClose={() => setIsCreateWizardOpen(false)}
          onCreated={() => {
            revalidator.revalidate()
          }}
        />
      )}
    </main>
  )
} 