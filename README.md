# Medical Utility Companion

A web application that helps users find drug equivalents when traveling, get medicine recommendations based on symptoms, and calculate personalized dosage information.

## App Summary

The Medical Utility Companion solves the problem of finding equivalent medicines when users travel abroad or move between countries. Prescription and over-the-counter drug names, formulations, and availability differ across regions, making it difficult to know which local product corresponds to a familiar medicine. The primary users are travelers, expatriates, and anyone who needs to find a substitute for a medication in a different country. The product provides three core tools: a Drug Equivalent finder (search by medicine and countries), a Symptom Search (recommendations based on symptoms), and a Dosage Finder (personalized dosing based on age, weight, and gender). This positions the app as a trusted medical utility companion for international health decisions.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL |
| **Build/Dev** | npm, concurrently (for running frontend + backend) |
| **Auth** | JWT (jsonwebtoken), bcrypt for password hashing |
| **External** | None |

## Architecture Diagram

```
┌──────────┐      HTTP/JSON       ┌─────────────┐      SQL       ┌────────────┐
│   User   │ ◄──────────────────► │   Frontend  │ ◄────────────► │  Backend   │
│ (Browser)│                      │ (React/Vite)│   /api/*       │ (Express)  │
└──────────┘                      └─────────────┘                └─────┬──────┘
      │                                    │                           │
      │                                    │   Proxy /api               │
      │                                    │   (dev only)               │
      └────────────────────────────────────┴───────────────────────────┘
                                                           │
                                                           ▼
                                                   ┌───────────────┐
                                                   │  PostgreSQL   │
                                                   │   Database    │
                                                   └───────────────┘
```

- **User → Frontend**: User interacts with the React app in the browser.
- **Frontend → Backend**: The frontend sends API requests (e.g., POST /api/drug-equivalent) to the backend. In development, Vite proxies `/api` to the Express server.
- **Backend → Database**: The backend uses the `pg` client to run SQL and update/query PostgreSQL.

## Prerequisites

- **Node.js** (v18 or later) — [Install](https://nodejs.org/)
- **PostgreSQL** (v14 or later) — [Install](https://www.postgresql.org/download/)
- **psql** (included with PostgreSQL, must be in system PATH)

Verify installations:

```bash
node -v
npm -v
psql --version
```

## Installation and Setup

### 1. Clone and install dependencies

```bash
git clone <https://github.com/j-roylance/IS401-4-15-Milestone-06.git>
cd IS401-4-15-Milestone-06
npm install
```

### 2. Create the database

```bash
createdb medical_utility
```

If `createdb` is not available, use:

```bash
psql -U postgres -c "CREATE DATABASE medical_utility;"
```

If you see a `Password:` prompt here, it is asking for your **PostgreSQL user password** (for the DB role you are using, usually `postgres`), not the app login password.

### 3. Configure environment variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and set your database URL:

```
DATABASE_URL=postgresql://localhost:5432/medical_utility
```

If your DB requires a user/password, use:

```
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/medical_utility
```

Adjust the connection string for your PostgreSQL user, password, host, and port.

### Passwords used in this project

| Prompt/Use Case | What to enter |
|-------|-------|
| `Password:` shown by `psql`/`createdb` | Your PostgreSQL DB user password (often `postgres`) |
| App login at `http://localhost:8080` | `demo` / `demo123` |

### 4. Run schema and seed SQL files

```bash
psql -d medical_utility -f db/schema.sql
psql -d medical_utility -f db/seed.sql
```

On Windows or if using a specific user:

```bash
psql -U postgres -d medical_utility -f db/schema.sql
psql -U postgres -d medical_utility -f db/seed.sql
```

If you see a `Password:` prompt in these commands, enter the password for that PostgreSQL user (for example, the password you set for `postgres` during PostgreSQL installation).

### 5. Create/update the demo app user

```bash
npm run seed:user
```

The `seed:user` script creates or updates the demo account with a hashed password (see **Sign In** below).

## Running the Application

### Option A: Run frontend and backend together

```bash
npm run dev:all
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3001

### Option B: Run in separate terminals

Terminal 1 (backend):

```bash
npm run dev:server
```

Terminal 2 (frontend):

```bash
npm run dev
```

Open **http://localhost:8080** in your browser.

## Sign In (Demo Account)

The app requires you to sign in. Use this demo account:

| Field | Value |
|-------|-------|
| **Username** | `demo` |
| **Password** | `demo123` |

1. Open http://localhost:8080 — you will be redirected to the login page.
2. Enter **demo** / **demo123** and click **Sign in**.
3. You will be redirected to the home page. The header shows "Logged in as demo" and a **Log out** button.

> **Note:** The demo user is created when you run `npm run seed:user` after seeding the database. If login fails, ensure you ran `seed:user`.

## Troubleshooting Setup

- `FATAL: password authentication failed for user "..."`
  - You entered the wrong PostgreSQL password. Retry with the DB user's password (not `demo123` unless you explicitly set your DB password to that).
- `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`
  - Your `.env` `DATABASE_URL` is missing a DB password (or has an empty one). Set it to `postgresql://DB_USER:DB_PASSWORD@localhost:5432/medical_utility`, then rerun `npm run seed:user`.
- `FATAL: role "postgres" does not exist`
  - Your PostgreSQL user is not named `postgres`. Replace `-U postgres` with your actual DB username.
- You do not know your PostgreSQL password
  - Use the password set during PostgreSQL installation, or reset it by logging in as a superuser and running `ALTER USER postgres WITH PASSWORD 'new_password';`.
- `database "medical_utility" already exists`
  - This is safe. Skip database creation and continue with schema/seed commands.
- `'psql' is not recognized as an internal or external command` (Windows)
  - PostgreSQL `bin` is not in PATH. Reopen terminal after install or add PostgreSQL `bin` (for example `C:\Program Files\PostgreSQL\16\bin`) to PATH.
- `relation "user" does not exist` when running `npm run seed:user`
  - Run `psql ... -f db/schema.sql` first, then `db/seed.sql`, then `npm run seed:user`.

## Verifying the Vertical Slice

The **Find Equivalent** button demonstrates the full vertical slice: frontend → backend → database → response → UI, with persistence after refresh.

### Steps to verify

1. Start the app with both frontend and backend: `npm run dev:all`.
2. Open http://localhost:8080. Sign in with **demo** / **demo123** if prompted.
3. Click **Search Drug Equivalents** (or go to `/drug-equivalent`).
4. Select a medicine (e.g., **Paracetamol**), your country (e.g., **United States**), and target country (e.g., **United Kingdom**).
5. Click **Find Equivalent**.
6. Confirm the equivalent result appears (name, strength, dosage info) and that **"Viewed 1 time"** (or higher) is shown.
7. **Verify persistence**: Refresh the page (F5), repeat the same search (Paracetamol, US → UK), and click **Find Equivalent** again.
8. The view count should increment (e.g., **"Viewed 2 times"**), confirming the database was updated and the change persists.
9. Optional: Run `psql -d medical_utility -c "SELECT equivalent_relationship_id, source_country_medicine_id, target_country_medicine_id, view_count FROM country_medicine_equivalent;"` to see the updated `view_count` in the database.


**For Grading Purposes**
- Database querying: drug equivalent search
- Database updating: login (authenticates against `user` table), Find Equivalent (updates `view_count`), register (creates user), clicking on the user profile allows updating of user data.
- Dummy account: username: demo, password: demo123 
