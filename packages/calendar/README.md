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
        // Handle event move
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

## Headless Hook

Use the overlap detection logic without the UI:

```tsx
import { useEventOverlap } from "@hectorbliss/denik-calendar";

function MyCustomCalendar({ events }) {
  const { canMove, hasOverlap, findConflicts } = useEventOverlap(events);

  const handleDrop = (eventId, newStart) => {
    if (canMove(eventId, newStart)) {
      // Safe to move
      updateEvent(eventId, newStart);
    } else {
      // Conflict detected
      toast.error("Time slot occupied");
    }
  };
}
```

## Props

### Calendar

| Prop | Type | Description |
|------|------|-------------|
| `events` | `CalendarEvent[]` | Array of events to display |
| `date` | `Date` | Current week to display (default: today) |
| `onEventMove` | `(eventId, newStart) => void` | Called when event is dragged |
| `onAddBlock` | `(start) => void` | Called when creating a block |
| `onRemoveBlock` | `(eventId) => void` | Called when removing a block |
| `onEventClick` | `(event) => void` | Called when clicking an event |
| `onNewEvent` | `(start) => void` | Called when clicking empty slot |
| `config` | `CalendarConfig` | Configuration options |

### CalendarEvent

```typescript
interface CalendarEvent {
  id: string;
  start: Date;
  duration: number; // minutes
  title?: string;
  type?: "BLOCK" | "EVENT";
  service?: { name: string };
}
```

### CalendarConfig

```typescript
interface CalendarConfig {
  locale?: string; // default: "es-MX"
  icons?: {
    trash?: ReactNode;
    edit?: ReactNode;
    close?: ReactNode;
  };
}
```

## Features

- Drag & drop events between time slots
- Automatic overlap detection
- Block time slots
- Week navigation
- Auto-scroll to current hour
- Customizable icons
- Locale support
- TypeScript support

## Peer Dependencies

- React 18+ or 19+

## License

MIT
