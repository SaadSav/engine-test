# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

# Add metadata labels
LABEL maintainer="engine-test"
LABEL description="Multi-stage Docker build for engine-test application"
LABEL version="1.0"

# Set working directory
WORKDIR /app

# Copy dependency files first for better layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application source
COPY . .

# Build application (if build step exists)
RUN if [ -f "package.json" ] && grep -q "\"build\"" package.json; then npm run build; fi

# Runtime stage
FROM node:20-alpine AS runtime

# Add metadata labels
LABEL maintainer="engine-test"
LABEL description="Runtime container for engine-test application"
LABEL version="1.0"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user and group
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Set working directory
WORKDIR /app

# Copy dependencies and built application from builder stage
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app .

# Switch to non-root user
USER appuser

# Expose application port (adjust as needed)
EXPOSE 3000

# Configure health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })" || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "index.js"]
