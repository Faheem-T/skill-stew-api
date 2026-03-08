# Skill Service

The skill service manages the skill taxonomy and user skill profiles. It stores the master list of available skills and tracks each user's offered and wanted skills with proficiency levels.

**Runtime:** Bun  
**Database:** MongoDB (Mongoose)  
**Infisical Path:** `/skill-service`

## API Endpoints

All routes are prefixed with `/api/v1` and routed through the API Gateway.

### Skills (`/skills`)

| Method | Path   | Description        |
| ------ | ------ | ------------------ |
| GET    | `/:id` | Get a skill by ID  |
| POST   | `/`    | Create a new skill |

### Skill Profiles (`/skills/profile`)

| Method | Path       | Description                                          | Auth Required |
| ------ | ---------- | ---------------------------------------------------- | ------------- |
| PUT    | `/`        | Update current user's skill profile (offered/wanted) | Yes           |
| GET    | `/me`      | Get current user's skill profile                     | Yes           |
| GET    | `/:userId` | Get a user's public skill profile                    | No            |

## Data Models

### Skills

The master skill taxonomy. Each skill has a name, normalized name (for search/dedup), alternate names, a status (`Pending` / `Approved` / `Rejected`), and an optional category reference.

Skills are seeded from a JSON file on first startup (see [Seeding](#seeding)).

### Skill Profiles

Each user has one skill profile (keyed by userId) containing two arrays:

- **Offered skills** — skills the user can teach, each with a proficiency level (`Beginner` → `Expert`) and hours taught
- **Wanted skills** — skills the user wants to learn, each with hours learned

These arrays are populated during user onboarding and used by the ES Proxy service for search and recommendations.

## Seeding

The skill service can be seeded with an initial skill taxonomy:

```bash
npm run seed
```

This reads from [`skillSeedData.json`](src/infrastructure/config/skillSeedData.json), inserts all skills into MongoDB, and publishes a `skill.created` event to RabbitMQ for each skill (so the ES Proxy service can index them for search).

The seed script is idempotent — if skills already exist in the database, it skips seeding.

## Environment Variables

| Variable                      | Description               |
| ----------------------------- | ------------------------- |
| `PORT`                        | Service port              |
| `DATABASE_URL`                | MongoDB connection string |
| `RABBIT_MQ_CONNECTION_STRING` | RabbitMQ connection URL   |

## Key Design Decisions

- **Service class pattern** — uses a single service class for skill operations instead of one class per use case (unlike the user service).
- **Manual dependency injection** via a [`di/`](src/di/) folder.
- **Skill profiles keyed by userId** — the `_id` of a skill profile document is the user's ID, ensuring one profile per user without a separate unique constraint.
- **Seed script publishes events** — seeding doesn't just populate MongoDB; it also publishes `skill.created` events so the ES Proxy service indexes the skill taxonomy for autocomplete and search.

## Directory Structure

```
skill/src/
├── domain/
│   ├── entities/           # Skill, SkillProfile
│   ├── errors/             # DomainError subclasses
│   └── repositories/       # Repository interfaces
├── application/
│   ├── services/           # SkillService, SkillProfileService
│   ├── interfaces/         # Service interfaces
│   ├── dtos/               # Data transfer objects
│   └── errors/             # AppError subclasses
├── infrastructure/
│   ├── models/             # Mongoose schemas (Skill, SkillProfile)
│   ├── repositories/       # Repository implementations
│   ├── adapters/           # MessageProducer (RabbitMQ)
│   ├── mappers/            # Error mappers
│   └── config/             # MongoDB connection, seed script + data
├── presentation/
│   ├── routes/             # Express route definitions
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Error handling, HTTP logging
│   └── errors/             # Error code to status code mapping
├── di/                     # Manual dependency injection
└── utils/                  # Logger, env var validation
```
