# AI Document Processing System

A full-stack document processing system that allows uploading, analyzing, and summarizing documents asynchronously. Built with a REST API, real-time updates via WebSockets, and AI-powered summarization.

## Features

- Upload and manage documents (PDF, DOCX, TXT, XLSX, images)
- Asynchronous batch processing with a queue system
- AI-generated summaries for each document
- Real-time progress updates via WebSockets
- Process control: start, pause, resume, and stop analysis
- Text statistics: word count, line count, character count, most frequent words

**Live demo:** [https://ai-document-processing-system-production.up.railway.app](https://ai-document-processing-system-production.up.railway.app)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | NestJS (Node.js) |
| Frontend | React + Vite + TailwindCSS |
| Database | PostgreSQL + TypeORM |
| Queue | Redis + BullMQ |
| AI | Groq API (llama-3.1-8b-instant) |
| Storage | Cloudflare R2 (S3-compatible) |
| Real-time | Socket.io |
| Container | Docker + Docker Compose |

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- A [Groq API key](https://console.groq.com) (free tier available)
- A Cloudflare R2 bucket (or any S3-compatible storage)

### 1. Clone the repository

```bash
git clone https://github.com/JuanMPaola/AI-Document-Processing-System.git
cd AI-Document-Processing-System
```

### 2. Configure environment variables

Create a `.env` file in the root of the project:

```dotenv
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=doc_processing

REDIS_HOST=redis
REDIS_PORT=6379

AI_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

R2_ACCESS_KEY=your_r2_access_key
R2_SECRET_KEY=your_r2_secret_key
R2_ENDPOINT=your_r2_endpoint
R2_BUCKET=your_bucket_name
```

### 3. Run the project

```bash
docker compose up --build
```

Once all containers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api

### ⚠️ Port conflicts

This project uses ports `5432` (PostgreSQL), `6379` (Redis), and `5173` / `3000` (frontend/backend). If any of these ports are already in use on your machine, `docker compose up` will fail.

To find and stop the conflicting container:

**Windows (PowerShell):**
```powershell
# Find which container is using the port (e.g. 6379)
netstat -ano | findstr :6379
# Get the PID from the last column, then find the container
docker ps | findstr <PID>
# Stop it
docker stop <container-name>
```

**Mac / Linux:**
```bash
# Find and stop the container using the port (e.g. 6379)
docker stop $(docker ps -q --filter "publish=6379")
```

### 4. Stop the project

```bash
docker compose down
```

To stop and remove all data (volumes):

```bash
docker compose down -v
```

## Key Findings & Technical Considerations

**AI provider decoupling as an operational advantage**
Using the Strategy pattern for the AI layer paid off in practice. During development the system ran with a local Ollama instance, and switching to Groq for production was just a change in the environment variable. No backend code changed. That kind of flexibility is hard to get if the provider is baked into the logic.

**Resilience against external rate limiting**
When processing documents in batches with a third-party AI API, hitting rate limits is not an edge case, it is expected. The system handles this by retrying with backoff, parsing the exact wait time from the error response and waiting that long before trying again. The pipeline keeps going without failing the whole process.

**Complexity of concurrent state control**
Pause and resume sound simple but are tricky in an async batch system. A pause signal does not stop a batch that is already running, it kicks in between batches. That is a deliberate trade-off to avoid leaving documents in a broken intermediate state. Consistency was prioritized over instant response.

## What's Next

- **Automated testing** — unit tests for core services (`AnalysisService`, `TextExtractionService`, providers) and e2e tests for the main API flows.
- **Structured logging** — replace `console.log` with a proper logging layer (e.g. Winston or Pino) with log levels, request tracing, and log aggregation support.
- **User accounts** — multi-tenant support with authentication (JWT), so each user manages their own processes and documents in isolation.

## Design Decisions

The system is built around separation of concerns and SOLID principles. Each module owns a single responsibility: `process` manages lifecycle, `document` handles uploads, `text-extraction` parses file content, `analysis` orchestrates the pipeline, `queue` handles async processing, `realtime` emits live events, and `ai` abstracts summarization.

**Design patterns used:**

- **Strategy** — the AI module defines an `AiProvider` interface with interchangeable implementations (`GroqProvider`, `OllamaProvider`). Switching providers requires only a change in the environment variable.
- **Factory** — `aiProviderFactory` in `AiModule` decides which provider to instantiate at runtime based on `AI_PROVIDER`.
- **Repository** — data access is fully encapsulated through TypeORM repositories injected per module, keeping business logic clean of raw queries.
- **Observer** — the WebSocket gateway emits domain events (`process.started`, `process.progress`, `document.completed`, etc.) that the frontend reacts to in real time, decoupling state changes from UI updates.

**Cloud storage with Cloudflare R2:** uploaded documents are stored in a Cloudflare R2 bucket (S3-compatible) rather than the local filesystem. This keeps the backend stateless and makes the system deployment-ready from day one.

**Asynchronous processing with BullMQ:** analysis jobs are enqueued in Redis and processed by a background worker. The API never blocks on heavy work, which keeps response times fast and allows retries, concurrency control, and pause/resume logic.

**Batch processing:** documents are processed in batches of 3 concurrently, balancing throughput with control. The system checks for pause/stop signals between batches, enabling mid-process interruption without cutting a job in half.

## Deployment

The production version of this project is deployed on [Railway](https://railway.app). Each service runs in its own container and they are all connected through Railway's internal network:

- **Frontend** — React app served by Nginx
- **Backend** — NestJS API
- **PostgreSQL** — managed by Railway's native Postgres plugin
- **Redis** — managed by Railway's native Redis plugin

Ollama is not part of the production stack. AI summarization is handled by the Groq API, which is faster and does not require running a heavy model in a container. The switch between Ollama and Groq is controlled by the `AI_PROVIDER` environment variable, so the local setup still supports Ollama if preferred.

If you prefer to run a local AI model instead of using the Groq API, you can set up Ollama manually:

```bash
docker run -d --name ollama -p 11434:11434 -v ollama_data:/root/.ollama ollama/ollama
docker exec -it ollama ollama pull qwen2:0.5b
```

Then update your `.env`:

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```
## Optional: Using Ollama locally instead of Groq

If you prefer to run a local AI model instead of using the Groq API, you can set up Ollama manually:

```bash
docker run -d --name ollama -p 11434:11434 -v ollama_data:/root/.ollama ollama/ollama
docker exec -it ollama ollama pull qwen2:0.5b
```

Then update your `.env`:

```dotenv
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
```
