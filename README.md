# Roblox Studio Academy

Modern full-stack educational platform for teaching game development with Roblox Studio.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeORM + SQLite
- **Authentication**: JWT-based auth with role-based access control

## Project Structure

```
eco_curriculum/
├── backend/               # NestJS backend (TypeScript)
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── students/      # Students module
│   │   ├── teachers/      # Teachers module
│   │   ├── admin/         # Admin module
│   │   ├── courses/       # Courses module
│   │   ├── progress/      # Progress tracking
│   │   ├── badges/        # Badge system
│   │   └── stats/         # Statistics
│   └── database.db        # SQLite database
│
└── frontend/              # Next.js frontend (TypeScript)
    ├── src/
    │   ├── app/           # App router pages
    │   │   ├── student/   # Student dashboard
    │   │   ├── teacher/   # Teacher dashboard
    │   │   └── admin/     # Admin dashboard
    │   ├── lib/           # API clients
    │   ├── store/         # Zustand state management
    │   └── types/         # TypeScript types
    └── public/            # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eco_curriculum
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You need to run both backend and frontend simultaneously:

#### Option 1: Using batch scripts (Windows)

**Terminal 1 - Start Backend:**
```bash
start-nestjs.bat
```

**Terminal 2 - Start Frontend:**
```bash
start-frontend.bat
```

#### Option 2: Manual start

**Terminal 1 - Backend (port 3400):**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend (port 3000):**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3400/api

### Default Login Credentials

**Admin:**
- Email: admin@robloxacademy.com
- Password: admin123

**Teacher:**
- Email: teacher@robloxacademy.com
- Password: teacher123

**Student:**
- Email: (any student email)
- PIN: (4-digit PIN assigned by teacher)

## Database Seeding

To populate the database with sample data:

```bash
cd backend
npm run seed
```

## Development

### Backend Development

```bash
cd backend
npm run start:dev    # Start with watch mode
npm run build        # Build for production
npm run test         # Run tests
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
```

## Architecture

### Backend (NestJS)

- **TypeORM**: Database ORM with SQLite
- **Passport JWT**: Authentication strategy
- **Class Validator**: DTO validation
- **Swagger**: API documentation (coming soon)

### Frontend (Next.js)

- **App Router**: Next.js 14 app directory structure
- **Zustand**: Lightweight state management
- **Axios**: HTTP client with interceptors
- **Tailwind CSS**: Utility-first CSS framework

## API Endpoints

### Authentication
- `POST /api/auth/login` - Teacher/Admin login
- `POST /api/auth/student-login` - Student PIN login

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details

### Progress
- `POST /api/progress` - Track student progress
- `GET /api/progress/student/:id` - Get student progress

### Stats
- `GET /api/stats/overview` - Get platform statistics

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - Educational Use Only
