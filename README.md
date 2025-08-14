# � Graduation Card & Guestbook Web App ✨

An interactive graduation invitation & guestbook platform. Create a personalized invitation space, manage a guest list with images, collect heartfelt messages in a flip‑book style guestbook, and share custom links for each guest. Secure authentication, JWT-based sessions, and email flows support a smooth experience for both hosts and invitees.

---

## Features

### 📝 Host (User) Features
- Guest management (create, edit, delete guests; batch delete; attach multiple images per guest).
- Custom invitation pages per guest via route: `/invite/<username>/<nickname>` (underscores in nickname become spaces).
- Manage guestbook entries you authored (add, edit, delete) with optional image.
- View full guestbook in animated flip‑book interface.
- Personal profile & basic account settings (email verified before full access).

### 🧑‍🤝‍🧑 Guest (Public) Features
- Access invitation page via shared link (no login needed for viewing).
- Submit a guestbook entry (message + optional image) directly to the host’s book.
- Browse previously submitted guestbook pages.

### � Guestbook Experience
- Flip‑book UI (powered by `react-pageflip`) paginates entries (2 entries per sheet) with cover & closing page.
- Auto image preview and removal before submission.
- Chronological rendering (oldest first for narrative flow).

### 🔐 Authentication & Security
- Email + password registration with uniqueness & validation.
- Email verification via code + confirm token.
- JWT access & refresh token pair (refresh endpoint provided).
- Logout invalidates active access token (blacklisting / revocation support).
- Password complexity & length validation.

### 📤 Media Handling
- Image uploads for guests & guestbook entries (processed from multipart form data).
- Pluggable storage layer (Firebase helper integration present in backend utilities).


---

## 🔧 Technologies Used

### Frontend
- ⚛️ React (Vite toolchain)
- React Router DOM (dynamic invitation & dashboard routes)
- Context-based Auth state management
- Axios (API client abstraction in `services/`)
- `react-pageflip` (interactive book animation)
- Modern CSS modules / component styles

### Backend
- � Flask (REST API & blueprints per domain)
- SQLAlchemy ORM & Alembic migrations
- JWT-based auth (custom middleware `JWT_required`)
- Dependency Injection container (`core/di_container.py` + `AppConfig/di_setup.py`)
- Email templating (HTML + TXT) for verification & password reset
- Optional Celery/RabbitMQ scaffold (present, can be enabled for async emailing)
- Firebase helper integration for object storage (images)

### Data
- Relational database (designed for guest, guestbook, user, role, token, blacklist, login attempt entities)

---

## 🌍 System Architecture

![System Architecture](docs/architecture.png)

High-level request flow:
1. Client (React SPA) issues JSON or multipart requests.
2. Flask blueprints route to Controller classes (Auth / Invitation / GuestBook / User / Health).
3. Controllers delegate to Services for business logic (validation, orchestration, token lifecycle, upload coordination).
4. Services rely on Repositories (encapsulating SQLAlchemy models & queries) for persistence.
5. DI container wires concrete repositories & services at startup (`AppConfig/di_setup.py`).
6. Middleware validates JWT & injects `user_id` into protected requests.
7. Responses are serialized via model `as_dict()` helpers; localized messages embedded where required.
8. (On proccessing) Async tasks (e.g., large email batches) can be offloaded to Celery workers when enabled.

Image/file handling enters via multipart form endpoints (guests, guestbook) → service layer → storage helper → persistent URLs saved in DB.

---

## 📊 Entity Relationship Diagram (ERD)
![Entity Relationship Diagram](docs/ERD.png)
*Entity relationship diagram showing the database structure with User, Role, Token, Guest, GuestImage, and GuestBookEntry entities and their relationships*

---

## ⚙️ Installation and Setup

### Prerequisites
- Python ≥ 3.9
- PostgreSQL (connection string for SQLAlchemy)
- (Optional) RabbitMQ + Celery if enabling async workers
- Firebase project (if using remote image storage) or local storage fallback
- Node.js (for client)

### Clone Repository
```bash
git clone https://github.com/phongnickchinh/Graduation-card-react-flask.git
cd Graduation-card-react-flask
```

### Backend Setup (`server/`)
```bash
cd server
python -m venv venv
venv\Scripts\activate  # Windows
# Or: source venv/bin/activate  (macOS/Linux)
pip install -r requirements.txt
```
Copy `.env.example` → `.env` and fill values:
```
DATABASE_URL=postgresql+psycopg2://user:pass@host:port/db
JWT_SECRET=...
FIREBASE_CREDENTIALS_PATH=...
EMAIL_SENDER=...
EMAIL_SMTP_SERVER=...
# etc.
```
Run migrations:
```bash
flask db upgrade
```
Start API:
```bash
python run.py
```

### (Optional) Celery Worker
```bash
celery -A app.celery worker --loglevel=info
```

### Frontend Setup (`client/`)
```bash
cd ../client
npm install
npm run dev
```
Client dev server defaults (Vite) to a localhost port (e.g., 5173). Configure API base URL in environment (`.env`, `.env.example`).
---

## Run Application Using Docker Compose (Not ready)
<!-- This project currently does not include a `docker-compose.yml` in the repository root. To containerize, create one that wires:
* Flask API + environment (.env)
* PostgreSQL service (with volume)
* (Optional) RabbitMQ + Celery worker
* React build (served via Nginx) or dev container

Placeholder example snippet (not yet committed):
```yaml
version: "3.9"
services:
   api:
      build: ./server
      env_file: ./server/.env
      ports:
         - "5000:5000"
      depends_on:
         - db
   db:
      image: postgres:15
      environment:
         POSTGRES_USER: user
         POSTGRES_PASSWORD: pass
         POSTGRES_DB: gradcard
      volumes:
         - db_data:/var/lib/postgresql/data
   # worker & frontend services can be added similarly
volumes:
   db_data:
```
Add such a file then run:
```bash
docker compose up -d
``` -->
---

## 🔄 Usage
1. Register an account & verify email (receive code, call verify endpoint via UI).
2. Log in → redirected to your dashboard (guest management route).
3. Create guests (optional images). Share personalized invitation link.
4. View guestbook: flip through pages; toggle add form on last page.
5. Public visitors submit messages/images without logging in (by username route) — entries appear in book.
6. Edit or delete your guestbook entries / guests as needed.
7. Logout to invalidate current access token (refresh requires stored refresh token).

---

Happy celebrating and capturing memories! 🎉
<!-- This section show screenshot of project-->
## Capture Images
1. Login screen:
![Login Screen](docs/screenshots/login.png)

2. Guest creation:
![Guest Invitation](docs/screenshots/guest_creation.png)

3. Guestbook view:
![Guestbook View](docs/screenshots/guestbook_view.png)

4. Guest Invitation Management:
![Guest Invitation Management](docs/screenshots/guest_invitation_mn.png)

5. Guestbook management:
![Guestbook Management](docs/screenshots/guestbook_mn.png)
