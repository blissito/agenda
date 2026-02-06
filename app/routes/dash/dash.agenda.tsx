import {
  type CalendarEvent,
  completeWeek,
  Calendar as SimpleBigWeekView,
} from "@hectorbliss/denik-calendar"
import { type Event as PrismaEvent } from "@prisma/client"
import { useEffect, useMemo, useState } from "react"
import { useFetcher, useNavigate } from "react-router"
import { getUserAndOrgOrRedirect } from "~/.server/userGetters"
import { Spinner } from "~/components/common/Spinner"
import { WeekSelector } from "~/components/dash/agenda/WeekSelector"
import { ClientFormDrawer } from "~/components/forms/ClientFormDrawer"
import { EventFormDrawer } from "~/components/forms/EventFormDrawer"
import { RouteTitle } from "~/components/sideBar/routeTitle"
import { db } from "~/utils/db.server"
import { newEventSchema } from "~/utils/zod_schemas"
import type { Route } from "./+types/dash.agenda"

type EventWithService = PrismaEvent & {
  service: { name: string } | null
}

type OptimisticOp =
  | { type: "add"; event: EventWithService }
  | { type: "remove"; eventId: string }
  | { type: "move"; eventId: string; newStart: Date }

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "add_event") {
    const { org, user } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    const validData = newEventSchema.parse(
      JSON.parse(formData.get("data") as string),
    )

    await db.event.create({
      data: {
        ...validData,
        orgId: org.id,
        userId: user.id,
        title: "Nuevo evento",
        allDay: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "pending",
        type: "EVENT",
      },
    })
  }

  if (intent === "remove_block") {
    const id = formData.get("eventId") as string
    const block = await db.event.findUnique({ where: { id } })
    if (block?.type === "BLOCK") {
      await db.event.delete({ where: { id } })
    }
  }

  if (intent === "add_block") {
    const start = formData.get("start") as string
    const d = new Date(start)
    d.setMinutes(0)
    const { org, user } = await getUserAndOrgOrRedirect(request)
    if (!org) {
      return Response.json({ error: "Organization not found" }, { status: 404 })
    }
    await db.event.create({
      data: {
        type: "BLOCK",
        start: d,
        orgId: org.id,
        userId: user.id,
        allDay: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "confirmed",
        title: "Bloqueo",
        paid: false,
        duration: 60,
      },
    })
    return { success: true }
  }

  if (intent === "move_event") {
    const eventId = formData.get("eventId") as string
    const newStart = formData.get("newStart") as string

    await db.event.update({
      where: { id: eventId },
      data: { start: new Date(newStart) },
    })

    return { success: true }
  }

  return null
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { org } = await getUserAndOrgOrRedirect(request, {
    redirectURL: "/signup/1",
  })
  if (!org) {
    throw new Response("Organization not found", { status: 404 })
  }

  const url = new URL(request.url)
  const mondayParam = url.searchParams.get("monday")
  const sundayParam = url.searchParams.get("sunday")

  let monday: Date
  let sunday: Date

  if (mondayParam && sundayParam) {
    monday = new Date(mondayParam)
    sunday = new Date(sundayParam)
  } else {
    const week = completeWeek(new Date())
    monday = week[0]
    sunday = week[6]
  }

  // Set sunday to end of day to include all events on sunday
  const sundayEnd = new Date(sunday)
  sundayEnd.setHours(23, 59, 59, 999)

  const events = await db.event.findMany({
    where: {
      orgId: org.id,
      archived: false,
      start: {
        gte: monday,
        lte: sundayEnd,
      },
    },
    include: { service: true },
  })

  const customers = await db.customer.findMany({
    take: 1,
    where: { orgId: org.id },
  })

  const employees = await db.user.findMany({
    take: 1,
    where: { orgId: org.id },
  })

  const services = await db.service.findMany({
    take: 1,
    where: { orgId: org.id },
  })

  return {
    events,
    customers,
    services,
    employees,
    monday: monday.toISOString(),
    sunday: sunday.toISOString(),
  }
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { events, customers, services, employees, monday } = loaderData
  const navigate = useNavigate()
  const mutationFetcher = useFetcher()
  const [editableEvent, setEditableEvent] =
    useState<Partial<PrismaEvent> | null>(null)
  const [optimisticOps, setOptimisticOps] = useState<OptimisticOp[]>([])

  // Derive week from loader's monday
  const week = useMemo(() => completeWeek(new Date(monday)), [monday])

  // Clear optimistic ops when mutation completes (loader revalidates automatically)
  useEffect(() => {
    if (mutationFetcher.state === "idle") {
      setOptimisticOps([])
    }
  }, [mutationFetcher.state])

  // Apply optimistic operations on top of loader data
  const displayEvents = useMemo(() => {
    let result = [...events] as EventWithService[]
    for (const op of optimisticOps) {
      if (op.type === "add") result.push(op.event)
      if (op.type === "remove") result = result.filter((e) => e.id !== op.eventId)
      if (op.type === "move")
        result = result.map((e) =>
          e.id === op.eventId ? { ...e, start: op.newStart } : e,
        )
    }
    return result
  }, [events, optimisticOps])

  // Map to CalendarEvent format
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      displayEvents.map((e) => ({
        id: e.id,
        start: new Date(e.start),
        duration: Number(e.duration),
        title: e.title,
        type: e.type as "BLOCK" | "EVENT",
        service: e.service ? { name: e.service.name } : null,
      })),
    [displayEvents],
  )

  const handleWeekNavigation = (direction: -1 | 1) => {
    let d
    if (direction < 0) {
      d = new Date(week[0])
      d.setDate(d.getDate() - 2)
    } else {
      d = new Date(week[week.length - 1])
      d.setDate(d.getDate() + 1)
    }
    const w = completeWeek(d)
    navigate(
      `/dash/agenda?monday=${w[0].toISOString()}&sunday=${w[6].toISOString()}`,
    )
  }

  const handleEventClick = (event: CalendarEvent) => {
    const fullEvent = displayEvents.find((e) => e.id === event.id)
    if (fullEvent) {
      setEditableEvent(fullEvent)
    }
  }

  const handleNewEvent = (date: Date) => {
    setEditableEvent({ start: date })
  }

  const handleEventMove = (eventId: string, newStart: Date) => {
    setOptimisticOps((prev) => [...prev, { type: "move", eventId, newStart }])
    mutationFetcher.submit(
      { intent: "move_event", eventId, newStart: newStart.toISOString() },
      { method: "POST" },
    )
  }

  const handleAddBlock = (start: Date) => {
    const tempBlock = {
      id: `temp-${Date.now()}`,
      start,
      duration: BigInt(60),
      type: "BLOCK",
      title: "Bloqueo",
      status: "confirmed",
      allDay: false,
      archived: false,
      paid: false,
      orgId: "",
      userId: "",
      serviceId: null,
      customerId: null,
      employeeId: null,
      end: null,
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      mp_preference_id: null,
      mp_payment_id: null,
      payment_method: null,
      notes: null,
      reminderSentAt: null,
      surveySentAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      service: null,
    } as EventWithService
    setOptimisticOps((prev) => [...prev, { type: "add", event: tempBlock }])
    mutationFetcher.submit(
      { intent: "add_block", start: start.toISOString() },
      { method: "POST" },
    )
  }

  const handleRemoveBlock = (eventId: string) => {
    setOptimisticOps((prev) => [...prev, { type: "remove", eventId }])
    mutationFetcher.submit({ intent: "remove_block", eventId }, { method: "POST" })
  }

  const [showNewClientDrawer, setShowNewClientDrawer] = useState(false)
  const handleNewClientClick = () => {
    setShowNewClientDrawer(true)
  }

  return (
    <>
      <RouteTitle>Mi agenda {week[0].getFullYear()}</RouteTitle>
      {mutationFetcher.state !== "idle" && <Spinner />}
      <WeekSelector onClick={handleWeekNavigation} week={week} />
      <SimpleBigWeekView
        onNewEvent={handleNewEvent}
        events={calendarEvents}
        date={week[0] as Date}
        onEventClick={handleEventClick}
        onEventMove={handleEventMove}
        onAddBlock={handleAddBlock}
        onRemoveBlock={handleRemoveBlock}
      />
      <EventFormDrawer
        services={services}
        employees={employees}
        customers={customers}
        onClose={() => setEditableEvent(null)}
        event={editableEvent as PrismaEvent}
        isOpen={!!editableEvent}
        onNewClientClick={handleNewClientClick}
      />
      <ClientFormDrawer
        onClose={() => setShowNewClientDrawer(false)}
        isOpen={showNewClientDrawer}
      />
    </>
  )
}
