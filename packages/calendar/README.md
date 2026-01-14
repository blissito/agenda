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

Use the calendar logic without the UI:

```tsx
import { useCalendarEvents } from "@hectorbliss/denik-calendar";

function MyCustomCalendar({ events }) {
  const {
    canMove,
    hasOverlap,
    findConflicts,
    getEventsForDay,
    getEventsForWeek,
    findAvailableSlots
  } = useCalendarEvents(events);

  const handleDrop = (eventId, newStart) => {
    if (canMove(eventId, newStart)) {
      updateEvent(eventId, newStart);
    } else {
      toast.error("Time slot occupied");
    }
  };

  // Get available 60-min slots for today (8am-6pm)
  const slots = findAvailableSlots(new Date(), 60);
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
  renderColumnHeader?: (props: ColumnHeaderProps) => ReactNode;
}

interface ColumnHeaderProps {
  date: Date;
  index: number;
  isToday: boolean;
  locale: string;
}
```

## Custom Column Headers

Transform the calendar from weekdays to any resource type:

```tsx
// Padel courts booking
<Calendar
  events={courtEvents}
  config={{
    renderColumnHeader: ({ index }) => (
      <div className="text-center font-semibold">
        Court {index + 1}
      </div>
    )
  }}
/>

// Meeting rooms
<Calendar
  events={roomEvents}
  config={{
    renderColumnHeader: ({ index }) => {
      const rooms = ["Sala A", "Sala B", "Sala C", "Sala D", "Sala E", "Sala F", "Sala G"];
      return <span>{rooms[index]}</span>;
    }
  }}
/>

// Employees schedule
<Calendar
  events={shifts}
  config={{
    renderColumnHeader: ({ index }) => {
      const team = ["Ana", "Carlos", "María", "Pedro", "Laura", "Diego", "Sofia"];
      return (
        <div className="flex flex-col items-center">
          <img src={`/avatars/${index}.jpg`} className="w-8 h-8 rounded-full" />
          <span className="text-sm">{team[index]}</span>
        </div>
      );
    }
  }}
/>
```

## Features

- Drag & drop events between time slots
- Automatic overlap detection
- Block time slots
- Week navigation
- Auto-scroll to current hour
- Custom column headers (resources, courts, rooms, employees)
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
