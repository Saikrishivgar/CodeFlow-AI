# CODEFLOW AI

> **Understand Every Line. Visualize Every Step.**

CODEFLOW AI is a full-stack interactive Python programming visualization, algorithm comparison, and AI-assisted learning platform built with **Next.js 14 (App Router, TypeScript, Tailwind CSS, Zustand, Monaco Editor)** and a **Python 3.12 FastAPI execution & tracing engine**.

---

## Completed Platform Capabilities (Phases 1–5)

| Phase | Module | Capabilities |
| :--- | :--- | :--- |
| **Phase 1** | **Landing & Dashboard Foundation** | Marketing landing page (`/`), interactive dashboard (`/dashboard`), theme persistence (dark default + light mode), responsive command palette (`Cmd+K`), and keyboard shortcut cheatsheet (`?`). |
| **Phase 2** | **Interactive Code Workspace & Python 3.12 Engine** | Monaco IDE (`/workspace`) with deterministic `sys.settrace` execution (`POST /api/execute`), forward/backward time-travel stepping, variable state-diff badges (`created`, `modified`, `unchanged`, `deleted`), call-stack frames, and beginner-friendly error diagnostics. |
| **Phase 3** | **Data Structure & Memory Visualiser** | Automatic runtime structure detection and interactive SVG/canvas visualisers for **Arrays & Two Pointers**, **Stack & Queue**, **Hash Map / Dict & Set**, **Singly/Doubly Linked Lists** (with cycle detection), **Binary Trees / BSTs**, **Heaps**, **Graphs (BFS/DFS)**, **Recursion Call Trees**, and **Python Object/Reference Heap Graphs**. |
| **Phase 4** | **Execution-Aware AI Tutor & DSA Assistant** | Docked Workspace AI Tutor and standalone AI Tutor Studio (`/tutor`) grounded in real execution snapshots (line number, variable diffs, call stack, stdout, runtime errors, and detected structures). Supports server-side **Google Gemini** (`GEMINI_API_KEY`), **OpenAI** (`OPENAI_API_KEY`), and a deterministic **Execution-Trace Tutor** fallback that never fabricates variable values. |
| **Phase 5** | **Comparison Lab, Algorithm Library, Guided Learning & Persistence** | Side-by-side **Brute-Force vs. Optimized Algorithm Comparison Lab** (`/comparison`, `POST /api/compare`) running two independent Python executions on identical inputs; **14-Blueprint Algorithm Library** (`/algorithms`) across all 9 required categories; **Guided Learning Studio** (`/learn`) with 12 lessons and live Python-verified practice exercises; and **SQLite + Browser Persistence** across `/projects`, `/history`, `/learn`, and `/tutor`. |

---

## Architecture & Repository Layout

```text
codeflow/
├── app/                        # Next.js 14 App Router pages
│   ├── page.tsx                # Marketing Landing Page
│   ├── dashboard/page.tsx      # Workspace Overview & Metrics
│   ├── workspace/page.tsx      # Interactive Python IDE, Tracer, Visualiser & AI Tutor Dock
│   ├── comparison/page.tsx     # Side-by-side Brute-Force vs Optimized Execution Lab
│   ├── algorithms/page.tsx     # 9-Category Runnable Algorithm Library
│   ├── learn/page.tsx          # Guided Learning Paths & Verified Practice Exercises
│   ├── tutor/page.tsx          # Standalone AI Tutor & DSA Concept Studio
│   ├── projects/page.tsx       # Saved Projects Manager (SQLite + localStorage)
│   ├── history/page.tsx        # Replayable Execution History Log (SQLite + localStorage)
│   └── settings/page.tsx       # Theme, Profile, Persistence & Sandbox Security Audit
├── components/                 # Modular UI, Workspace, Visualiser & Tutor components
├── lib/                        # API client, Data Structure detectors, Tutor grounding, Catalogs
├── store/                      # Zustand state stores (Workspace, Project/SQLite sync, Tutor, App)
├── tests/                      # Frontend unit & integration tests (Node test runner + tsx)
└── backend/                    # Python 3.12 FastAPI Execution, Tutor & Persistence Service
    ├── app/
    │   ├── api/                # /api/execute, /api/compare, /api/security/audit, /api/tutor/*, /api/projects, /api/history, /api/learn/progress
    │   ├── execution/          # worker_entry.py, tracer.py, runner.py, serializer.py, explainer.py, error_formatter.py
    │   ├── storage/            # SQLite persistence (workspace_store.py)
    │   └── tutor/              # Gemini/OpenAI adapters, grounding engine, SQLite conversation store
    ├── tests/                  # 73 pytest unit, API, persistence & security tests
    ├── Dockerfile              # FastAPI backend container
    └── Dockerfile.runner       # Unprivileged Python 3.12 sandbox runner image
```

