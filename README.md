# HMCTS Task Management System

A full-stack task management system built for HMCTS caseworkers to efficiently manage their tasks. This project implements the [DTS Developer Technical Test](https://github.com/hmcts/dts-developer-challenge) with production-grade validation, error handling, authentication and a clean, component-based frontend.

## 🚀 Features

### Backend API
- **RESTful API** with Express.js and TypeScript
- **CRUD Operations** for task management (create, read, update, delete)
- **Edit Task Content** (title and description) and update status
- **Authentication** with JWT and **Authorization** (role-aware middleware)
- **Per-user data**: tasks are scoped to the authenticated user
- **Validation** using express-validator with structured error responses
- **Error Handling** with centralized custom middleware
- **Security**: CORS, Helmet, rate limiting
- **Unit Tests** with Mocha, Chai, Supertest

### Frontend Application
- **React 18 + TypeScript** UI
- **Authentication UI**: login/register with meaningful validation messages
- **Profile Update UI**: update name and email
- **Task Management**: create, edit content, delete, update status (including CANCELLED and Reopen)
- **Pagination & Filtering** by status
- **Task Statistics** panel (total, pending, in progress, completed, cancelled)
- **Component-based architecture** with `useTasks` hook and smaller task components
- **Frontend Tests** with Jest + React Testing Library (core task components)

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **PostgreSQL** with **Prisma ORM** (SQLite used for tests)
- **JWT** (`jsonwebtoken`) and **bcryptjs` for auth
- **express-validator**, **helmet**, **cors**, **express-rate-limit**
- **Mocha**, **Chai**, **chai-http** for tests

### Frontend
- **React 18** + **TypeScript** (Create React App)
- **Axios** for HTTP
- **Jest** + **React Testing Library** for tests

## 📋 API Endpoints

### Auth
| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user and get token | `{ name, email, password, role? }` |
| `POST` | `/api/auth/login` | Authenticate user and get token | `{ email, password }` |
| `PUT`  | `/api/auth/profile` | Update current user's profile | `{ name?, email? }` |

### Tasks (all require Authorization: `Bearer <token>`)
| Method | Endpoint | Description | Parameters / Body |
|--------|----------|-------------|-------------------|
| `GET` | `/api/tasks` | List tasks (pagination + optional status filter) | Query: `page`, `limit`, `status` |
| `GET` | `/api/tasks/stats` | Task statistics for current user | - |
| `GET` | `/api/tasks/:id` | Get a specific task | Param: `id` |
| `POST` | `/api/tasks` | Create a new task | `{ title, description? }` |
| `PUT` | `/api/tasks/:id` | Update task content or status | `{ title?, description?, status? }` |
| `DELETE` | `/api/tasks/:id` | Delete a task | Param: `id` |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health status |

### Task Status Values
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/Gr8Dev247/HMCTS-Task-Management-System.git
```

### 2. Install Dependencies
```bash
# One-shot setup from root
npm run setup
```

### 3. Database Setup

#### Create PostgreSQL Database (for the application)
```sql
CREATE DATABASE task_management;
```

#### Environment Configuration
```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit backend/.env with your values
DATABASE_URL="postgresql://username:password@localhost:5432/task_management?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=replace-with-a-strong-secret
```

#### Initialize Database
```bash
cd backend
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
```

### 4. Start the Application

#### Development Mode (Backend + Frontend)
```bash
# From root directory
npm run dev
```

#### Start Backend Only
```bash
cd backend
npm run dev
```

#### Start Frontend Only
```bash
cd frontend
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Testing

### Backend Tests (Mocha + Chai)
```bash
cd backend
npm test              # Run all tests (uses SQLite test schema)
npm run test:watch    # Watch mode
```

Backend tests use a dedicated SQLite schema defined in `backend/prisma/schema.test.prisma` (output Prisma client to a separate path) and a local `file:./test.db`. 

### Frontend Tests (Jest + RTL)
```bash
cd frontend
npm test                  # Run tests
npm test -- --coverage    # With coverage
```

## 📦 Production Build (Optional)

### Build Both Applications
```bash
npm run build
```

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
```

## 🗄 Database Schema (Prisma)

The database includes `User` and `Task` models; tasks are associated with a `User`.

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      String   @default("caseworker")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tasks     Task[]

  @@map("users")
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  status      TaskStatus @default(PENDING)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("tasks")
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

## 🔒 Security

- Input validation on all endpoints
- SQL injection protection via Prisma
- CORS configuration
- Rate limiting and security headers (Helmet)
- JWT-based auth, password hashing with bcrypt

## 📝 Development Guidelines

### Code Style
- TypeScript for type safety
- Component-based architecture on the frontend

### Testing Strategy
- Unit tests for backend services and routes
- Component tests for core React components

### Error Handling
- Centralized error handling in backend
- User-friendly error messages in frontend (including validation details)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for HMCTS caseworkers**
