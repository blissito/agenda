# denik-calendar

A **React** drag-and-drop week calendar component with overlap detection.

Built with [@dnd-kit](https://dndkit.com/) for smooth drag interactions.

## Installation

```bash
npm install @hectorbliss/denik-calendar
```

## Usage

```tsx
import { Calendar } from "@hectorbliss/denik-calendar";

function App() {
  const [events, setEvents] = useState([
    { id: "1", start: new Date(), duration: 60, title: "Meeting" },
  ]);

  return (
    <Calendar
      events={events}
      onEventMove={(eventId, newStart) => {
        setEvents(prev =>
          prev.map(e => (e.id === eventId ? { ...e, start: newStart } : e))
        );
      }}
      onAddBlock={(start) => {
        // Handle block creation
      }}
      onRemoveBlock={(eventId) => {
        // Handle block removal
      }}
      onEventClick={(event) => {
        // Handle event click
      }}
    />
  );
}
```

## Resource Mode (Day View)

Display resources (courts, rooms, employees) as columns instead of weekdays:

```tsx
import { Calendar, useCalendarControls } from "@hectorbliss/denik-calendar";

const courts = [
  { id: "court-1", name: "Cancha 1", icon: <PadelIcon /> },
  { id: "court-2", name: "Cancha 2", icon: <PadelIcon /> },
  { id: "court-3", name: "Cancha 3", icon: <TennisIcon /> },
  { id: "court-4", name: "Cancha 4", icon: <TennisIcon /> },
];

// Events with resourceId
const events = [
  { id: "1", start: new Date(), duration: 90, title: "Match", resourceId: "court-1" },
  { id: "2", start: new Date(), duration: 60, title: "Training", resourceId: "court-2" },
];

function CourtSchedule() {
  return (
    <Calendar
      events={events}
      date={selectedDay}
      resources={courts}
    />
  );
}
```

## Navigation Controls

Use the headless hook for complete control:

```tsx
import { Calendar, useCalendarControls, CalendarControls } from "@hectorbliss/denik-calendar";

function App() {
  const controls = useCalendarControls();

  return (
    <>
      {/* Pre-built controls */}
      <CalendarControls controls={controls} />

      {/* Or build your own */}
      <div>
        <button onClick={controls.goToToday}>HOY</button>
        <button onClick={controls.goToPrev}>←</button>
        <button onClick={controls.goToNext}>→</button>
        <span>{controls.label}</span>
        <button onClick={controls.toggleView}>
          {controls.view === "week" ? "DÍA" : "SEMANA"}
        </button>
      </div>

      <Calendar
        date={controls.date}
        events={events}
        resources={controls.view === "day" ? courts : undefined}
      />
    </>
  );
}
```

## Visual Overlaps

Events at the same time are displayed side-by-side automatically.

## Headless Hooks

### useCalendarEvents

```tsx
import { useCalendarEvents } from "@hectorbliss/denik-calendar";

const {
  canMove,           // Check if event can move to new time
  hasOverlap,        // Check if time slot has conflicts
  findConflicts,     // Get all conflicting events
  getEventsForDay,   // Filter events by day
  getEventsForWeek,  // Filter events by week
  findAvailableSlots // Get available time slots
} = useCalendarEvents(events);
```

### useCalendarControls

```tsx
import { useCalendarControls } from "@hectorbliss/denik-calendar";

const {
  date,        // Current date
  view,        // "week" | "day"
  week,        // Array of 7 dates (Mon-Sun)
  label,       // Formatted date label
  isToday,     // Boolean
  goToToday,   // Navigate to today
  goToPrev,    // Navigate back (7 days or 1 day)
  goToNext,    // Navigate forward
  toggleView,  // Switch between week/day
  setDate,     // Set specific date
  setView,     // Set specific view
} = useCalendarControls({ locale: "es-MX" });
```

## Props

### Calendar

| Prop | Type | Description |
|------|------|-------------|
| `events` | `CalendarEvent[]` | Array of events |
| `date` | `Date` | Current date (default: today) |
| `resources` | `Resource[]` | Resources for day view mode |
| `onEventMove` | `(eventId, newStart) => void` | Drag handler |
| `onAddBlock` | `(start) => void` | Block creation |
| `onRemoveBlock` | `(eventId) => void` | Block removal |
| `onEventClick` | `(event) => void` | Click handler |
| `onNewEvent` | `(start) => void` | Empty slot click |
| `config` | `CalendarConfig` | Configuration |

### Types

```typescript
interface CalendarEvent {
  id: string;
  start: Date;
  duration: number;      // minutes
  title?: string;
  type?: "BLOCK" | "EVENT";
  resourceId?: string;   // For resource mode
  service?: { name: string };
}

interface Resource {
  id: string;
  name: string;
  icon?: ReactNode;
}

interface CalendarConfig {
  locale?: string;
  icons?: { trash?, edit?, close? };
  renderColumnHeader?: (props: ColumnHeaderProps) => ReactNode;
}

interface ColumnHeaderProps {
  date: Date;
  index: number;
  isToday: boolean;
  locale: string;
  resource?: Resource;
}
```

## Features

- Drag & drop events
- Visual overlap rendering
- Resource/day view mode
- Week view mode
- Navigation controls (hook + component)
- Block time slots
- Auto-scroll to current hour
- Custom column headers
- Horizontal scroll for many resources
- Customizable icons
- Locale support
- TypeScript support

## Peer Dependencies

- React 18+ or 19+

## Author

Made by [@blissito](https://github.com/blissito)

Learn React & web development at [fixtergeek.com](https://fixtergeek.com)

## License

MIT
