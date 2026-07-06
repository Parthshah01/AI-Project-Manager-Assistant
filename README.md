# Taskforge — Mini AI Project Manager Assistant

Turns raw meeting notes or task descriptions into structured, trackable tasks
using an LLM, stores them in a database, and provides a UI to filter, edit,
and export them.

Built to satisfy the assessment brief:
- **Input**: paste meeting notes / task text
- **Backend**: LLM extracts tasks → structured JSON (description, due date, owner, priority) → stored in a DB
- **Frontend**: task list with filters (owner/status/priority), inline editing, CSV export

## Stack

| Layer    | Choice                                  |
|----------|------------------------------------------|
| Backend  | Python + FastAPI                         |
| Database | SQLite via SQLAlchemy (file-based, zero setup) |
| LLM      | OpenAI (`gpt-4o-mini` by default, configurable) |
| Frontend | React + Vite                             |

## Project structure

```
mini-ai-pm-assistant/
├── backend/
│   ├── main.py            # FastAPI app & routes
│   ├── models.py          # SQLAlchemy Task model
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── database.py        # DB engine/session setup
│   ├── llm_extractor.py   # OpenAI call + prompt for task extraction
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js                    # fetch wrapper for the backend API
    │   └── components/
    │       ├── TaskInput.jsx         # notes textarea + extract button
    │       ├── TaskFilters.jsx       # owner/status/priority filters + CSV export
    │       └── TaskList.jsx          # task table with inline edit/delete
    ├── package.json
    └── .env.example
```

## Setup

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and add your real OPENAI_API_KEY

uvicorn main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (interactive docs at `/docs`).
A `tasks.db` SQLite file is created automatically on first run.

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env    # defaults to http://localhost:8000, edit if needed

npm run dev
```

Open `http://localhost:5173`.

## How it works

1. You paste meeting notes into the input panel and click **Extract tasks**.
2. The frontend calls `POST /extract` with the raw text.
3. The backend sends the text to the LLM with a system prompt that instructs
   it to return strict JSON: a list of tasks, each with `description`,
   `owner`, `due_date`, `priority`, and the `source_note` it was pulled from.
4. Each extracted task is saved as a row in the `tasks` table and returned to
   the frontend, which refreshes the list.
5. From the list you can filter by owner/status/priority, edit any field
   inline (Edit → change values → Save), delete tasks, or export the current
   task table to CSV.

## API reference

| Method | Endpoint               | Description                              |
|--------|------------------------|-------------------------------------------|
| POST   | `/extract`              | `{ "text": "..." }` → extracts & saves tasks |
| GET    | `/tasks`                 | List tasks (optional `owner`, `status`, `priority` query params) |
| GET    | `/tasks/{id}`            | Get one task |
| POST   | `/tasks`                 | Manually create a task |
| PUT    | `/tasks/{id}`            | Update a task (partial updates supported) |
| DELETE | `/tasks/{id}`            | Delete a task |
| GET    | `/tasks/export/csv`      | Download all tasks as CSV |
| GET    | `/health`                | Health check |

## Design notes / assumptions

- **`due_date` is stored as text, not a strict date**, because notes often
  say things like "next Friday" rather than a calendar date. The prompt asks
  the model to resolve relative dates against today's date when it can, and
  fall back to the phrase otherwise — you can tighten this to a hard
  `DATE` column later if you want to enforce ISO dates only.
- **Priority** defaults to `Medium` when not inferable, and is derived from
  urgency language in the notes (e.g. "ASAP", "critical" → High).
- **Deduplication** is instructed at the prompt level (don't repeat the same
  task twice within one extraction). It does not currently dedupe across
  multiple separate extractions — a natural next step would be a similarity
  check against existing open tasks before inserting.
- CORS is wide open (`allow_origins=["*"]`) since this is a local
  assessment build — lock this down before any real deployment.
- No auth/user accounts — out of scope for the brief, but the schema is
  simple enough to add a `user_id` column later.

## Possible extensions

- Swap SQLite for Postgres by changing `DATABASE_URL` (SQLAlchemy already
  abstracts this).
- Add pagination to `/tasks` once task volume grows.
- Add a "re-run extraction" that merges into existing tasks instead of
  always creating new ones.
- Bulk actions (multi-select delete / status change) in the UI.
