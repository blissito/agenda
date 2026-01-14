import { useState } from "react";
import {
  Calendar,
  useCalendarControls,
  type CalendarEvent,
} from "@hectorbliss/denik-calendar";

// Generar eventos de ejemplo para simular partidos de pádel
const generateDemoEvents = (): CalendarEvent[] => {
  const baseDate = new Date();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - baseDate.getDay() + 1);

  const events: CalendarEvent[] = [];
  const titles = [
    "4ta femenil - Femenil",
    "Suma 3 - Varonil - Oct",
    "Mixtos B - Mixta - Cuartos",
    "Suma 3 - Varonil - Cuartos",
  ];

  // Viernes eventos
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  events.push({
    id: "1",
    title: "4ta femenil - Femenil",
    start: new Date(friday.setHours(8, 0, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "2",
    title: "Suma 3 - Varonil - Oct",
    start: new Date(new Date(friday).setHours(9, 0, 0, 0)),
    duration: 120,
  });

  events.push({
    id: "3",
    title: "Suma 3 - Varonil - Oct",
    start: new Date(new Date(friday).setHours(10, 30, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "4",
    title: "4ta femenil - Fem",
    start: new Date(new Date(friday).setHours(11, 30, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "5",
    title: "Suma 3 - Varonil - Cua",
    start: new Date(new Date(friday).setHours(14, 0, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "6",
    title: "Suma 3 - Varonil - Cua",
    start: new Date(new Date(friday).setHours(16, 0, 0, 0)),
    duration: 90,
  });

  // Sábado eventos (overlaps!)
  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  events.push({
    id: "7",
    title: "Suma 3 - Varonil - Oct",
    start: new Date(saturday.setHours(8, 30, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "8",
    title: "Suma 3 - Varonil",
    start: new Date(new Date(saturday).setHours(10, 45, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "9",
    title: "Mixtos B - Mixta",
    start: new Date(new Date(saturday).setHours(10, 45, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "10",
    title: "4ta femenil - Fem",
    start: new Date(new Date(saturday).setHours(11, 30, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "11",
    title: "Suma 3 - Varonil - Cua",
    start: new Date(new Date(saturday).setHours(15, 0, 0, 0)),
    duration: 90,
  });

  // Domingo eventos
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  events.push({
    id: "12",
    title: "4ta femenil - Femenil",
    start: new Date(sunday.setHours(8, 0, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "13",
    title: "Mixtos B - Mixta - Cua",
    start: new Date(new Date(sunday).setHours(10, 45, 0, 0)),
    duration: 90,
  });

  // Miércoles
  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);

  events.push({
    id: "14",
    title: "Suma 3 - Varonil - Oct",
    start: new Date(wednesday.setHours(9, 30, 0, 0)),
    duration: 90,
  });

  // Jueves con overlap
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);

  events.push({
    id: "15",
    title: "Suma 3 - Varonil - Oct",
    start: new Date(thursday.setHours(10, 30, 0, 0)),
    duration: 90,
  });

  events.push({
    id: "16",
    title: "4ta femenil - Fem",
    start: new Date(new Date(thursday).setHours(11, 30, 0, 0)),
    duration: 90,
  });

  return events;
};

// Avatars placeholder
const Avatars = () => (
  <div className="flex -space-x-1 mt-1">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="w-5 h-5 rounded-full bg-yellow-200 border border-white flex items-center justify-center text-[8px]"
      >
        😊
      </div>
    ))}
  </div>
);

export default function SmatchDemo() {
  const controls = useCalendarControls({ locale: "es-MX" });
  const [events] = useState(generateDemoEvents);

  const handleEventClick = (event: CalendarEvent) => {
    alert(`Clicked: ${event.title}`);
  };

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
          Torneo {">"} Estructura del torneo {">"} <span className="text-gray-900">Partidos</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={controls.goToToday}
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                controls.isToday
                  ? "bg-gray-200 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              HOY
            </button>
            <button
              onClick={controls.goToPrev}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={controls.goToNext}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-lg font-medium capitalize ml-2">
              {controls.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={controls.view}
              onChange={() => controls.toggleView()}
              className="px-4 py-2 border rounded-lg bg-white text-sm font-medium"
            >
              <option value="week">SEMANA</option>
              <option value="day">DÍA</option>
            </select>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
              AGREGAR PARTIDO
            </button>
          </div>
        </div>

        {/* Calendar */}
        <Calendar
          date={controls.date}
          events={events}
          onEventClick={handleEventClick}
          config={{
            locale: "es-MX",
          }}
        />
      </div>
    </div>
  );
}
