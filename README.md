# Aegis Support Hub — Backend Services (Detailed Reference)

This directory contains the Fastify-based backend REST API for the Aegis Support Ticket System. It coordinates data persistence using Prisma ORM, verifies access using Supabase Auth JWT tokens, and executes structured ticket analysis using Google Gemini.

---

## 🛠️ Technology Stack & Dependencies

* **Node.js (v18.0.0+)** & **TypeScript (v5.8.3)**: Standardized ECMAScript Module (ESM) layout compiled via `tsc`.
* **Fastify (v5.4.0)**: Low-overhead, asynchronous web engine chosen for speed and lightweight middleware hooks.
* **Prisma (v6.9.0)**: Object-Relational Mapping (ORM) used to model database states and enforce type-safe queries.
* **PostgreSQL (v15+)**: Relational Database for transactions, triggers, and indices.
* **Supabase Client SDK (v2.49.0)**: Handles session mapping, token parsing, and user synchronization.
* **Zod (v3.25.0)**: Handles type checking at the controller boundary. Mapped into OpenAPI schema definitions via `fastify-type-provider-zod`.
* **Google Gen AI SDK (v2.8.0)**: Direct SDK integration accessing the `gemini-2.5-flash` model.

---

## ⚙️ Setup & Installation Guide

Follow these steps to set up and run the backend locally:

