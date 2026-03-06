# Common Package (`@skillstew/common`)

A shared npm package containing event definitions used across all services. It defines the canonical event names, Zod payload schemas, and the `AppEvent` envelope type.

**Published to:** npm (`@skillstew/common`)  
**Package Manager:** npm  
**Version:** patch-bumped on each publish via `npm run pub`

## What It Exports

### `AppEvent<T>`

The envelope type for all inter-service events:

```ts
interface AppEvent<T extends EventName> {
  eventId: string;
  eventName: T;
  timestamp: string; // ISO format
  producer: string; // service that emitted the event
  data: EventPayload<T>; // Zod-validated payload
  traceId?: string;
}
```

### `CreateEvent(eventName, data, producer, traceId?)`

Factory function that builds an `AppEvent` with a random UUID and ISO timestamp.

### `EventSchemas`

A single object mapping every event name to its Zod schema. Used by outbox workers to validate payloads before publishing, and by consumers to parse incoming events.

### `EventName` / `EventPayload<T>`

Derived types — `EventName` is the union of all event name strings, and `EventPayload<T>` infers the payload type from the corresponding Zod schema.

## Event Catalog

### User Events

| Event Name            | Payload Fields                                                      |
| --------------------- | ------------------------------------------------------------------- |
| `user.registered`     | `id`, `email`                                                       |
| `user.verified`       | `id`                                                                |
| `user.profileUpdated` | `id`, `name?`, `username?`, `location?`, `languages?`, `avatarKey?` |

### Skill Events

| Event Name             | Payload Fields                                             |
| ---------------------- | ---------------------------------------------------------- |
| `skill.created`        | `id`, `name`, `normalizedName`, `alternateNames`, `status` |
| `skill.updated`        | Same as `skill.created`                                    |
| `skill.deleted`        | `id`                                                       |
| `skill.profileUpdated` | `userId`, `offered[{id, name}]`, `wanted[{id, name}]`      |

### Connection Events

| Event Name             | Payload Fields                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `connection.requested` | `connectionId`, `requesterId`, `requesterUsername?`, `recipientId`, `recipientUsername?`, `timestamp` |
| `connection.accepted`  | `connectionId`, `accepterId`, `accepterUsername?`, `requesterId`, `requesterUsername?`, `timestamp`   |
| `connection.rejected`  | `connectionId`, `rejecterId`, `rejecterUsername?`, `requesterId`, `requesterUsername?`, `timestamp`   |

## Adding a New Event

1. Create or update a Zod schema in `src/events/schemas/`
2. Add the event name → schema mapping to the schema group object (e.g., `UserEventSchemas`)
3. The event name is automatically available in `EventName`, and the payload type is inferred from the schema
4. Run `npm run pub` to patch-bump, build, and publish

## Directory Structure

```
common/src/
├── index.ts                 # Re-exports everything
└── events/
    ├── AppEvent.ts           # AppEvent<T> interface
    ├── CreateEvent.ts        # Factory function
    ├── EventMap.ts           # EventSchemas, EventName, EventPayload<T>
    └── schemas/
        ├── userEventsSchema.ts              # user.registered, user.verified, user.profileUpdated
        ├── skillsEventSchemas.ts            # skill.created, skill.updated, skill.deleted, skill.profileUpdated
        └── userConnectionEventSchemas.ts    # connection.requested, connection.accepted, connection.rejected
```
