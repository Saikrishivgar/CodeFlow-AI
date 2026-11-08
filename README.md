# CODEFLOW AI

> **Understand Every Line. Visualize Every Step.**

CODEFLOW AI is an interactive programming learning and visualization platform designed to make control flow, variable state, recursion, and data structures visible step by step.

## Completed Phases

### Phase 1 — Frontend Foundation, Landing Page & Dashboard
- **Design System & Tokens**: Semantic CSS custom properties (`background`, `surface-1..3`, `border`, `accent` tokens, elevation shadows, typography scale) with persistent **Dark (default)** and **Light** themes.
- **Landing Page (`/`)**: Responsive navbar, interactive storyboard Hero preview, Problem & Solution breakdown, 6 Feature cards, 4-Step workflow, 5-Structure Visualization Showcase (`Tabs`), Language Roadmap, CTA, and Footer.
- **Application Dashboard (`/dashboard`)**: Collapsible responsive sidebar (`⌘B`), global command search (`⌘K`), honest local/demo-labeled Statistics, 9 Quick Start DSA cards, local CRUD Recent Projects table (`Open`, `Rename`, `Duplicate`, `Delete`), Learning Progress tracker, and Quick Actions.
- **Core Application Routes**: `/workspace`, `/projects`, `/algorithms`, `/learn`, `/comparison`, `/history`, `/tutor`, and `/settings`.

### Phase 2 — Interactive Code Workspace & Python 3.12 Execution Engine
- **Professional IDE Workspace (`/workspace`)**:
  - **Monaco Editor** (`@monaco-editor/react` loaded from local static bundle `/public/monaco/vs`) with Python syntax highlighting, dark/light themes, code folding, bracket matching, font customization, active execution line highlight, and gutter indicator.
  - **Execution Transport & Visual Timeline**: `Run` (`⌘/Ctrl+Enter`), `Step Forward` (`F10`), `Step Backward` (`Shift+F10`), `Auto Play` (`0.5x`, `1x`, `1.5x`, `2x`), `Reset` (`⌘/Ctrl+Shift+R`), and interactive clickable step scrubber.
  - **"What's Happening?" Panel**: Deterministic rule-based beginner explanations derived from AST structure and live variable state changes.
  - **Variable Inspector**: Tracks created, modified, and removed variables, distinguishes local vs. global scopes, preserves `ref#N` object identity/aliases, and expands nested lists, dicts, tuples, sets, deques, and objects.
  - **Execution Output Dock**: Synchronized `Output`, `Execution Trace`, and beginner-friendly `Errors` tabs.
  - **Sample Program Library**: 22 tracer-verified Python programs across *Python Basics*, *DSA*, and *Advanced*.
- **FastAPI Python 3.12 Execution Backend (`backend/`)**:
  - `POST /api/execute` and `GET /api/health` powered by `sys.settrace` frame inspection, cycle-safe variable serialization, and isolated worker execution.

## Security Notice (Execution Isolation)

- **Preferred Production Sandbox**: Containerized Docker runner (`backend/Dockerfile.runner`) with `--network none`, `--read-only`, `--cap-drop ALL`, `--security-opt no-new-privileges`, memory limits, and PID caps (`CODEFLOW_EXECUTION_MODE=docker` or `auto`).
- **Local Development Mode**: When Docker is not running locally, `auto` falls back to a clearly marked **`development_subprocess`** runner (`python3 -I` isolated subprocess, ephemeral temp directory, POSIX resource limits, wall-clock `SIGALRM` + process-group `SIGKILL` timeouts, step/output caps, and PEP 578 `sys.addaudithook` restrictions). **Ordinary subprocess isolation is NOT a kernel security boundary — never expose `development_subprocess` mode publicly.**

## Getting Started

### 1. Start the FastAPI Python 3.12 Backend

```bash
cd backend
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Run backend tests:

```bash
backend/.venv/bin/pytest backend/tests -v
```

### 2. Start the Next.js Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000/workspace` for the Interactive Execution IDE or `http://localhost:3000/dashboard` for the Application Dashboard.
