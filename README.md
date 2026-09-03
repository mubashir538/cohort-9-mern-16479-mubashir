# cohort-9-mern-16479-mubashir
Cohort 9: MERN (NodeJS+ReactJS) assignment for Mubashir Ahmed

# Notes App

Created a full-stack notes application with React Js and Node Js with the features of user authentication, Notes Creation, pinning, color highlights, tokenized search, and sorting built as a learning project for 10 Pearls Internship covering the MERN Stack and TypeScript stack, backend development, and a real Github PR based workflow with automated code rabbit ai review.

## Features

- **Authentication**: Created the signup, login, logout features using JWT stored HttpOnly cookie
- **Notes CRUD**: create, read, update, and delete notes, and only owner can access his notes
- **Rich text editing**: notes support formatted content through a WYSIWYG editor
- **Pin notes**: pinned notes will always show on top of the dashboard, regardless of the sorting order
- **Highlight colors**: You can assign a color to a note from a default palette or choose a custom color picker, text contrast is automatically set to light or dark colors so labels stay readable against any background color
- **Smart search**: searching splits your query into words (including camelCase, hyphenated, and underscored texts) and matches them with a note's title or content: e.g. searching "codingGuy" matches notes containing either "coding" or "Guy"
- **Sorting**: It sorts the dashboard by recently updated, oldest, newest, or title (A–Z or Z–A)
- **Profile page**: You can view your account details and log out

## Tech Stack

**Backend**
- Node.js + Express 5 (TypeScript)
- MongoDB + Mongoose
- JWT authentication via HttpOnly cookies
- bcrypt password hashing (cost factor 12, with automatic upgrade of any legacy weak cost hashes on login)
- Zod for runtime request validation
- Pino for structured logging
- Helmet for security headers, express-rate-limit on auth endpoints
- Mocha + Chai + Sinon + Supertest for backend testing

**Frontend**
- React + TypeScript
- React Router for client-side routing
- Axios for API calls
- A rich text editor for note content

**Code Quality**
- CodeRabbit for automated PR review
- SonarQube (self-hosted via Docker) for static analysis and test coverage reporting


## Getting Started

### Prerequisites
- Node.js 22+
- MongoDB
- Docker

### 1. Clone and install

```bash
git clone <repo-url>
cd notes-app

cd backend
npm install

cd ../frontend/notes-app
npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

MONGODB_URI=<Your URI >
JWT_SECRET=long_random_string
JWT_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:5173
```

### 3. Run it

```bash
# Terminal 1 — backend
cd backend
npm run dev

# Terminal 2 — frontend
cd frontend/notes-app
npm run dev
```

The frontend will be available at the URL Vite prints (typically `http://localhost:5173`), and the backend API at `http://localhost:3000`.

## Testing

### Backend
```bash
cd backend
npm test
```
Runs the full Mocha/Chai/Sinon/Supertest suite  unit tests for services (with the database mocked) and integration tests hitting real Express routes with the service layer stubbed.

For a coverage report:
### Backend
```bash
cd backend
npm run test:coverage
```

### Frontend
```bash
cd frontend/notes-app
npm test
```

## Static Analysis (SonarQube)

SonarQube runs locally via Docker for this project:

```bash
docker compose up -d
```

```bash
npx sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=YOUR_TOKEN
```

Results appear on the project dashboard at `localhost:9000`.

