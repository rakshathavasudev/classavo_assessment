# MiniLMS — A Simple Learning Management System

A full-stack Learning Management System with two roles — **Instructor** and
**Student**. Instructors create courses and chapters (authored with the
**Plate.js** rich-text editor) and control each chapter's visibility. Students
browse courses, join them, and read the chapters an instructor has marked
public.

**Stack:** Django REST Framework (backend) · React + Vite (frontend) ·
SQLite · JWT authentication.

---

## Features

### Instructor
- Create and manage courses.
- Create, edit, and delete chapters within a course.
- Author chapter content with the **Plate.js** editor (bold / italic /
  underline / inline code). Content is stored as Plate's native JSON document.
- Mark each chapter **public** or **private**.

### Student
- View the list of available courses.
- Join (enrol in) any course.
- Read chapters an instructor has marked **public**. Private chapters are never
  exposed — they are filtered out of the API response *and* blocked on direct
  access (HTTP 403).

---

## Project structure

```
classavo_assessment/
├── backend/                 # Django + DRF API
│   ├── lms_backend/         # project settings & root urls
│   ├── accounts/            # custom User model (role), JWT auth endpoints
│   ├── courses/             # Course / Chapter / Enrollment + API
│   │   └── management/commands/seed.py   # demo data
│   └── requirements.txt
└── frontend/                # React + Vite SPA
    └── src/
        ├── api/client.js          # axios instance + JWT interceptor
        ├── auth/AuthContext.jsx   # auth state / login / register
        ├── components/PlateEditor.jsx  # Plate.js editor (edit + read-only)
        └── pages/                 # login, dashboard, course & chapter views
```

---

## Quick start with Docker

If you have Docker installed, the whole stack comes up with one command:

```bash
docker compose up --build
```

- Frontend → **http://localhost:5173**
- Backend API → **http://localhost:8000/api**

The backend container runs migrations and seeds the demo data automatically on
start. (To run it manually instead, follow the two-terminal setup below.)

---

## Getting started (without Docker)

You need **Python 3.10+** and **Node 18+**. Run the backend and frontend in two
terminals.

### 1. Backend (Django REST API) — http://localhost:8000

```bash
cd backend

# create & activate a virtual environment
python -m venv venv
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate
python manage.py seed          # creates demo users + a sample course
python manage.py runserver
```

### 2. Frontend (React + Vite) — http://localhost:5173

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** and log in.

### Demo accounts (created by `manage.py seed`)

| Role       | Username     | Password      |
|------------|--------------|---------------|
| Instructor | `instructor` | `password123` |
| Student    | `student`    | `password123` |

You can also register a brand-new instructor or student from the **Register**
page.

---

## Running the tests

The backend ships with a DRF test suite covering authentication, role
permissions, chapter visibility, and enrollment:

```bash
cd backend
python manage.py test
```

```
Ran 20 tests ... OK
```

---

## Architecture

### Authentication & roles
- A custom `User` model (`accounts.User`) adds a `role` field
  (`instructor` | `student`).
- Auth uses **JWT** (`djangorestframework-simplejwt`). The frontend stores the
  access token in `localStorage` and attaches it via an axios request
  interceptor; a 401 clears the session and redirects to login.
- Role is embedded in the login response so the SPA can route immediately and
  show role-appropriate navigation.

### Authorization (where visibility is enforced)
Visibility and ownership are enforced **on the server**, not just hidden in the
UI:
- `IsInstructor` — only instructors may create/update courses and chapters.
- `IsCourseOwnerOrReadOnly` — an instructor may only modify *their own*
  courses/chapters.
- Chapter querysets filter out private chapters for everyone except the owning
  instructor, and direct access to a private chapter returns **403**.
- Students may `join` / `leave` a course; instructors cannot enrol.

### Plate.js content model
Chapter content is stored in a `JSONField` as Plate's native document value
(an array of nodes, e.g. `[{ "type": "p", "children": [{ "text": "..." }] }]`).
The same `PlateEditor` component renders in two modes:
- **editable** for instructors (with a formatting toolbar), emitting the JSON
  value on change;
- **read-only** for students, rendering the stored JSON as formatted content.

This means rich text round-trips losslessly through the API with no HTML
parsing or sanitisation needed.

---

## API reference

All endpoints are under `/api/`. Authenticated requests send
`Authorization: Bearer <access-token>`.

| Method | Endpoint | Who | Description |
|--------|----------|-----|-------------|
| POST | `/api/auth/register/` | anyone | Register (`role`: instructor/student) |
| POST | `/api/auth/login/` | anyone | Obtain JWT access + refresh tokens |
| POST | `/api/auth/login/refresh/` | anyone | Refresh an access token |
| GET  | `/api/auth/me/` | authed | Current user |
| GET  | `/api/courses/` | authed | List courses (`?mine=true` / `?mine=enrolled`) |
| POST | `/api/courses/` | instructor | Create a course |
| GET  | `/api/courses/{id}/` | authed | Course detail + visible chapters |
| PATCH/DELETE | `/api/courses/{id}/` | owner | Update / delete |
| POST | `/api/courses/{id}/join/` | student | Enrol in the course |
| POST | `/api/courses/{id}/leave/` | student | Leave the course |
| GET  | `/api/courses/{id}/chapters/` | authed | List chapters (public-only for non-owners) |
| POST | `/api/courses/{id}/chapters/` | owner | Create a chapter |
| GET  | `/api/courses/{id}/chapters/{cid}/` | authed | Read a chapter (403 if private & not owner) |
| PUT/PATCH/DELETE | `/api/courses/{id}/chapters/{cid}/` | owner | Update / delete |

The Django admin is available at `/admin/` (create a superuser with
`python manage.py createsuperuser`).
