import {
  Calendar,
  CalendarControls,
  type CalendarEvent,
  type EventParticipant,
  type Resource,
  useCalendarControls,
} from "@hectorbliss/denik-calendar"
import { useState } from "react"

// Iconos de canchas de pádel
const CourtIcon = ({ color = "#22c55e" }: { color?: string }) => (
  <div
    className="w-10 h-10 rounded-full flex items-center justify-center"
    style={{ backgroundColor: `${color}20` }}
  >
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill={color}>
      <circle cx="12" cy="6" r="2" />
      <circle cx="8" cy="10" r="2" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="12" cy="14" r="2" />
    </svg>
  </div>
)

// Resources (Canchas) - 8 canchas para mostrar scroll horizontal
const courts: Resource[] = [
  { id: "cancha-1", name: "Cancha 1", icon: <CourtIcon color="#22c55e" /> },
  { id: "cancha-2", name: "Cancha 2", icon: <CourtIcon color="#3b82f6" /> },
  { id: "cancha-3", name: "Cancha 3", icon: <CourtIcon color="#f59e0b" /> },
  { id: "cancha-4", name: "Cancha 4", icon: <CourtIcon color="#f97316" /> },
  { id: "cancha-5", name: "Cancha 5", icon: <CourtIcon color="#8b5cf6" /> },
  { id: "cancha-6", name: "Cancha 6", icon: <CourtIcon color="#ec4899" /> },
  { id: "cancha-7", name: "Cancha 7", icon: <CourtIcon color="#14b8a6" /> },
  { id: "cancha-8", name: "Cancha 8", icon: <CourtIcon color="#ef4444" /> },
]

// Participantes de ejemplo
const demoParticipants: EventParticipant[] = [
  { id: "p1", name: "Ana García", avatarColor: "bg-yellow-200" },
  { id: "p2", name: "María López", avatarColor: "bg-pink-200" },
  { id: "p3", name: "Laura Sánchez", avatarColor: "bg-blue-200" },
  { id: "p4", name: "Sofía Martínez", avatarColor: "bg-green-200" },
]

const maleParticipants: EventParticipant[] = [
  { id: "m1", name: "Carlos Ruiz", avatarColor: "bg-orange-200" },
  { id: "m2", name: "Pedro Gómez", avatarColor: "bg-purple-200" },
  { id: "m3", name: "Juan Díaz", avatarColor: "bg-teal-200" },
  { id: "m4", name: "Miguel Torres", avatarColor: "bg-red-200" },
]

const mixedParticipants: EventParticipant[] = [
  { id: "x1", name: "Ana García", avatarColor: "bg-yellow-200" },
  { id: "x2", name: "Carlos Ruiz", avatarColor: "bg-orange-200" },
  { id: "x3", name: "María López", avatarColor: "bg-pink-200" },
  { id: "x4", name: "Pedro Gómez", avatarColor: "bg-purple-200" },
]

// Generar eventos de ejemplo para simular partidos de pádel (como en el screenshot)
const generateDemoEvents = (): CalendarEvent[] => {
  // Usamos la fecha actual para el demo
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const events: CalendarEvent[] = []

  // Cancha 1 - eventos verdes
  events.push({
    id: "1",
    title: "Suma 3 - Varonil",
    service: { name: "Fase de grupos" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      0,
    ),
    duration: 90,
    color: "green",
    participants: maleParticipants,
    resourceId: "cancha-1",
  })

  // Cancha 2 - eventos azules
  events.push({
    id: "2",
    title: "4ta femenil - Femenil",
    service: { name: "Semifinal" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      11,
      30,
    ),
    duration: 90,
    color: "blue",
    participants: demoParticipants,
    resourceId: "cancha-2",
  })

  // Cancha 3 - eventos amarillos/dorados
  events.push({
    id: "3",
    title: "Suma 3 - Varonil",
    service: { name: "Octavos de final" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      30,
    ),
    duration: 90,
    color: "yellow",
    participants: maleParticipants,
    resourceId: "cancha-3",
  })

  events.push({
    id: "4",
    title: "Suma 3 - Varonil",
    service: { name: "Cuartos de final" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      16,
      0,
    ),
    duration: 90,
    color: "yellow",
    participants: maleParticipants,
    resourceId: "cancha-3",
  })

  // Cancha 4 - eventos naranjas
  events.push({
    id: "5",
    title: "4to femenil - Femenil",
    service: { name: "Final" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      8,
      0,
    ),
    duration: 90,
    color: "orange",
    participants: demoParticipants,
    resourceId: "cancha-4",
  })

  events.push({
    id: "6",
    title: "Mixtos B - Mixta",
    service: { name: "Cuartos de final" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      45,
    ),
    duration: 90,
    color: "orange",
    participants: mixedParticipants,
    resourceId: "cancha-4",
  })

  // Evento placeholder gris en Cancha 4
  events.push({
    id: "7",
    title: "",
    type: "BLOCK",
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      15,
      0,
    ),
    duration: 60,
    resourceId: "cancha-4",
  })

  // Cancha 5 - eventos morados
  events.push({
    id: "8",
    title: "3ra Mixta - Mixta",
    service: { name: "Semifinal" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      9,
      0,
    ),
    duration: 90,
    color: "purple",
    participants: mixedParticipants,
    resourceId: "cancha-5",
  })

  // Cancha 6 - eventos rosas
  events.push({
    id: "9",
    title: "2da femenil - Femenil",
    service: { name: "Final" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      11,
      0,
    ),
    duration: 120,
    color: "pink",
    participants: demoParticipants,
    resourceId: "cancha-6",
  })

  // Cancha 7 - eventos teal
  events.push({
    id: "10",
    title: "1ra Varonil - Varonil",
    service: { name: "Cuartos" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      14,
      0,
    ),
    duration: 90,
    color: "#14b8a6",
    participants: maleParticipants,
    resourceId: "cancha-7",
  })

  // Cancha 8 - eventos rojos
  events.push({
    id: "11",
    title: "Open - Libre",
    service: { name: "Exhibición" },
    start: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      10,
      0,
    ),
    duration: 60,
    color: "red",
    participants: [
      ...maleParticipants.slice(0, 2),
      ...demoParticipants.slice(0, 2),
    ],
    resourceId: "cancha-8",
  })

  return events
}

export default function SmatchDemo() {
  const controls = useCalendarControls({ locale: "es-MX", initialView: "day" })
  const [events] = useState(generateDemoEvents)

  const handleEventClick = (event: CalendarEvent) => {
    alert(`Clicked: ${event.title}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">⚡ SMATCH</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Alejandro Ocegueda</span>
            <div className="w-10 h-10 rounded-full bg-blue-500" />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          Torneo {">"} Estructura del torneo {">"}{" "}
          <span className="text-gray-900">Partidos</span>
        </div>

        {/* Controls - using CalendarControls component */}
        <CalendarControls
          controls={controls}
          className="bg-white rounded-xl px-4 mb-4 shadow-sm"
          showExport
          onExport={() => alert("Exportar calendario")}
          showAdd
          addLabel="AGREGAR PARTIDO"
          onAdd={() => alert("Agregar partido")}
        />

        {/* Calendar */}
        <Calendar
          date={controls.date}
          events={events}
          resources={controls.view === "day" ? courts : undefined}
          onEventClick={handleEventClick}
          config={{
            locale: "es-MX",
            hoursStart: 8,
            hoursEnd: 18,
            eventTime: {
              enabled: true,
              format: "12h",
            },
            participants: {
              maxVisible: 4,
              size: 20,
            },
          }}
        />
      </div>
    </div>
  )
}