---

## Local Installation & Running Guide

### Prerequisites

- **Node.js** `>= 20.x` and `npm`
- **Python** `3.12`
- *(Optional, required for public production isolation)* **Docker Desktop / Docker Engine**

### 1. Configure Environment Variables

```bash
cp .env.example .env.local
cp .env.example backend/.env
```

Add `GEMINI_API_KEY` or `OPENAI_API_KEY` in `backend/.env` if you want live LLM cloud responses in `/tutor`. Without external keys, the AI Tutor automatically uses the built-in **Deterministic Execution-Trace Tutor** grounded in real runtime snapshots.

### 2. Start the Python 3.12 FastAPI Backend (`127.0.0.1:8000`)

```bash
cd backend
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Start the Next.js Frontend (`http://localhost:3000`)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Tests & Quality Checks

```bash
# 1. Backend unit, tracing, tutor, comparison, persistence & security tests (73 tests)
backend/.venv/bin/pytest backend/tests -v

# 2. Frontend unit tests (visualiser detectors, AI tutor grounding, Phase 5 catalogs & API)
npm test

# 3. TypeScript strict typecheck, ESLint & production build
npm run typecheck
npm run lint
npm run build
```

---

## Python Execution Security Audit & Production Readiness Notice

CODEFLOW AI enforces defense-in-depth controls inside [`backend/app/execution/worker_entry.py`](backend/app/execution/worker_entry.py) and [`backend/app/execution/runner.py`](backend/app/execution/runner.py):

1. **Zero In-Process Execution**: User Python code never executes inside Next.js or the FastAPI server process.
2. **Environment & Secret Scrubbing**: `os.environ.clear()` runs inside the worker before user code compiles or executes, and `_BACKEND_ROOT` is removed from `sys.path`, preventing access to `.env` secrets or application modules (`import app`).
3. **PEP 578 Audit Hook (`sys.addaudithook`)**:
   - Blocks all user `open()` file reads and writes (`_is_internal_importlib_open` only allows Python's internal stdlib module loader from `sys.base_prefix`).
   - Blocks network sockets (`socket.*`), subprocess spawning (`os.system`, `subprocess.*`, `os.fork`, `os.exec*`), dynamic library loading (`ctypes`, `dlopen`), and `sqlite3`.
4. **Strict Module Allowlist**: Only safe educational standard library modules (`math`, `collections`, `heapq`, `bisect`, `itertools`, `functools`, `typing`, `dataclasses`, `string`, `re`, `random`, `statistics`, `decimal`, `fractions`, `copy`, `enum`, `operator`) can be imported.
5. **Step, Recursion, Memory & Wall-Clock Caps**: Enforces a configurable step limit (default `500`, hard max `1500`), recursion depth limit (`60`), stdout cap (`24 KB`), POSIX `RLIMIT_CPU` / `RLIMIT_NPROC` / `RLIMIT_FSIZE`, and deterministic process-group termination (`os.killpg(pgid, SIGKILL)`) on timeout.
6. **Production Environment Guard (`CODEFLOW_ENV=production`)**:
   - When `CODEFLOW_ENV=production` is set, `ExecutionRunner.detect_mode()` **strictly requires** a reachable Docker daemon and the `codeflow-python-runner:3.12` sandbox image (`--network none --read-only --cap-drop ALL --security-opt no-new-privileges --pids-limit 32 --memory 128m --cpus 0.50 --user 65534:65534`), and guarantees `docker rm -f <container>` cleanup in a `finally` block.
   - It **refuses** to fall back to `development_subprocess` in production.

> **Important Security Verification Status**:
> While the Docker CLI is installed on the development machine, if the **Docker daemon is not running** on the host, live container execution cannot be verified in practice (`GET /api/security/audit` reports `docker_daemon_reachable: false`, `production_deployment_blocked: true`). **Do not expose `development_subprocess` mode to untrusted public internet traffic.** Before public multi-tenant deployment, start the Docker daemon, build `docker build -f backend/Dockerfile.runner -t codeflow-python-runner:3.12 ./backend`, and verify `GET /api/security/audit` returns `docker_isolation_verified: true` and `production_deployment_blocked: false`.
