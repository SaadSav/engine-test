# engine-test

A containerized Node.js application with PostgreSQL and Redis, built with Docker and Docker Compose for easy local development and deployment.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker**: Version 20.10 or higher
  - [Install Docker Desktop](https://www.docker.com/products/docker-desktop) (macOS/Windows)
  - [Install Docker Engine](https://docs.docker.com/engine/install/) (Linux)
- **Docker Compose**: Version 2.0 or higher (included with Docker Desktop)
  - Verify installation: `docker --version` and `docker compose version`

### System Requirements

- **RAM**: Minimum 4GB available for Docker
- **Disk Space**: At least 2GB free for images and volumes
- **CPU**: Multi-core processor recommended for running multiple containers

## Quick Start

### Building and Running Containers

1. **Start all services** (builds images if needed):
   ```bash
   docker compose up -d
   ```

2. **Build images without starting**:
   ```bash
   docker compose build
   ```

3. **Rebuild and restart services**:
   ```bash
   docker compose up -d --build
   ```

4. **Stop all services**:
   ```bash
   docker compose down
   ```

5. **Stop and remove volumes** (deletes all data):
   ```bash
   docker compose down -v
   ```

## Docker Compose Services

The application consists of three interconnected services:

### 1. **app** - Main Application
- **Base Image**: `node:20-alpine`
- **Container Name**: `engine-test-app`
- **Port**: `3000` (mapped to host:3000)
- **Purpose**: Runs the Node.js application server
- **Features**:
  - Multi-stage build for optimized image size
  - Hot-reload support via volume mounts
  - Health checks for service monitoring
  - Non-root user for security
  - Automatic restart on failure

### 2. **postgres** - PostgreSQL Database
- **Base Image**: `postgres:16-alpine`
- **Container Name**: `engine-test-postgres`
- **Port**: `5432` (mapped to host:5432)
- **Purpose**: Persistent data storage
- **Features**:
  - Persistent volume for data retention
  - Health checks for readiness
  - Support for initialization scripts in `docker/postgres/init/`
  - Configurable via environment variables

### 3. **redis** - Redis Cache
- **Base Image**: `redis:7-alpine`
- **Container Name**: `engine-test-redis`
- **Port**: `6379` (mapped to host:6379)
- **Purpose**: Caching and session storage
- **Features**:
  - AOF (Append-Only File) persistence enabled
  - LRU eviction policy with 256MB max memory
  - Optional password protection
  - Health checks for availability

### Network Configuration

All services communicate through a custom bridge network (`engine-test-network`) with subnet `172.28.0.0/16`, ensuring isolated and secure inter-service communication.

## Environment Variable Configuration

### Creating the `.env` File

Create a `.env` file in the project root with the following variables:

```bash
# Application
NODE_ENV=development
PORT=3000

# PostgreSQL Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=engine_test

# Redis Configuration
REDIS_PASSWORD=your_redis_password
```

### Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Application environment mode |
| `PORT` | `3000` | Application server port |
| `POSTGRES_USER` | `postgres` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password |
| `POSTGRES_DB` | `engine_test` | PostgreSQL database name |
| `REDIS_PASSWORD` | *(empty)* | Redis authentication password |

### Security Best Practices

- **Never commit `.env` files** to version control
- Use strong passwords for production environments
- Rotate credentials regularly
- Consider using Docker secrets for production deployments

## Accessing Logs and Container Management

### Viewing Logs

**View logs from all services**:
```bash
docker compose logs
```

**View logs from a specific service**:
```bash
docker compose logs app
docker compose logs postgres
docker compose logs redis
```

**Follow logs in real-time**:
```bash
docker compose logs -f app
```

**View last N lines of logs**:
```bash
docker compose logs --tail=100 app
```

**View logs with timestamps**:
```bash
docker compose logs -t app
```

### Executing Commands in Containers

**Execute interactive shell**:
```bash
# App container (sh shell in Alpine)
docker compose exec app sh

# PostgreSQL container
docker compose exec postgres sh

# Redis container
docker compose exec redis sh
```

**Run one-off commands**:
```bash
# Check Node.js version
docker compose exec app node --version

# Access PostgreSQL CLI
docker compose exec postgres psql -U postgres -d engine_test

# Access Redis CLI
docker compose exec redis redis-cli
```

**Run commands as root** (for troubleshooting):
```bash
docker compose exec -u root app sh
```

### Container Status and Health

**Check service status**:
```bash
docker compose ps
```

**Check detailed container info**:
```bash
docker inspect engine-test-app
```

**View resource usage**:
```bash
docker stats
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Either kill the process or change the port in docker-compose.yml
# Example: "3001:3000" maps host:3001 to container:3000
```

#### 2. Container Won't Start / Keeps Restarting

**Check logs for errors**:
```bash
docker compose logs app
```

**Common causes**:
- Missing dependencies: Rebuild with `docker compose build --no-cache`
- Database not ready: Wait for healthchecks or increase `start_period`
- Port conflicts: Check if ports are available

**Restart specific service**:
```bash
docker compose restart app
```

#### 3. Database Connection Issues

**Error**: `ECONNREFUSED` or `Connection refused`

**Solution**:
```bash
# Check if PostgreSQL is healthy
docker compose ps postgres

# Verify connection from app container
docker compose exec app ping postgres

# Check PostgreSQL logs
docker compose logs postgres

# Ensure DATABASE_URL uses service name 'postgres' not 'localhost'
```

#### 4. Permission Denied Errors

**Solution**:
```bash
# On Linux, fix volume permissions
sudo chown -R $USER:$USER ./src

# Or exec as root to fix inside container
docker compose exec -u root app chown -R appuser:appuser /app
```

#### 5. Disk Space Issues

**Error**: `no space left on device`

**Solution**:
```bash
# Remove unused images and containers
docker system prune -a

# Remove unused volumes (WARNING: deletes data)
docker volume prune

# Check disk usage
docker system df
```

#### 6. Image Build Failures

**Solution**:
```bash
# Clear build cache and rebuild
docker compose build --no-cache

# Check Docker daemon status
docker info

# Ensure .dockerignore is not blocking required files
```

#### 7. Hot-Reload Not Working

**Solution**:
```bash
# Verify volume mounts
docker compose ps

# Check if nodemon/watch is configured in package.json
docker compose exec app cat package.json

# Restart with fresh volumes
docker compose down && docker compose up -d
```

#### 8. Health Check Failing

**Debug health check**:
```bash
# Run health check command manually
docker compose exec app node -e "require('http').get('http://localhost:3000/health', (r) => { console.log('Status:', r.statusCode); })"

# Check if /health endpoint exists
docker compose exec app curl -v http://localhost:3000/health
```

### Useful Debugging Commands

```bash
# Reset everything (nuclear option)
docker compose down -v --remove-orphans
docker compose up -d --build

# View container networking
docker network inspect engine-test-network

# Copy files from container
docker compose cp app:/app/logs ./local-logs

# Check environment variables in container
docker compose exec app env

# Tail multiple logs simultaneously
docker compose logs -f app postgres redis
```

### Getting Help

If you encounter issues not covered here:

1. Check Docker daemon is running: `docker info`
2. Verify Docker Compose syntax: `docker compose config`
3. Review all logs: `docker compose logs --tail=200`
4. Check system resources: `docker stats`
5. Consult [Docker documentation](https://docs.docker.com/)

## Data Persistence

### Volumes

The application uses named Docker volumes for data persistence:

- **postgres-data**: Stores PostgreSQL database files
- **redis-data**: Stores Redis persistence files (AOF)

**List volumes**:
```bash
docker volume ls | grep engine-test
```

**Backup database volume**:
```bash
docker run --rm -v engine-test-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

**Restore database volume**:
```bash
docker run --rm -v engine-test-postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Development Workflow

### Local Development

1. **Start services**: `docker compose up -d`
2. **Make code changes** (hot-reload enabled for `/src`)
3. **View logs**: `docker compose logs -f app`
4. **Run tests**: `docker compose exec app npm test`
5. **Stop services**: `docker compose down`

### Production Build

Build optimized production image:
```bash
docker build -t engine-test:production --target runtime .
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)