# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@11.19.0 && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---
# Production image, copy only necessary files
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./

# Install drizzle-kit for migrations
RUN npm install -g drizzle-kit

# Copy only built output and production deps
COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/.drizzle ./.drizzle

ARG PORT=8080
ENV PORT ${PORT}

ARG NUXT_DATABASE_URL
ENV NUXT_DATABASE_URL ${NUXT_DATABASE_URL}

ARG NUXT_SESSION_PASSWORD
ENV NUXT_SESSION_PASSWORD ${NUXT_SESSION_PASSWORD}

ARG NUXT_OAUTH_KEYCLOAK_REALM
ARG NUXT_OAUTH_KEYCLOAK_SERVER_URL
ARG NUXT_OAUTH_KEYCLOAK_CLIENT_ID
ARG NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET
ARG NUXT_OAUTH_KEYCLOAK_REDIRECT_URI
ARG NUXT_STATISTICS_SHEET_ID
ARG NUXT_GOOGLE_CLIENT_EMAIL
ARG NUXT_GOOGLE_PRIVATE_KEY
ENV NUXT_OAUTH_KEYCLOAK_REALM ${NUXT_OAUTH_KEYCLOAK_REALM}
ENV NUXT_OAUTH_KEYCLOAK_SERVER_URL ${NUXT_OAUTH_KEYCLOAK_SERVER_URL}
ENV NUXT_OAUTH_KEYCLOAK_CLIENT_ID ${NUXT_OAUTH_KEYCLOAK_CLIENT_ID}
ENV NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET ${NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET}
ENV NUXT_OAUTH_KEYCLOAK_REDIRECT_URI ${NUXT_OAUTH_KEYCLOAK_REDIRECT_URI}
ENV NUXT_STATISTICS_SHEET_ID ${NUXT_STATISTICS_SHEET_ID}
ENV NUXT_GOOGLE_CLIENT_EMAIL ${NUXT_GOOGLE_CLIENT_EMAIL}
ENV NUXT_GOOGLE_PRIVATE_KEY ${NUXT_GOOGLE_PRIVATE_KEY}

# Run migrations before starting the app
EXPOSE ${PORT}
CMD npx drizzle-kit migrate && node .output/server/index.mjs