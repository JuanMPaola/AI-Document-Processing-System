# Document Processing System

---

## 📌 Overview

This project implements a **Document Processing System** that allows users to:

* Upload documents
* Associate them with a processing job (**Process**)
* Analyze their content using AI (local LLM via Ollama)
* Manage processing lifecycle (async processing planned with BullMQ)

---

## 🧠 Architecture & Design Decisions

### Core Concepts

* **Process** → Represents a processing job
* **Document** → Input files associated with a process

```text
Process (1) ──── (N) Documents
```

---

### Key Design Decisions

#### 1. Process-based architecture

Instead of processing files directly, the system introduces a `Process` entity to:

* Group documents
* Track lifecycle states (`PENDING`, `RUNNING`, etc.)
* Enable async processing later

---

#### 2. Storage abstraction (R2)

A `StorageService` abstracts file storage:

* Implemented using **Cloudflare R2 (S3-compatible)**
* Easily replaceable (S3, MinIO, etc.)

**Important considerations:**

* Use S3 endpoint (`cloudflarestorage.com`), NOT `r2.dev`
* Requires `forcePathStyle: true`
* Public URLs are different from upload endpoints

---

#### 3. AI abstraction layer (Hybrid Architecture)

```text
AiService → AiProvider → Ollama (local)
                          ↓
                   (future fallback)
                   External API
```

* Default: local model (Ollama)
* Future: fallback to external APIs (OpenAI, Gemini)

---

#### 4. Local AI with Ollama

* Runs locally via Docker
* Model: **phi3**
* Accessed via HTTP API (`localhost:11434`)

**Benefits:**

* Free
* Offline
* No rate limits
* Self-contained system

---

## ⚙️ Installation & Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd document-processing-system
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Environment variables

Create `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=doc_processing

# R2 Storage
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxxx
R2_SECRET_KEY=xxxx
R2_BUCKET=documents-dev

# AI
OLLAMA_BASE_URL=http://localhost:11434
```

---

### 4. Run PostgreSQL (Docker)

```bash
docker run -d \
  --name postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=doc_processing \
  postgres
```

---

### 5. Run Ollama (Docker)

```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama
```

Download model:

```bash
docker exec -it ollama ollama run phi3
```

Verify:

```bash
curl http://localhost:11434/api/tags
```

---

### 6. Start application

```bash
npm run start:dev
```

---

## 🚀 Usage

### 1. Create process

```http
POST /process
```

---

### 2. Upload document

```http
POST /documents/:processId/upload
```

Content-Type:

```
multipart/form-data
```

---

### 3. Test AI summarization

```http
POST /ai/summarize
```

Body:

```json
{
  "text": "Your text here"
}
```

---

## 📡 API Documentation

### 🔹 Process

#### Create process

```http
POST /process
```

#### Get all processes

```http
GET /process
```

#### Get process by ID

```http
GET /process/:id
```

---

### 🔹 Documents

#### Upload document

```http
POST /documents/:processId/upload
```

#### Delete document

```http
DELETE /documents/:id
```

---

### 🔹 AI

#### Summarize text

```http
POST /ai/summarize
```

Request:

```json
{
  "text": "string"
}
```

Response:

```json
{
  "summary": "string"
}
```

---

## 🔍 Key Findings & Technical Considerations

### Storage (R2)

* Must use S3-compatible endpoint
* Bucket is mandatory
* Requires correct credentials
* `forcePathStyle` needed for compatibility

---

### AI (Ollama)

* Runs locally as HTTP service
* Slower on CPU (expected)
* Good enough for summarization tasks
* No external dependency

---

### System Design

* Clear separation of concerns
* Modular architecture (Process / Document / AI)
* Ready for async processing (BullMQ)

---

## 🧪 Testing

Current:

* Manual testing via Swagger
* Postman / Insomnia

Planned:

* Jest unit tests
* Integration tests for processing pipeline

---

## 📂 Test Data

To comply with requirements:

* Create at least **10 text files**
* Minimum **500 words each**
* Different topics (articles, blogs, technical docs)

---

