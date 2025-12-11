# Docker Setup Guide

This guide explains how to run the React-NestJS-MySQL application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Project Structure

```
.
├── Dockerfile                 # Backend (NestJS) Dockerfile
├── docker-compose.yml         # Orchestrates all services
├── frontend/
│   ├── Dockerfile            # Frontend (React) Dockerfile
│   ├── nginx.conf            # Nginx configuration for serving React app
│   └── .dockerignore         # Frontend Docker ignore file
├── .dockerignore             # Backend Docker ignore file
└── .env.docker               # Docker environment variables
```

## Services

The application consists of three Docker services:

1. **MySQL Database** (`mysql`)
   - Image: `mysql:8.0`
   - Port: `3307:3306`
   - Database: `react_nest_app`
   - Credentials: root/root

2. **NestJS Backend** (`backend`)
   - Built from root Dockerfile
   - Port: `3000:3000`
   - Depends on MySQL
   - Runs Prisma migrations on startup
   - Includes authentication with bcrypt password hashing

3. **React Frontend** (`frontend`)
   - Built from frontend/Dockerfile
   - Port: `80:80`
   - Served by Nginx
   - Depends on Backend

## Quick Start

### Option 1: Using Makefile (Recommended)

```bash
# Production mode
make prod              # Build and start all services
make prod-logs         # View logs
make prod-down         # Stop services

# Development mode (with hot reload)
make dev               # Build and start in dev mode
make dev-logs          # View logs
make dev-down          # Stop services

# Other useful commands
make help              # Show all available commands
make clean             # Clean up everything
```

### Option 2: Using Docker Compose Directly

#### Production Mode

```bash
# Build and start
docker-compose up --build

# Stop
docker-compose down
```

#### Development Mode (with hot reload)

```bash
# Build and start
docker-compose -f docker-compose.dev.yml up --build

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Access the Application

**Production Mode:**
- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:3000
- **MySQL**: localhost:3307

**Development Mode:**
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3000
- **MySQL**: localhost:3307

### Default Login Credentials

After the initial setup, existing users in the database will have a default password:

- **Default Password**: `changeme`

**Example Users:**
- Email: `m1@test.com`, Password: `changeme`
- Email: `admin2@admin.cm`, Password: `changeme`
- Email: `m2@test.com`, Password: `changeme`

New users created through the registration form will use the password they provide during signup.

## Development Workflow

### Development vs Production

**Development Mode** (`docker-compose.dev.yml`):
- Hot reload enabled for both frontend and backend
- Source code mounted as volumes
- Faster iteration during development
- Frontend runs on Vite dev server (port 5173)

**Production Mode** (`docker-compose.yml`):
- Optimized builds
- Multi-stage Docker builds
- Frontend served by Nginx (port 80)
- Smaller image sizes

### Run in Detached Mode

```bash
# Production
make prod-up
# or
docker-compose up -d

# Development
make dev-up
# or
docker-compose -f docker-compose.dev.yml up -d
```

### View Logs

```bash
# Using Makefile
make logs          # Production logs
make dev-logs      # Development logs

# Using Docker Compose
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### Rebuild a Specific Service

```bash
# Rebuild backend
docker-compose up -d --build backend

# Rebuild frontend
docker-compose up -d --build frontend
```

### Execute Commands in Containers

```bash
# Using Makefile
make backend-shell     # Access backend container
make mysql-shell       # Access MySQL
make db-migrate        # Run Prisma migrations
make db-studio         # Open Prisma Studio

# Using Docker directly
docker exec -it nestjs-backend sh
docker exec -it mysql-db mysql -u root -proot react_nest_app
docker exec -it nestjs-backend npx prisma migrate dev
docker exec -it nestjs-backend npx prisma studio
```

## Environment Variables

### Backend (.env.docker)
```
DATABASE_URL="mysql://root:root@mysql:3306/react_nest_app"
PORT=3000
```

### Frontend (.env.production)
```
VITE_API_URL=http://localhost:3000
```

## Troubleshooting

### MySQL Connection Issues

If the backend can't connect to MySQL:
```bash
# Check MySQL health
docker-compose ps

# View MySQL logs
docker-compose logs mysql

# Restart MySQL
docker-compose restart mysql
```

### Frontend Can't Connect to Backend

1. Ensure backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify CORS settings in `src/main.ts`

### Port Already in Use

If ports 80, 3000, or 3307 are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "8080:80"    # Frontend
  - "3001:3000"  # Backend
  - "3308:3306"  # MySQL
```

### Clean Rebuild

```bash
# Stop all containers
docker-compose down -v

# Remove all images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Start services
docker-compose up
```

## Production Deployment

For production deployment:

1. Update environment variables
2. Use proper secrets management
3. Configure proper CORS origins
4. Use a reverse proxy (nginx/traefik)
5. Enable HTTPS
6. Set up proper logging and monitoring

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email and password, returns JWT token
  ```json
  Request:
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }

  Response:
  {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2025-12-11T00:00:00.000Z",
    "updatedAt": "2025-12-11T00:00:00.000Z",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Users
- `POST /users` - Create new user (requires password, no authentication required)
  ```json
  {
    "email": "user@example.com",
    "name": "User Name",
    "password": "yourpassword"
  }
  ```
- `GET /users` - Get paginated users (requires JWT authentication)
  - Query parameters:
    - `page` (optional): Page number (default: 1)
    - `limit` (optional): Number of users per page (default: 10)
    - `cursor` (optional): Cursor-based pagination using user ID
  - Response includes:
    - `data`: Array of users
    - `meta`: Pagination metadata (total, page, limit, hasMore, nextCursor)
- `GET /users/:id` - Get user by ID (requires JWT authentication)
- `PATCH /users/:id` - Update user (requires JWT authentication, password optional)
- `DELETE /users/:id` - Delete user (requires JWT authentication)

**Note**: All user endpoints except `POST /users` require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Features

### Security
- **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **Password Exclusion**: Passwords are never returned in API responses
- **JWT Authentication**: Secure token-based authentication with 1-day expiration
- **Protected Endpoints**: User management endpoints require valid JWT token
- **Token Validation**: JWT tokens are validated on every protected request
- **Validation**: Email uniqueness and required fields are enforced

### Performance
- **Pagination**: Backend supports pagination with configurable page size
- **Page Navigation**: Frontend implements traditional pagination with page controls
- **Efficient Loading**: Users are loaded page by page (10 per page by default)
- **Optimized Queries**: Database queries use skip/take for efficient data retrieval
- **Smart Page Display**: Shows current page, adjacent pages, and first/last pages with ellipsis

## Notes

- The MySQL data is persisted in a Docker volume named `mysql_data`
- Frontend is built as a static site and served by Nginx
- Backend runs in production mode
- Prisma migrations run automatically on backend startup
- User passwords are securely hashed and never exposed in API responses
- Existing users migrated from previous versions have the default password `changeme`

