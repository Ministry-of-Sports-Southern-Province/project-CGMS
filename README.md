# ClubSCM

ClubSCM is a full-stack web application for managing student clubs, users, grades, and dashboards. It features a modern React frontend, a Node.js/Express backend, and a relational SQL database. The system supports authentication, user management, club management, and grade tracking, providing a seamless experience for both administrators and users.

## Features
- User authentication and authorization
- Club management (CRUD operations)
- User and profile management
- Grade entry and listing
- Dashboard with analytics
- Audit logging
- Responsive UI with Tailwind CSS

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** SQL (schema and seed files included)

## Project Structure
- `frontend/` — React app (UI, pages, components)
- `backend/` — Express server, routes, middleware, utilities
- `database/` — SQL schema and seed scripts
- `uploads/` — File uploads (if any)

## Setup Instructions

### 1. Database
- Run the SQL scripts in `database/schema.sql` and `database/seed.sql` to set up and seed the database.

### 2. Backend
- Navigate to `backend/`
- Install dependencies: `npm install`
- Start server: `npm start` or `node src/index.js`

### 3. Frontend
- Navigate to `frontend/`
- Install dependencies: `npm install`
- Start dev server: `npm run dev`

## Usage
- Access the frontend at `http://localhost:5173` (default Vite port)
- Backend runs on `http://localhost:3000` (default Express port)

## License
See [LICENSE](LICENSE) for details.