### 1. Prerequisites
Ensure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/) (v18.0.0 or higher)
* [npm](https://www.npmjs.com/) (normally bundled with Node.js)
* A running [PostgreSQL](https://www.postgresql.org/) database or a Supabase project postgres connection.

### 2. Install Dependencies
Navigate to the backend directory and install all required node modules:
```bash
cd backend
npm install
```

### 3. Environment Variable Configuration
Create a `.env` configuration file in the `backend/` root:
```bash
cp .env.example .env
```
Open `.env` and fill in your connection details:
* `PORT`: The server port (e.g. `3000`).
* `DATABASE_URL`: Connection string to your PostgreSQL instance (configured with transactional connection pooling if using Supabase).
* `DIRECT_URL`: Direct connection string to PostgreSQL (used for executing migrations without pooling wrappers).
* `SUPABASE_URL`: The URL endpoint for your Supabase project (e.g. `https://your-project-ref.supabase.co`).
* `SUPABASE_ANON_KEY`: The public anonymous key for authentication.
* `SUPABASE_SERVICE_ROLE_KEY`: The secret service role key (required to bypass auth constraints during administrative agent provisioning).
* `GEMINI_API_KEY`: API key for Google Gemini to enable AI analysis. If omitted, the server automatically utilizes a rule-based fallback system.
* `FRONTEND_URL`: The URL endpoint for your frontend client (e.g. `http://localhost:5173`), used to securely configure the CORS allowed origin.


### 4. Database Setup & Seeding
Push the Prisma schema to compile the PostgreSQL types and populate client declarations:
```bash
npx prisma generate
npx prisma db push
```
Populate the database with default metadata, agents, and mock tickets:
```bash
npm run prisma:seed
```
*Note: Seeding creates an administrator account `admin@replink.io` with password `password123` for default testing logins.*

### 5. Running the Application
Launch the Fastify server in watch mode:
```bash
npm run dev
```
The REST API will boot and listen on `http://localhost:3000`. You can inspect endpoints and models interactively via the OpenAPI / Swagger UI at:
* **Interactive API Reference**: `http://localhost:3000/api-docs`

---

## 🗄️ Database Schema & Data Models

Relational structures are modeled in [schema.prisma](file:///c:/projects/ticket-system/backend/prisma/schema.prisma). Below is the comprehensive field catalog:

### 1. Agent Table (`agents`)
Represents support staff and administrators. Mapped to Supabase Auth UUIDs.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key | Directly references Supabase Auth User ID |
| `name` | `String` | Required | Agent display name |
| `email` | `String` | Unique, Required | Authentication email |
| `role` | `AgentRole` | Enum (`ADMIN`, `AGENT`), Default: `AGENT` | Permission rank |
| `is_active` | `Boolean` | Default: `true` | Controls logins and assignment availability |
| `created_at` | `DateTime` | Default: `now()` | Timestamp |
| `updated_at` | `DateTime` | Auto-update | Timestamp |

### 2. Customer Table (`customers`)
Tracks clients opening service requests.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, UUID | Unique client identifier |
| `name` | `String` | Required | Customer contact name |
| `email` | `String` | Unique, Required | Contact email address |
| `company` | `String` | Optional | Affiliated company / organization |
| `created_at` | `DateTime` | Default: `now()` | Timestamp |
| `updated_at` | `DateTime` | Auto-update | Timestamp |

### 3. Ticket Table (`tickets`)
Manages support issues.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, UUID | Unique ticket identifier |
| `title` | `String` | Required | Issue header |
| `description` | `String` | Required | Detailed breakdown |
| `status` | `TicketStatus` | Enum (`OPEN`, `IN_PROGRESS`, `WAITING_ON_CUSTOMER`, `RESOLVED`, `CLOSED`) | Default: `OPEN` |
| `priority` | `TicketPriority` | Enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), Default: `MEDIUM` | Severity classification |
| `customer_id` | `UUID` | Foreign Key (Customer) | Target client relation |
| `assigned_agent_id` | `UUID` | Foreign Key (Agent), Optional | Assigned owner relation |
| `created_at` | `DateTime` | Default: `now()` | Timestamp |
| `updated_at` | `DateTime` | Auto-update | Timestamp |
| `resolved_at` | `DateTime` | Optional | Populated when ticket status shifts to `RESOLVED` |

*Indices configured on: `[status]`, `[priority]`, `[customer_id]`, `[assigned_agent_id]`, `[created_at]`, `[status, created_at]`, `[priority, created_at]`, `[assigned_agent_id, status]`.*

### 4. Comment Table (`comments`)
Maintains conversation records.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, UUID | Unique comment identifier |
| `content` | `String` | Required | Text commentary body |
| `is_internal` | `Boolean` | Default: `true` | If true, comment is hidden from customer portals |
| `ticket_id` | `UUID` | Foreign Key (Ticket) | Link to parent ticket |
| `agent_id` | `UUID` | Foreign Key (Agent) | Authoring agent |
| `created_at` | `DateTime` | Default: `now()` | Timestamp |

*Indices configured on: `[ticket_id]`, `[ticket_id, created_at]`.*

### 5. Ticket Status History Table (`ticket_status_history`)
Immutable audits tracking progress transitions.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, UUID | Audit log entry ID |
| `old_status` | `TicketStatus` | Required | State before modification |
| `new_status` | `TicketStatus` | Required | State after modification |
| `changed_by_agent_id` | `UUID` | Foreign Key (Agent) | Transition author |
| `ticket_id` | `UUID` | Foreign Key (Ticket) | Target ticket |
| `reason` | `String` | Optional | Context for the change |
| `created_at` | `DateTime` | Default: `now()` | Timestamp |

### 6. AI Insight Table (`ai_insights`)
Stores AI-generated intelligence summaries and evaluations.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, UUID | Unique analysis ID |
| `ticket_id` | `UUID` | Foreign Key (Ticket) | Link to parent ticket |
| `summary` | `String` | Required | Issue overview generated by LLM |
| `suggested_priority`| `TicketPriority` | Required | Suggested priority level |
| `sentiment` | `Sentiment` | Enum (`POSITIVE`, `NEUTRAL`, `FRUSTRATED`, `ANGRY`) | Customer mood classification |
| `next_action` | `String` | Optional | Suggested action plan |
| `confidence_score` | `Float` | Required | Confidence score from 0.0 to 1.0 |
| `is_edited` | `Boolean` | Default: `false` | True if edited by an agent |
| `edited_summary` | `String` | Optional | Override text |
| `edited_by_agent_id`| `UUID` | Foreign Key (Agent), Optional | Reviewing agent reference |
| `is_stale` | `Boolean` | Default: `false` | Mark old analyses as stale when new ones run |
| `version` | `Int` | Default: `1` | Increments on regeneration |
| `created_at` | `DateTime` | Default: `now()` | Timestamp |

---

## 🔌 API Endpoint Specifications

All endpoints require authentication (excluding swagger docs). Pass a valid JWT in the headers: `Authorization: Bearer <JWT>`.

| Route | Method | Body Format / Zod Schema | Auth Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/agents` | `POST` | `{ name, email, password, role }` | **Admin Only** | Provisions a new agent in Supabase Auth and seeds database record. |
| `/api/v1/agents` | `GET` | *None* (Query filters: `page`, `pageSize`, `role`, `isActive`) | Any Auth | Lists registered agents. |
| `/api/v1/agents/me` | `GET` | *None* | Any Auth | Returns authenticated user profile context. |
| `/api/v1/agents/:id` | `GET` | *None* | Any Auth | Returns detailed profile context for specific agent ID. |
| `/api/v1/customers` | `POST` | `{ name, email, company }` | Any Auth | Registers a new customer client in database. |
| `/api/v1/customers` | `GET` | *None* (Query search: `search`) | Any Auth | Lists customers, filterable by name/email. |
| `/api/v1/tickets` | `POST` | `{ title, description, priority, customerId, assignedAgentId }` | Any Auth (Admin to assign) | Creates new support ticket. Agents cannot set assignee at creation. |
| `/api/v1/tickets` | `GET` | *None* (Query filters: `page`, `pageSize`, `search`, `status`, `priority`) | Any Auth | Lists tickets. Standard agents are restricted to tickets assigned to them. Admins see all. |
| `/api/v1/tickets/:id` | `GET` | *None* | Any Auth | Returns ticket details, comments, history, and active AI Insight. |
| `/api/v1/tickets/:id/status`| `PATCH` | `{ status, reason }` | Assignee / Admin | Updates ticket status, logging record to history. |
| `/api/v1/tickets/:id/assign`| `PATCH` | `{ agentId }` | **Admin Only** | Assigns ticket to agent. |
| `/api/v1/tickets/:ticketId/comments` | `POST` | `{ content, isInternal }` | Assignee / Admin | Appends a comment/internal draft to ticket thread. |
| `/api/v1/tickets/:ticketId/comments` | `GET` | *None* | Assignee / Admin | Lists ticket comment history. |
| `/api/v1/tickets/:ticketId/ai/generate` | `POST` | *None* | Assignee / Admin | Triggers Google Gemini to run analysis and record results. |
| `/api/v1/tickets/:ticketId/ai` | `GET` | *None* | Assignee / Admin | Returns latest active AI Insight record. |

---

## 🧠 AI Feature Architecture & prompt details

The AI analysis relies on [src/modules/ai/ai.service.ts](file:///c:/projects/ticket-system/backend/src/modules/ai/ai.service.ts):

### Gemini Prompt Construction
```typescript
const prompt = `You are an AI support ticket analyzer. Analyze the following ticket title, description, and comments, then return structured insights:
Ticket Title: ${ticket.title}
Ticket Description: ${ticket.description}
Comments:
${ticket.comments.map(c => `- ${c.content}`).join('\n')}`;
```

### Response Constraints (JSON Schema)
The Gemini API model is invoked using `responseMimeType: 'application/json'` paired with a schema defining:
* `summary`: String (Concise summary of the issue, max 2 sentences)
* `suggestedPriority`: String Enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
* `sentiment`: String Enum (`POSITIVE`, `NEUTRAL`, `FRUSTRATED`, `ANGRY`)
* `nextAction`: String (Recommended next step for the support agent)
* `confidenceScore`: Number (0.0 to 1.0 representation of AI certainty)

### Deterministic Rule-Based Fallback
If `GEMINI_API_KEY` is not present, or if the API request times out or fails validation, a static analysis engine is run:
* **Sentiment**: Defaults to `NEUTRAL`.
* **Suggested Priority**: Matches the ticket's current priority state.
* **Summary**: Returns `ticket.description.slice(0, 150) + '...'`.
* **Confidence**: Sets a default of `0.80` to represent static rule accuracy.

---

## ⚠️ Known Limitations

1. **No Customer Portal**: Customers exist as static data records. They cannot authenticate, view ticket progression, or submit comments directly.
2. **Single Assigned Agent**: The `Ticket` schema defines `assignedAgentId String? @db.Uuid`. Tickets cannot have multiple agents or support teams assigned.
3. **No Email Notification System**: Assigning tickets or commenting on threads does not trigger email notifications.
4. **Lack of Agent Status controls**: The `Agent` model contains the `isActive` column, but there are no backend routes or endpoints to modify it.

---

## 📈 Future Enhancements Plan

With additional development time, we would implement:
1. **Multiple Agent Assignment (Collaborative Tickets)**:
   * **Schema Migration**: Drop `assignedAgentId` from the `Ticket` model. Create a join table:
     ```prisma
     model TicketAssignment {
       ticketId String @db.Uuid
       agentId  String @db.Uuid
       assignedAt DateTime @default(now())
       @@id([ticketId, agentId])
     }
     ```
   * **Controller Upgrades**: Update `assignTicket` to append or remove entries from `TicketAssignment`.
2. **Admin Agent Suspension & Offboarding**:
   * **Status Routes**: Add `PATCH /api/v1/agents/:id/status` to toggle `isActive`.
   * **Supabase Deprovisioning**: Access Supabase Auth admin client:
     ```typescript
     await supabase.auth.admin.updateUserById(id, { ban_duration: 'none' }) // or delete user
     ```
3. **Email Notification Pipeline**:
   * **SMTP Setup**: Implement a background job queue (e.g. BullMQ with Redis) to send emails when tickets are assigned or resolved.
4. **Customer API Support**:
   * **Auth Migration**: Support Supabase logins for customers, introducing a separate customer metadata relation.