## 🔮 Future Improvements

* BullMQ integration (async processing)
* Progress tracking
* PDF text extraction
* OCR support
* AI fallback provider
* WebSockets for real-time updates
* Structured logging

---

## 🤖 AI Usage Policy

### 1. Tools Used

* ChatGPT → architecture & code assistance
* Ollama → local LLM for summarization

---

### 2. Prompt History (examples)

* "Design architecture for async document processing system"
* "Integrate Ollama with NestJS"
* "Create AI abstraction layer"
* "Explain R2 S3 configuration issues"

---

### 3. AI-assisted Code

Used for:

* AI service structure
* Ollama integration
* Swagger documentation
* Architecture decisions

---

### 4. Modifications

All generated code was:

* reviewed
* adapted to project structure
* manually integrated

---

### 5. Justification

AI was used to:

* speed up development
* explore architectural patterns
* reduce boilerplate

Final decisions and integration were done manually.

---

## 🧠 Final Notes

The system is designed to be:

* Scalable
* Modular
* Easily extensible
* Ready for async processing
* AI-enabled without external dependencies

---









## 🤖 AI Usage Transparency

This project was developed with the assistance of AI tools, following a fully transparent approach as required.

---

### 1. Tools Used

* **ChatGPT (OpenAI)**
  Used for:

  * Architectural guidance
  * Design validation
  * Code scaffolding (non-final)
  * Debugging assistance

* **Ollama (Local LLM Runtime)**
  Used as part of the application itself:

  * Local AI inference
  * Document summarization
  * Model used: `phi3`

---

### 2. Prompt History (Representative Examples)

The following are representative prompts used during development:

* "Design an architecture for an asynchronous document processing system using Node.js"
* "How to integrate a local LLM (Ollama) into a NestJS application"
* "Explain how to structure a queue-based processing system with BullMQ"
* "Fix S3-compatible storage issues with Cloudflare R2"
* "Design a pluggable AI provider architecture"
* "Improve API documentation using Swagger in NestJS"
* "Explain best practices for handling async jobs and process states"

Prompts were iterative and used to refine understanding rather than generate final solutions.

---

### 3. AI-Assisted Code

AI-assisted code was used primarily for:

* Initial structure of:

  * `AiService`
  * `OllamaProvider`
  * Swagger documentation annotations
* Example implementations of:

  * S3-compatible storage client (R2 adjustments)
  * Queue/worker structure (conceptual level)

However:

* All code was **manually reviewed and adapted**
* No code was used blindly without understanding
* Integration between modules was implemented manually

---

### 4. Modifications & Developer Decisions

Several important adjustments were made beyond AI suggestions:

* **Refactoring flow to be process-driven**
  Instead of processing documents directly, a `Process` entity was introduced to:

  * Group documents
  * Track lifecycle states
  * Enable async processing

* **Manual correction of R2 integration issues**

  * Fixed incorrect endpoint usage (`r2.dev` vs S3 endpoint)
  * Added `forcePathStyle: true`
  * Ensured environment variables were properly loaded

* **Improved API design**

  * Introduced `/documents/:processId/upload` to enforce proper association
  * Ensured documents cannot exist without a process

* **Separation of concerns**

  * Storage logic isolated into `StorageService`
  * AI logic abstracted behind `AiService` and provider interface

* **Incremental architecture approach**

  * Deferred BullMQ integration to avoid premature complexity
  * Validated synchronous flow before introducing async processing

---

### 5. Justification of AI Usage

AI tools were used to:

* Accelerate development of non-core logic
* Explore alternative architectural approaches
* Validate design decisions
* Reduce boilerplate in repetitive tasks

AI was **not used as a substitute for understanding**, but as a tool to:

* Improve productivity
* Validate reasoning
* Iterate faster

All final decisions, architecture, and integrations were made consciously by the developer.

---

### Final Note

The goal was to leverage AI as an **engineering assistant**, not as an implementation shortcut.

The resulting system reflects:

* Clear architectural thinking
* Intentional design decisions
* Manual integration of all components
* Full understanding of the system behavior

---
