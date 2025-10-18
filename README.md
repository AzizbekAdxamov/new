# Full Stack Task Manager

This project contains a simple full-stack task manager built with Node.js, Express, PostgreSQL, and a lightweight client application served with lite-server.

## Project structure

```
.
├── client/    # Front-end application (vanilla JS, served with lite-server)
└── server/    # Back-end API built with Express and PostgreSQL
```

## Requirements

- Node.js 18+
- PostgreSQL 13+

## Getting started

### 1. Database setup

1. Create a PostgreSQL database (for example, `tasks_db`).
2. Run the SQL script located at `server/sql/init.sql` to create the required tables and triggers:
   ```bash
   psql -d tasks_db -f server/sql/init.sql
   ```

### 2. Configure environment variables

Copy the sample environment file and fill in the database credentials:

```bash
cd server
cp .env.example .env
# update the values according to your environment
```

### 3. Install dependencies

From the `server` and `client` directories, install the dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

> **Note:** Package installation may require access to the public npm registry.

### 4. Run the applications

Start the API server:

```bash
cd server
npm run dev
```

By default the API runs on `http://localhost:4000`.

In a new terminal window start the client:

```bash
cd client
npm start
```

The client will be available on `http://localhost:3000` and communicates with the API at `http://localhost:4000/api`.

## API overview

The API exposes the following endpoints under `/api/tasks`:

- `GET /` – list tasks ordered by creation date.
- `POST /` – create a new task. Requires a `title` and optional `description`.
- `PUT /:id` – replace an existing task (title required).
- `PATCH /:id` – update one or more fields (`title`, `description`, `completed`).
- `PATCH /:id/complete` – mark a task as completed.
- `DELETE /:id` – delete a task.

All responses are JSON.

## Client overview

The client is a small vanilla JavaScript application that consumes the API. Features include:

- Creating tasks via the form.
- Listing tasks with real-time updates after CRUD operations.
- Editing and deleting tasks using dialog-based interactions.
- Toggling completion status.

The client expects the API to be available at `http://localhost:4000/api`. To point to another URL you can set a global configuration before loading `main.js`:

```html
<script>
  window.APP_CONFIG = { apiBaseUrl: 'https://your-api-host/api' };
</script>
<script type="module" src="main.js"></script>
```

## Development notes

- The project does not include database migrations beyond the initialization SQL file.
- Error handling is minimal and intended for demonstration purposes.
- Authentication is not implemented.
